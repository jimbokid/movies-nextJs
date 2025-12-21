import axios from 'axios';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AiRecommendedMovie, CuratorPersona } from '@/types/discoverAi';
import {
    CuratorRecommendationResponse,
    CuratorSelection,
    RatingMode,
    RefineMode,
    RefinePolicy,
    RefineStrategy,
} from '@/types/curator';
import { CURATOR_PERSONAS } from '@/data/curators';
import { getActiveMoodRules, MoodRule } from './moodRules';
import { REFINE_POLICIES } from '@/constants/curatorThinking';

interface RequestBody {
    curatorId?: CuratorPersona['id'];
    selected?: CuratorSelection[];
    previousTitles?: string[];
    refineMode?: RefineMode;
    mode?: 'full' | 'swap_primary' | 'swap_alternative';
    lockedTitles?: string[];
    rejectedTitles?: string[];
    targetTitle?: string;
    moodDrift?: {
        funSerious?: number;
        mainstreamIndie?: number;
        safeBold?: number;
    };
    baseSessionId?: string;
}

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.2';
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? 'https://api.themoviedb.org/3/';
const TMDB_LANGUAGE = process.env.TMDB_LANGUAGE ?? 'en-US';
const TMDB_REGION = process.env.TMDB_REGION ?? 'US';
const TMDB_INCLUDE_ADULT = process.env.TMDB_INCLUDE_ADULT ?? 'false';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const PRIMARY_TARGET = 1;
const ALTERNATIVE_TARGET_MIN = 3;
const ALTERNATIVE_TARGET_MAX = 6;
const MOVIES_NUMBER_LIMIT = PRIMARY_TARGET + ALTERNATIVE_TARGET_MAX;
const PREVIOUS_TITLES_MAX = 30;
const POPCORN_KEYWORDS = [
    'fun',
    'fast',
    'wild',
    'chaos',
    'explosions',
    'car',
    'racing',
    'buddy',
    'raunchy',
    'stupid',
    'dumb',
    'party',
    'teen',
    'high school',
    'guilty pleasure',
    'popcorn',
];
const POPCORN_GENRE_IDS = new Set([28, 35, 80, 53, 12, 36, 878, 10751, 16]);
const CURRENT_YEAR = new Date().getFullYear();
const POPULARITY_THRESHOLD = 25;
const VOTE_AVERAGE_THRESHOLD = 6.3;
const TMDB_GENRE_MAP = new Map<number, string>([
    [28, 'Action'],
    [12, 'Adventure'],
    [16, 'Animation'],
    [35, 'Comedy'],
    [80, 'Crime'],
    [99, 'Documentary'],
    [18, 'Drama'],
    [10751, 'Family'],
    [14, 'Fantasy'],
    [36, 'History'],
    [27, 'Horror'],
    [10402, 'Music'],
    [9648, 'Mystery'],
    [10749, 'Romance'],
    [878, 'Sci-Fi'],
    [10770, 'TV Movie'],
    [53, 'Thriller'],
    [10752, 'War'],
    [37, 'Western'],
]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCuratorSelection(value: unknown): value is CuratorSelection {
    if (!isRecord(value)) return false;
    return typeof value.label === 'string' && typeof value.category === 'string';
}

function isRefineMode(value: unknown): value is RefineMode {
    return (
        value === 'more_dark' ||
        value === 'more_fun' ||
        value === 'more_cozy' ||
        value === 'more_weird' ||
        value === 'more_action'
    );
}

const DEFAULT_RATING_POLICY: { mode: RatingMode; minRating: number } = {
    mode: 'soft',
    minRating: 6.2,
};

function normalizeTitleArray(list: unknown[]): string[] {
    return Array.isArray(list)
        ? list
              .filter(item => typeof item === 'string')
              .map(item => item.trim())
              .filter(Boolean)
        : [];
}

function clampCuratorNote(note?: string | null) {
    if (!note || typeof note !== 'string') return undefined;
    const trimmed = note.trim();
    if (!trimmed) return undefined;
    const sentences = trimmed.split(/(?<=[.!?])\s+/).slice(0, 2);
    return sentences.join(' ').slice(0, 320);
}

function isWithinYearRange(year: number | undefined, curator: CuratorPersona) {
    if (typeof year !== 'number') return false;
    const maxYear = curator.maxYear ?? CURRENT_YEAR;
    return year >= curator.minYear && year <= maxYear;
}

function isPopcornMovie(movie: AiRecommendedMovie) {
    const reason = movie.reason?.toLowerCase() ?? '';
    const hasKeyword = reason ? POPCORN_KEYWORDS.some(keyword => reason.includes(keyword)) : false;
    const hasGenre = Array.isArray(movie.genre_ids)
        ? movie.genre_ids.some(id => POPCORN_GENRE_IDS.has(id))
        : false;
    return hasKeyword || hasGenre;
}

function countPopcornMovies(movies: AiRecommendedMovie[]) {
    return movies.filter(isPopcornMovie).length;
}

function isPopcornEnough(movies: AiRecommendedMovie[]) {
    return countPopcornMovies(movies) >= 4;
}

function isPopularEnough(movie: AiRecommendedMovie) {
    const hasVote =
        typeof movie.vote_average === 'number' && movie.vote_average >= VOTE_AVERAGE_THRESHOLD;
    const hasPopularity =
        typeof movie.popularity === 'number' && movie.popularity >= POPULARITY_THRESHOLD;
    return hasVote || hasPopularity;
}

function hasMainstreamMomentum(movies: AiRecommendedMovie[]) {
    return movies.filter(isPopularEnough).length >= 4;
}

function normalizeGenreName(name: string) {
    return name.trim().toLowerCase();
}

function getGenreNames(movie: AiRecommendedMovie) {
    const ids = Array.isArray(movie.genre_ids) ? movie.genre_ids : [];

    return ids
        .map(id => TMDB_GENRE_MAP.get(id))
        .filter((value): value is string => Boolean(value))
        .map(normalizeGenreName);
}

function matchesMoodRule(movie: AiRecommendedMovie, rule: MoodRule) {
    const genreNames = getGenreNames(movie);
    const overviewText = `${movie.overview ?? ''} ${movie.reason ?? ''}`.toLowerCase();

    const hasExcludedGenre = rule.excludeGenres.some(exclude =>
        genreNames.some(name => name.includes(exclude.toLowerCase())),
    );
    if (hasExcludedGenre) return false;

    const hasExcludedKeyword = rule.excludeKeywords.some(keyword =>
        overviewText.includes(keyword.toLowerCase()),
    );
    if (hasExcludedKeyword) return false;

    return (
        rule.includeGenres.length === 0 ||
        rule.includeGenres.some(include =>
            genreNames.some(name => name.includes(include.toLowerCase())),
        )
    );
}

function validateMoodFit(movies: AiRecommendedMovie[], rules: MoodRule[]) {
    if (!rules.length) {
        return { invalidTitles: [] as string[], passCount: movies.length };
    }

    const invalidTitles: string[] = [];
    let passCount = 0;

    movies.forEach(movie => {
        const matchesAll = rules.every(rule => matchesMoodRule(movie, rule));
        if (matchesAll) {
            passCount += 1;
        } else {
            invalidTitles.push(movie.title);
        }
    });

    return { invalidTitles, passCount };
}

function sanitizeJsonString(content: string): string {
    const withoutFences = content
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
    const firstBrace = withoutFences.search(/[\[{]/);
    if (firstBrace === -1) return withoutFences;

    const sliced = withoutFences.slice(firstBrace);
    const lastBrace = Math.max(sliced.lastIndexOf('}'), sliced.lastIndexOf(']'));
    if (lastBrace !== -1) {
        return sliced.slice(0, lastBrace + 1);
    }
    return sliced;
}

function parseYear(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function normalizeMovie(item: unknown): AiRecommendedMovie | null {
    if (!isRecord(item)) return null;

    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) return null;

    const release_year = parseYear(item.release_year);
    const vote_average =
        typeof item.vote_average === 'number'
            ? item.vote_average
            : typeof item.vote_average === 'string'
              ? Number.parseFloat(item.vote_average)
              : undefined;
    const popularity =
        typeof item.popularity === 'number'
            ? item.popularity
            : typeof item.popularity === 'string'
              ? Number.parseFloat(item.popularity)
              : undefined;

    return {
        title,
        reason: typeof item.reason === 'string' ? item.reason.trim() : undefined,
        poster_path: typeof item.poster_path === 'string' ? item.poster_path : undefined,
        release_year,
        overview: typeof item.overview === 'string' ? item.overview : undefined,
        vote_average: Number.isFinite(vote_average) ? vote_average : undefined,
        popularity: Number.isFinite(popularity) ? popularity : undefined,
    } satisfies AiRecommendedMovie;
}

function parseAiResponse(content: string): {
    primary: AiRecommendedMovie | null;
    alternatives: AiRecommendedMovie[];
    curator_note?: string;
} {
    const cleaned = sanitizeJsonString(content);

    try {
        const parsed = JSON.parse(cleaned) as unknown;

        const curateFromList = (
            list: unknown[],
        ): { primary: AiRecommendedMovie | null; alternatives: AiRecommendedMovie[] } => {
            const normalized = list.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
            const primaryMovie = normalized[0] ?? null;
            const alternativesList = normalized.slice(1, ALTERNATIVE_TARGET_MAX + 1);
            return { primary: primaryMovie, alternatives: alternativesList };
        };

        if (Array.isArray(parsed)) {
            return { ...curateFromList(parsed) };
        }

        if (!isRecord(parsed)) {
            return { primary: null, alternatives: [] };
        }

        const primary = normalizeMovie(parsed.primary) ?? null;
        const alternativesArray: unknown[] = Array.isArray(parsed.alternatives)
            ? parsed.alternatives
            : Array.isArray(parsed.suggestions)
              ? parsed.suggestions
              : [];

        const alternatives = alternativesArray
            .map(normalizeMovie)
            .filter(Boolean)
            .slice(0, ALTERNATIVE_TARGET_MAX) as AiRecommendedMovie[];

        const curatorNote = clampCuratorNote(
            typeof parsed.curator_note === 'string' ? parsed.curator_note : undefined,
        );

        if (!primary && Array.isArray(parsed)) {
            const fromArray = curateFromList(parsed as unknown[]);
            return { ...fromArray, curator_note: curatorNote };
        }

        return {
            primary,
            alternatives,
            curator_note: curatorNote,
        };
    } catch (error) {
        console.error('Failed to parse AI curator response', error);
        return { primary: null, alternatives: [] };
    }
}

interface TmdbMovieMeta {
    id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string | null;
    overview?: string | null;
    vote_average?: number | null;
    genre_ids?: number[];
    popularity?: number | null;
}

async function searchTmdbMovie(title: string, releaseYear?: number): Promise<TmdbMovieMeta | null> {
    if (!TMDB_API_KEY) return null;

    try {
        const response = await axios.get(`${TMDB_API_PATH}search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                language: TMDB_LANGUAGE,
                region: TMDB_REGION,
                include_adult: TMDB_INCLUDE_ADULT,
                page: 1,
                query: title,
                year: releaseYear,
            },
        });

        const results: TmdbMovieMeta[] = Array.isArray(response.data?.results)
            ? response.data.results
            : [];

        if (results.length === 0) return null;

        return results[0];
    } catch (error) {
        console.error('TMDB lookup failed', error);
        return null;
    }
}

async function enrichMovie(movie: AiRecommendedMovie): Promise<AiRecommendedMovie | null> {
    if (!TMDB_API_KEY) return movie;

    const meta = await searchTmdbMovie(movie.title, movie.release_year);

    if (!meta) {
        // Treat as too obscure for curator experience
        return null;
    }

    const releaseYearFromMeta = meta.release_date
        ? Number.parseInt(meta.release_date.slice(0, 4), 10)
        : undefined;

    return {
        ...movie,
        tmdb_id: meta.id,
        poster_path: meta.poster_path ?? movie.poster_path,
        release_year:
            movie.release_year ??
            (Number.isFinite(releaseYearFromMeta) ? releaseYearFromMeta : undefined),
        overview: meta.overview ?? movie.overview,
        vote_average:
            typeof meta.vote_average === 'number' ? meta.vote_average : movie.vote_average,
        genre_ids: Array.isArray(meta.genre_ids) ? meta.genre_ids : movie.genre_ids,
        popularity: typeof meta.popularity === 'number' ? meta.popularity : movie.popularity,
    };
}

async function enrichRecommendations(
    primary: AiRecommendedMovie | null,
    alternatives: AiRecommendedMovie[],
) {
    const enrichedPrimary = primary ? await enrichMovie(primary) : null;
    const enrichedAlternatives = await Promise.all(alternatives.map(enrichMovie));
    const validAlternatives = enrichedAlternatives.filter(Boolean) as AiRecommendedMovie[];
    return { primary: enrichedPrimary ?? null, alternatives: validAlternatives };
}

const normalizeTitle = (title: string) => title.trim().toLowerCase();

function buildMoodRulesText(rules: MoodRule[], tasteBand: CuratorPersona['tasteBand']) {
    if (!rules.length) return '';

    const includeGenres = Array.from(
        new Set(rules.flatMap(rule => rule.includeGenres.map(normalizeGenreName))),
    ).join(', ');
    const excludeGenres = Array.from(
        new Set(rules.flatMap(rule => rule.excludeGenres.map(normalizeGenreName))),
    ).join(', ');
    const excludeKeywords = Array.from(
        new Set(rules.flatMap(rule => rule.excludeKeywords.map(keyword => keyword.toLowerCase()))),
    ).join(', ');
    const toneHints = rules.map(rule => `- ${rule.toneHint}`).join('\n');

    const popcornSpecific =
        tasteBand === 'popcorn'
            ? '\nIf mood includes fun/comfort, lean into mainstream comedies, action-comedies, romcoms, feel-good hits. Avoid prestige crime/thriller unless user explicitly asks for dark vibes.'
            : '';

    return (
        `Mood-fit rules (must follow):\n${toneHints}${popcornSpecific}\n` +
        `${includeGenres ? `Prefer genres: ${includeGenres}. ` : ''}` +
        `${excludeGenres ? `Avoid genres: ${excludeGenres}. ` : ''}` +
        `${excludeKeywords ? `Avoid themes/keywords: ${excludeKeywords}. ` : ''}` +
        'If unsure, choose the lighter, more popular option. Do not recommend movies that are primarily drama/thriller/crime when the mood is fun/comfort unless explicitly requested.'
    );
}

function buildMoodDriftText(moodDrift?: RequestBody['moodDrift']) {
    if (!moodDrift) return '';
    const parts: string[] = [];
    if (moodDrift.funSerious) {
        parts.push(
            moodDrift.funSerious > 0
                ? 'Lean slightly more serious/grounded; avoid overly goofy picks.'
                : 'Lean more playful/fun; avoid heavy or dour picks.',
        );
    }
    if (moodDrift.mainstreamIndie) {
        parts.push(
            moodDrift.mainstreamIndie > 0
                ? 'Favor mainstream accessibility and popularity.'
                : 'Favor indie/underseen energy while staying watchable.',
        );
    }
    if (moodDrift.safeBold) {
        parts.push(
            moodDrift.safeBold > 0
                ? 'Allow bolder/riskier stylistic swings.'
                : 'Keep things safer and widely appealing.',
        );
    }
    return parts.length ? `Mood drift guidance: ${parts.join(' ')}` : '';
}

function buildPersonaRules(curator: CuratorPersona, moodRules: MoodRule[]) {
    const anchors = [
        curator.personaBias ? `Persona bias: ${curator.personaBias}.` : '',
        curator.allowedGenres?.length
            ? `Prefer genres like ${curator.allowedGenres.join(', ')}.`
            : '',
        curator.avoidGenres?.length ? `Avoid genres like ${curator.avoidGenres.join(', ')}.` : '',
        curator.examplesGood.length
            ? `Output should feel like: ${curator.examplesGood.join(', ')}.`
            : '',
        curator.examplesAvoid.length
            ? `Avoid leaning toward: ${curator.examplesAvoid.join(', ')}.`
            : '',
    ]
        .filter(Boolean)
        .join('\n');

    switch (curator.tasteBand) {
        case 'popcorn':
            return `${anchors}\nYou are not a critic. Pick crowd-pleasers with big franchises, popular comedies, early 2000s energy, buddy cops, street racing, guilty pleasures, and weekend fun. Favor mainstream action/comedy/crime/adventure/thriller vibes. You are recommending for a regular guy who wants fun, fast, mainstream movies. Prefer box-office hits, franchises, viral or widely known films. Avoid slow, artsy, experimental, or festival-style movies. If unsure, choose the more popular option. ${
                moodRules.length
                    ? 'For fun/comfort vibes, lean extra hard into mainstream comedies, action-comedies, feel-good crowd-pleasers—no prestige crime unless the user explicitly asked for dark/crime.'
                    : ''
            }`;
        case 'auteur':
            return `${anchors}\nLean into director-forward, cinematic voices (think Tarantino/Villeneuve/Lynch adjacent). Use confident tone, bold opinions, and keep choices recognizable and muscular.`;
        case 'indie':
            return `${anchors}\nFavor recognizable festival-friendly indie energy (A24/Neon vibes), emotional textures, international voices, and thoughtful storytelling—still mainstream enough to be findable.`;
        case 'film_school':
            return `${anchors}\nSound analytical yet approachable—contextualize movements and influence. Include at most one modern canon/classic per list, keep everything watchable and engaging.`;
        default:
            return anchors;
    }
}

function buildBasePrompt({
    curator,
    selected,
    previousTitles,
    lockedTitles,
    rejectedTitles,
    moodDrift,
    mode,
    targetTitle,
    need,
    strict,
    moodRules,
}: {
    curator: CuratorPersona;
    selected: CuratorSelection[];
    previousTitles: string[];
    lockedTitles: string[];
    rejectedTitles: string[];
    moodDrift?: RequestBody['moodDrift'];
    mode: RequestBody['mode'];
    targetTitle?: string;
    need: number;
    strict?: boolean;
    moodRules: MoodRule[];
}) {
    const maxYear = curator.maxYear ?? CURRENT_YEAR;
    const preferredStart = curator.preferredStartYear ?? Math.max(curator.minYear, 1995);
    const moodRuleText = buildMoodRulesText(moodRules, curator.tasteBand);
    const moodDriftText = buildMoodDriftText(moodDrift);
    const personaText = buildPersonaRules(curator, moodRules);
    const contextLines = selected.map(item => `- ${item.label} (${item.category})`).join('\n');
    const avoidTitles = Array.from(new Set([...previousTitles, ...lockedTitles, ...rejectedTitles]))
        .slice(0, PREVIOUS_TITLES_MAX)
        .join(', ');
    const avoidLines = avoidTitles
        ? `Do not include any of these titles: ${avoidTitles}. If you would choose one, replace it.`
        : 'Avoid generic safe picks and overly common defaults.';
    const lockText = lockedTitles.length
        ? `Locked titles must remain unchanged. Do not propose replacements for them: ${lockedTitles.join(', ')}.`
        : '';
    const rejectedText = rejectedTitles.length
        ? `Users rejected/swapped these, avoid similar misfires: ${rejectedTitles.join(', ')}.`
        : '';
    const swapText =
        mode === 'swap_primary' || mode === 'swap_alternative'
            ? `You are replacing only the ${mode === 'swap_primary' ? 'primary' : 'alternative'} pick${
                  targetTitle ? ` (${targetTitle})` : ''
              }. Return exactly ${need} new movie for this slot, keep everything else intact.`
            : '';

    return (
        `You are ${curator.name} ${curator.emoji} with a tone that is ${curator.tone}. Your style is ${curator.promptStyle}.\n${personaText}\n\n` +
        `Context selections:\n${contextLines}\n\n` +
        `${moodRuleText ? `Mood constraints (hard rules):\n${moodRuleText}\n` : ''}` +
        `${moodDriftText ? `${moodDriftText}\n` : ''}` +
        `${lockText ? `${lockText}\n` : ''}` +
        `${rejectedText ? `${rejectedText}\n` : ''}` +
        `${swapText}\n` +
        `${avoidLines}\n` +
        `Recommend exactly ${need} films total. Only include films released between ${curator.minYear} and ${maxYear}. If any title falls outside this window, replace it. Prefer ${preferredStart} or newer when possible. ` +
        // `Movies must be recognizable/popular (no ultra-underground festival-only picks). Keep variety across decades and genres and avoid repeating the same director twice unless essential. ` +
        // `Avoid repeating classic canon defaults every session (e.g., Fight Club, Shawshank, Inception) and avoid ultra-niche or hard-to-find titles. Do-not-pick list based on mood is already in constraints; respect it. ` +
        `Prefer movies with strong TMDB presence and widely available/streamable options when possible. ` +
        `IMPORTANT OUTPUT RULES:\n` +
        `- Do NOT add explanations outside JSON.\n` +
        `- Do NOT exceed sentence limits.\n\n` +
        `Return JSON with fields: {"primary": Movie, "alternatives": Movie[]} where Movie = {"title": string, "release_year": number}. ` +
        `Ensure at least ${ALTERNATIVE_TARGET_MIN} and at most ${ALTERNATIVE_TARGET_MAX} alternatives and exactly ${PRIMARY_TARGET} primary pick. ` +
        `Include at least one unconventional choice within mainstream/recognizable bounds, prefer diversity by decade and country when relevant, and penalize repeats from prior sessions. ` +
        `If unsure, choose the more mainstream option. Respond with raw JSON only—no markdown, no commentary.${strict ? ' Output strictly valid JSON.' : ''}`
    );
}

function buildRefinePrompt({
    policy,
    curator,
    selected,
    previousTitles,
    lockedTitles,
    rejectedTitles,
    mode,
    targetTitle,
    need,
    moodRules,
    rejectedTooLight,
}: {
    policy: RefinePolicy;
    curator: CuratorPersona;
    selected: CuratorSelection[];
    previousTitles: string[];
    lockedTitles: string[];
    rejectedTitles: string[];
    mode: RequestBody['mode'];
    targetTitle?: string;
    need: number;
    moodRules: MoodRule[];
    rejectedTooLight?: string[];
}) {
    const maxYear = curator.maxYear ?? CURRENT_YEAR;
    const preferredStart =
        policy.maxYearWindowBias === 'newer'
            ? Math.max(curator.preferredStartYear ?? curator.minYear, CURRENT_YEAR - 10)
            : (curator.preferredStartYear ?? Math.max(curator.minYear, 1995));
    const contextLines = selected.map(item => `- ${item.label} (${item.category})`).join('\n');
    const avoidTitles = Array.from(
        new Set([
            ...previousTitles,
            ...lockedTitles,
            ...rejectedTitles,
            ...(rejectedTooLight ?? []),
        ]),
    )
        .slice(0, PREVIOUS_TITLES_MAX)
        .join(', ');
    const avoidLines = avoidTitles
        ? `Do not include any of these titles: ${avoidTitles}. If you would choose one, replace it.`
        : 'Avoid generic safe picks and overly common defaults.';
    const swapText =
        mode === 'swap_primary' || mode === 'swap_alternative'
            ? `You are replacing only the ${mode === 'swap_primary' ? 'primary' : 'alternative'} pick${
                  targetTitle ? ` (${targetTitle})` : ''
              }. Return exactly ${need} new movie for this slot, keep everything else intact.`
            : '';
    const moodFlavor = contextLines
        ? `You may use these as flavor only, but do not let them weaken the refine intent:\n${contextLines}\n`
        : '';
    const personaText =
        policy.strategy === 'override'
            ? 'Ignore curator taste preferences and prior constraints. Follow refine intent above all.'
            : `Blend with curator persona: ${buildPersonaRules(curator, moodRules)}.`;

    const refineLines = [
        `Refine intent: ${policy.label}. Strategy: ${policy.strategy}.`,
        `Tone rules (must follow):`,
        ...policy.toneRules.map(rule => `- ${rule}`),
        policy.hardAvoid.length
            ? `Hard avoid themes/keywords: ${policy.hardAvoid.join(', ')}.`
            : '',
        policy.allowedGenres?.length
            ? `Allowed/encouraged genres: ${policy.allowedGenres.join(', ')}.`
            : '',
        policy.avoidGenres?.length ? `Avoid genres: ${policy.avoidGenres.join(', ')}.` : '',
        policy.ratingMode === 'ignore'
            ? 'Do NOT filter out low-rated titles; polarizing picks are allowed.'
            : policy.ratingMode === 'soft'
              ? `Rating is a soft preference. If choosing between similar titles, pick the stronger or more popular one. Minimum suggested rating ${policy.minRating ?? 5.5}.`
              : `Drop anything below rating ${policy.minRating ?? 6}.`,
        'Avoid repeats from prior sessions.',
    ]
        .filter(Boolean)
        .join('\n');

    return (
        `${personaText}\n${refineLines}\n${moodFlavor}${avoidLines}\n${swapText}\n` +
        `Recommend exactly ${need} films total. Only include films released between ${curator.minYear} and ${maxYear}. Prefer ${preferredStart} or newer when possible, but keep recognizable and TMDB-resolvable choices. ` +
        `No playful, cozy, nostalgic, family-friendly, comedic, or adventure-forward picks for dark modes. Do not include "dark but fun" action comedies. ` +
        `IMPORTANT OUTPUT RULES:\n` +
        `- Do NOT add explanations outside JSON.\n` +
        `- Return JSON only with fields: {"primary": Movie, "alternatives": Movie[]} where Movie = {"title": string, "release_year": number}.\n` +
        `- Ensure exactly ${PRIMARY_TARGET} primary and between ${ALTERNATIVE_TARGET_MIN}-${ALTERNATIVE_TARGET_MAX} alternatives.\n` +
        `- Respond with raw JSON only—no markdown, no commentary.`
    );
}

async function requestCuratorBatch({
    curator,
    userPrompt,
    strategy,
}: {
    curator: CuratorPersona;
    userPrompt: string;
    strategy?: RefineStrategy;
}) {
    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content:
                    'You are an AI movie curator. Always respond with strict JSON and never include markdown or code fences. ' +
                    `${strategy === 'override' ? 'Ignore previous persona preferences if they conflict with refine intent. ' : 'Enforce persona tone in notes. '}` +
                    `Only include movies released between ${curator.minYear} and ${curator.maxYear ?? CURRENT_YEAR} and prefer modern picks. `,
            },
            { role: 'user', content: userPrompt },
        ],
    });

    return completion.choices?.[0]?.message?.content ?? '';
}

async function repairMovies({
    curator,
    need,
    bannedTitles,
    moodRules,
}: {
    curator: CuratorPersona;
    selected: CuratorSelection[];
    need: number;
    bannedTitles: string[];
    moodRules: MoodRule[];
}): Promise<AiRecommendedMovie[]> {
    const dedupedBanned = Array.from(new Set(bannedTitles.map(normalizeTitle)));
    const avoidList = dedupedBanned.slice(0, PREVIOUS_TITLES_MAX).join(', ');
    const moodRuleText = buildMoodRulesText(moodRules, curator.tasteBand);
    const userPrompt =
        `Return ONLY a JSON array of exactly ${need} movies. Only include films released between ${curator.minYear} and ${
            curator.maxYear ?? CURRENT_YEAR
        } (prefer modern picks). ` +
        `${moodRuleText}\n` +
        `Avoid repeating any of these titles: ${avoidList}. ` +
        `Stay consistent with the ${curator.name} persona: ${curator.personaBias ?? curator.promptStyle}. If unsure, choose the more mainstream option. ` +
        `No markdown, no code fences.`;

    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content: `You are ${curator.name} ${curator.emoji}. Respond only with JSON arrays of movie objects {"title": string, "release_year": number, "reason"?: string}.`,
            },
            { role: 'user', content: userPrompt },
        ],
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    const sanitized = sanitizeJsonString(content);

    try {
        const parsed = JSON.parse(sanitized);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
    } catch (error) {
        console.error('Failed to repair curator movies', error);
        return [];
    }
}

async function repairPopcornMovies({
    curator,
    selected,
    replaceTitles,
    bannedTitles,
    moodRules,
}: {
    curator: CuratorPersona;
    selected: CuratorSelection[];
    replaceTitles: string[];
    bannedTitles: string[];
    moodRules: MoodRule[];
}): Promise<AiRecommendedMovie[]> {
    const avoidList = Array.from(new Set([...replaceTitles, ...bannedTitles].map(normalizeTitle)))
        .slice(0, PREVIOUS_TITLES_MAX)
        .join(', ');
    const contextLines = selected.map(item => `- ${item.label} (${item.category})`).join('\n');

    const moodRuleText = buildMoodRulesText(moodRules, curator.tasteBand);
    const userPrompt =
        `Replace these titles with mainstream popcorn crowd-pleasers: ${replaceTitles.join(', ')}. ` +
        `Return ONLY a JSON array of exactly ${replaceTitles.length} movies. Only include films released between ${curator.minYear} and ${
            curator.maxYear ?? CURRENT_YEAR
        } (prefer modern picks). ` +
        `${moodRuleText}\n` +
        `Favor big franchises, street racing, buddy cop, raunchy/teen comedy, heist, disaster, superhero, or wild fun vibes. ` +
        `Avoid slow cinema, art-house festival picks, and experimental tone. Avoid any of these titles: ${avoidList}. ` +
        `Context selections to consider:\n${contextLines}. If unsure, pick the more mainstream/fun option. No markdown, no code fences.`;

    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content:
                    'You are a popcorn-loving movie buddy. Respond only with JSON arrays of movies {"title": string, "release_year": number, "reason"?: string}. Keep it fun.',
            },
            { role: 'user', content: userPrompt },
        ],
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    const sanitized = sanitizeJsonString(content);

    try {
        const parsed = JSON.parse(sanitized);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
    } catch (error) {
        console.error('Failed to repair popcorn movies', error);
        return [];
    }
}

async function repairPopcornPopularity({
    curator,
    selected,
    replaceTitles,
    bannedTitles,
    moodRules,
}: {
    curator: CuratorPersona;
    selected: CuratorSelection[];
    replaceTitles: string[];
    bannedTitles: string[];
    moodRules: MoodRule[];
}): Promise<AiRecommendedMovie[]> {
    const avoidList = Array.from(new Set([...replaceTitles, ...bannedTitles].map(normalizeTitle)))
        .slice(0, PREVIOUS_TITLES_MAX)
        .join(', ');
    const contextLines = selected.map(item => `- ${item.label} (${item.category})`).join('\n');

    const moodRuleText = buildMoodRulesText(moodRules, curator.tasteBand);
    const userPrompt =
        `Replace these titles with mainstream, popular popcorn hits: ${replaceTitles.join(', ')}. ` +
        `Return ONLY a JSON array of exactly ${replaceTitles.length} movies released between ${curator.minYear} and ${
            curator.maxYear ?? CURRENT_YEAR
        }. Prefer box-office hits, franchises, viral comedies, crowd-pleasing thrillers. ` +
        `${moodRuleText}\n` +
        `At least ${Math.min(4, replaceTitles.length)} should be widely known with strong ratings or popularity. Avoid any of these titles: ${avoidList}. ` +
        `Context selections to consider:\n${contextLines}. Respond with JSON only, no markdown or code fences.`;

    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content:
                    'You are a mainstream popcorn recommender. Respond only with JSON arrays of movies {"title": string, "release_year": number, "reason"?: string}.',
            },
            { role: 'user', content: userPrompt },
        ],
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    const sanitized = sanitizeJsonString(content);

    try {
        const parsed = JSON.parse(sanitized);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
    } catch (error) {
        console.error('Failed to repair popcorn popularity', error);
        return [];
    }
}

async function repairMoodMovies({
    curator,
    selected,
    replaceTitles,
    bannedTitles,
    moodRules,
}: {
    curator: CuratorPersona;
    selected: CuratorSelection[];
    replaceTitles: string[];
    bannedTitles: string[];
    moodRules: MoodRule[];
}): Promise<AiRecommendedMovie[]> {
    if (!replaceTitles.length || !moodRules.length) return [];

    const avoidList = Array.from(new Set([...replaceTitles, ...bannedTitles].map(normalizeTitle)))
        .slice(0, PREVIOUS_TITLES_MAX)
        .join(', ');
    const contextLines = selected.map(item => `- ${item.label} (${item.category})`).join('\n');
    const moodRuleText = buildMoodRulesText(moodRules, curator.tasteBand);

    const userPrompt =
        `Your previous suggestions included movies that did not fit the mood. Replace ONLY these titles: ${replaceTitles.join(', ')}. ` +
        `Return ONLY a JSON array of exactly ${replaceTitles.length} movies released between ${curator.minYear} and ${
            curator.maxYear ?? CURRENT_YEAR
        }. ` +
        `${moodRuleText}\n` +
        `Avoid any of these titles: ${avoidList}. Context selections:\n${contextLines}. Respond strictly with JSON.`;

    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content:
                    'You are an AI movie curator. Respond only with JSON arrays of {"title": string, "release_year": number, "reason"?: string}.',
            },
            { role: 'user', content: userPrompt },
        ],
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    const sanitized = sanitizeJsonString(content);

    try {
        const parsed = JSON.parse(sanitized);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
    } catch (error) {
        console.error('Failed to repair mood-fit movies', error);
        return [];
    }
}

async function enforcePopcornBias({
    movies,
    curator,
    selected,
    previousTitles,
    moodRules,
}: {
    movies: AiRecommendedMovie[];
    curator: CuratorPersona;
    selected: CuratorSelection[];
    previousTitles: string[];
    moodRules: MoodRule[];
}): Promise<AiRecommendedMovie[]> {
    let workingList = [...movies];

    if (!hasMainstreamMomentum(workingList)) {
        const weak = workingList.filter(movie => !isPopularEnough(movie));
        const replaceCount = Math.min(
            Math.max(4 - workingList.filter(isPopularEnough).length, 2),
            weak.length || MOVIES_NUMBER_LIMIT,
        );

        if (replaceCount > 0) {
            const replaceTitles = weak.slice(0, replaceCount).map(movie => movie.title);
            const bannedTitles = [
                ...previousTitles.map(normalizeTitle),
                ...workingList.map(movie => normalizeTitle(movie.title)),
                ...replaceTitles.map(normalizeTitle),
            ];

            const repairs = await repairPopcornPopularity({
                curator,
                selected,
                replaceTitles,
                bannedTitles,
                moodRules,
            });

            const baseList = workingList.filter(movie => !replaceTitles.includes(movie.title));
            const seen = new Set(baseList.map(movie => normalizeTitle(movie.title)));

            const filteredRepairs = repairs
                .filter(movie => isWithinYearRange(movie.release_year, curator))
                .filter(movie => {
                    const key = normalizeTitle(movie.title);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                })
                .slice(0, replaceCount);

            const enriched = await Promise.all(filteredRepairs.map(enrichMovie));
            const validRepairs = enriched.filter(Boolean) as AiRecommendedMovie[];

            const fallbackShortage = replaceCount - validRepairs.length;
            const fallbackMovies = fallbackShortage > 0 ? weak.slice(0, fallbackShortage) : [];

            workingList = [...baseList, ...validRepairs, ...fallbackMovies].slice(
                0,
                MOVIES_NUMBER_LIMIT,
            );
        }
    }

    if (isPopcornEnough(workingList)) return workingList;

    const notPopcorn = workingList.filter(movie => !isPopcornMovie(movie));
    const replaceCount = Math.min(
        Math.max(4 - countPopcornMovies(workingList), 2),
        notPopcorn.length || MOVIES_NUMBER_LIMIT,
    );
    if (replaceCount === 0) return workingList;

    const replaceTitles = notPopcorn.slice(0, replaceCount).map(movie => movie.title);
    const bannedTitles = [
        ...previousTitles.map(normalizeTitle),
        ...workingList.map(movie => normalizeTitle(movie.title)),
        ...replaceTitles.map(normalizeTitle),
    ];

    const repairs = await repairPopcornMovies({
        curator,
        selected,
        replaceTitles,
        bannedTitles,
        moodRules,
    });

    const baseList = workingList.filter(movie => !replaceTitles.includes(movie.title));
    const seen = new Set(baseList.map(movie => normalizeTitle(movie.title)));

    const filteredRepairs = repairs
        .filter(movie => isWithinYearRange(movie.release_year, curator))
        .filter(movie => {
            const key = normalizeTitle(movie.title);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, replaceCount);

    const enriched = await Promise.all(filteredRepairs.map(enrichMovie));
    const validRepairs = enriched.filter(Boolean) as AiRecommendedMovie[];

    const fallbackShortage = replaceCount - validRepairs.length;
    const fallbackMovies = fallbackShortage > 0 ? notPopcorn.slice(0, fallbackShortage) : [];

    return [...baseList, ...validRepairs, ...fallbackMovies].slice(0, MOVIES_NUMBER_LIMIT);
}

function applyRatingPolicy(
    movies: AiRecommendedMovie[],
    ratingMode: RatingMode,
    minRating = DEFAULT_RATING_POLICY.minRating,
    limit = MOVIES_NUMBER_LIMIT,
) {
    if (ratingMode === 'ignore') {
        return { kept: movies.slice(0, limit), removed: [] as AiRecommendedMovie[] };
    }

    if (ratingMode === 'strict') {
        const kept = movies.filter(movie => (movie.vote_average ?? 0) >= minRating).slice(0, limit);
        const keptTitles = new Set(kept.map(movie => normalizeTitle(movie.title)));
        const removed = movies.filter(movie => !keptTitles.has(normalizeTitle(movie.title)));
        return { kept, removed };
    }

    const kept = movies.slice(0, limit);
    const keptTitles = new Set(kept.map(movie => normalizeTitle(movie.title)));
    const removed = movies.filter(movie => !keptTitles.has(normalizeTitle(movie.title)));
    return { kept, removed };
}

function isTooLightForDark(overview?: string) {
    if (!overview) return false;
    const text = overview.toLowerCase();
    const rejectKeywords = [
        'family',
        'kids',
        'heartwarming',
        'friendship',
        'hilarious',
        'adventure',
        'magical',
        'animated',
    ];
    const acceptKeywords = [
        'murder',
        'serial killer',
        'abduction',
        'trauma',
        'revenge',
        'disturbing',
        'nihilistic',
        'dread',
        'haunting',
        'psychological',
    ];

    const hasAccept = acceptKeywords.some(keyword => text.includes(keyword));
    const hasReject = rejectKeywords.some(keyword => text.includes(keyword));

    return hasReject && !hasAccept;
}

function applyDarknessSanity(movies: AiRecommendedMovie[]) {
    const kept: AiRecommendedMovie[] = [];
    const removed: AiRecommendedMovie[] = [];

    movies.forEach(movie => {
        if (isTooLightForDark(movie.overview ?? movie.reason)) {
            removed.push(movie);
        } else {
            kept.push(movie);
        }
    });

    return { kept, removed };
}

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY || !openai) {
        return NextResponse.json({ message: 'Missing OpenAI API key.' }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    const curatorId = body?.curatorId;
    const selectedRaw = Array.isArray(body?.selected) ? body.selected : [];
    const selected = selectedRaw.filter(isCuratorSelection);
    const previousTitles = normalizeTitleArray(body?.previousTitles ?? []);
    const lockedTitles = normalizeTitleArray(body?.lockedTitles ?? []);
    const rejectedTitles = normalizeTitleArray(body?.rejectedTitles ?? []);
    const refineMode = isRefineMode(body?.refineMode) ? body?.refineMode : undefined;
    const refinePolicy = refineMode ? REFINE_POLICIES[refineMode] : null;
    const mode: RequestBody['mode'] =
        body?.mode === 'swap_primary' || body?.mode === 'swap_alternative' ? body.mode : 'full';
    const targetTitle = typeof body?.targetTitle === 'string' ? body.targetTitle : undefined;
    const moodDrift = body?.moodDrift
        ? {
              funSerious: Number.isFinite(body.moodDrift.funSerious)
                  ? Math.max(-1, Math.min(1, Number(body.moodDrift.funSerious)))
                  : 0,
              mainstreamIndie: Number.isFinite(body.moodDrift.mainstreamIndie)
                  ? Math.max(-1, Math.min(1, Number(body.moodDrift.mainstreamIndie)))
                  : 0,
              safeBold: Number.isFinite(body.moodDrift.safeBold)
                  ? Math.max(-1, Math.min(1, Number(body.moodDrift.safeBold)))
                  : 0,
          }
        : undefined;

    if (!curatorId) {
        return NextResponse.json({ message: 'Please choose a curator persona.' }, { status: 400 });
    }

    const curator = CURATOR_PERSONAS.find(persona => persona.id === curatorId);
    const activeMoodRules =
        refinePolicy?.strategy === 'override'
            ? []
            : getActiveMoodRules(selected.map(choice => choice.label));

    if (!curator) {
        return NextResponse.json({ message: 'Unknown curator persona.' }, { status: 404 });
    }

    try {
        const personaMinYear = curator.minYear;
        const persona: CuratorPersona = { ...curator, minYear: personaMinYear };
        const need =
            mode === 'swap_primary' || mode === 'swap_alternative' ? 1 : MOVIES_NUMBER_LIMIT;
        let resolvedPrimary: AiRecommendedMovie | null = null;
        let fallbackAlternatives: AiRecommendedMovie[] = [];
        let darkRetryUsed = false;
        let tooLightTitles: string[] = [];

        for (let attempt = 0; attempt < 2; attempt++) {
            const userPrompt = refinePolicy
                ? buildRefinePrompt({
                      policy: refinePolicy,
                      curator: persona,
                      selected,
                      previousTitles,
                      lockedTitles,
                      rejectedTitles,
                      mode,
                      targetTitle,
                      need,
                      moodRules: activeMoodRules,
                      rejectedTooLight: darkRetryUsed ? tooLightTitles : undefined,
                  })
                : buildBasePrompt({
                      curator: persona,
                      selected,
                      previousTitles,
                      lockedTitles,
                      rejectedTitles,
                      moodDrift,
                      mode,
                      targetTitle,
                      need,
                      moodRules: activeMoodRules,
                  });

            const initialContent = await requestCuratorBatch({
                curator: persona,
                userPrompt,
                strategy: refinePolicy?.strategy,
            });
            let parsed = parseAiResponse(initialContent);

            if (!parsed.primary && parsed.alternatives.length === 0) {
                const strictContent = await requestCuratorBatch({
                    curator: persona,
                    userPrompt,
                    strategy: refinePolicy?.strategy,
                });
                parsed = parseAiResponse(strictContent);
            }

            const combined: AiRecommendedMovie[] = [];
            if (parsed.primary) combined.push(parsed.primary);
            combined.push(...parsed.alternatives);

            const filtered = combined.filter(movie =>
                isWithinYearRange(movie.release_year, persona),
            );

            const deduped: AiRecommendedMovie[] = [];
            const seen = new Set<string>();
            filtered.forEach(movie => {
                const key = normalizeTitle(movie.title);
                if (!seen.has(key)) {
                    deduped.push(movie);
                    seen.add(key);
                }
            });

            let curatedMovies = deduped.slice(0, MOVIES_NUMBER_LIMIT);
            let bannedTitles = [
                ...previousTitles.map(normalizeTitle),
                ...curatedMovies.map(movie => normalizeTitle(movie.title)),
            ];

            if (curatedMovies.length < MOVIES_NUMBER_LIMIT) {
                const needed = MOVIES_NUMBER_LIMIT - curatedMovies.length;
                const repairs = await repairMovies({
                    curator: persona,
                    selected,
                    need: needed,
                    bannedTitles,
                    moodRules: activeMoodRules,
                });
                const repairFiltered = repairs.filter(movie =>
                    isWithinYearRange(movie?.release_year, persona),
                );
                const repairDeduped = repairFiltered.filter(movie => {
                    const key = normalizeTitle(movie.title);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                curatedMovies = [...curatedMovies, ...repairDeduped].slice(0, MOVIES_NUMBER_LIMIT);
            }

            const { primary: enrichedPrimary, alternatives: enrichedAlternatives } =
                await enrichRecommendations(curatedMovies[0] ?? null, curatedMovies.slice(1));

            // Drop items that failed TMDB validation
            const validAlternatives = enrichedAlternatives.filter(Boolean);
            let enrichedList = [enrichedPrimary, ...validAlternatives].filter(
                Boolean,
            ) as AiRecommendedMovie[];

            // Re-run repair if enrichment removed items
            if (enrichedList.length < MOVIES_NUMBER_LIMIT) {
                const needMore = MOVIES_NUMBER_LIMIT - enrichedList.length;
                bannedTitles = [
                    ...bannedTitles,
                    ...enrichedList.map(movie => normalizeTitle(movie.title)),
                ];
                const repairs = await repairMovies({
                    curator: persona,
                    selected,
                    need: needMore,
                    bannedTitles,
                    moodRules: activeMoodRules,
                });
                const filteredRepairs = repairs
                    .filter(movie => isWithinYearRange(movie.release_year, persona))
                    .filter(movie => {
                        const key = normalizeTitle(movie.title);
                        return !(seen.has(key) || bannedTitles.includes(key));
                    })
                    .slice(0, needMore);
                const reEnriched = await Promise.all(filteredRepairs.map(enrichMovie));
                const reEnrichedValid = reEnriched.filter(Boolean) as AiRecommendedMovie[];
                enrichedList = [...enrichedList, ...reEnrichedValid].slice(0, MOVIES_NUMBER_LIMIT);
            }

            if (refinePolicy?.mode === 'more_dark') {
                const { kept, removed } = applyDarknessSanity(enrichedList);
                if (
                    removed.length &&
                    kept.length < PRIMARY_TARGET + ALTERNATIVE_TARGET_MIN &&
                    !darkRetryUsed
                ) {
                    tooLightTitles = removed.map(movie => movie.title);
                    darkRetryUsed = true;
                    continue;
                }
                enrichedList = kept;
            }

            const { kept: ratedList } = applyRatingPolicy(
                enrichedList,
                refinePolicy?.ratingMode ?? DEFAULT_RATING_POLICY.mode,
                refinePolicy?.minRating ?? DEFAULT_RATING_POLICY.minRating,
                MOVIES_NUMBER_LIMIT,
            );

            let workingList = ratedList;

            if (persona.tasteBand === 'popcorn' && refinePolicy?.strategy !== 'override') {
                workingList = await enforcePopcornBias({
                    movies: workingList,
                    curator: persona,
                    selected,
                    previousTitles,
                    moodRules: activeMoodRules,
                });
            }

            if (activeMoodRules.length) {
                const { invalidTitles, passCount } = validateMoodFit(workingList, activeMoodRules);
                const requiredPass = Math.min(5, workingList.length);
                const shouldRepair = invalidTitles.length > 0 || passCount < requiredPass;

                if (shouldRepair) {
                    const replaceCount = Math.min(
                        MOVIES_NUMBER_LIMIT,
                        Math.max(invalidTitles.length, Math.max(requiredPass - passCount, 1)),
                    );
                    const replaceTitles = invalidTitles.length
                        ? invalidTitles
                        : workingList.slice(-replaceCount).map(movie => movie.title);
                    const replaceSet = new Set(replaceTitles.map(normalizeTitle));
                    const baseList = workingList.filter(
                        movie => !replaceSet.has(normalizeTitle(movie.title)),
                    );
                    const avoided = Array.from(
                        new Set([...bannedTitles, ...Array.from(replaceSet)]),
                    );
                    const repairs = await repairMoodMovies({
                        curator: persona,
                        selected,
                        replaceTitles,
                        bannedTitles: avoided,
                        moodRules: activeMoodRules,
                    });
                    const filteredRepairs = repairs
                        .filter(movie => isWithinYearRange(movie.release_year, persona))
                        .filter(movie => {
                            const key = normalizeTitle(movie.title);
                            if (replaceSet.has(key)) return true;
                            return !bannedTitles.includes(key);
                        })
                        .slice(0, replaceCount);

                    const enrichedRepairs = await Promise.all(filteredRepairs.map(enrichMovie));
                    const validRepairs = enrichedRepairs.filter(Boolean) as AiRecommendedMovie[];
                    const seenMood = new Set(baseList.map(movie => normalizeTitle(movie.title)));
                    const dedupedRepairs = validRepairs.filter(movie => {
                        const key = normalizeTitle(movie.title);
                        if (seenMood.has(key)) return false;
                        seenMood.add(key);
                        return true;
                    });

                    workingList = [...baseList, ...dedupedRepairs].slice(0, MOVIES_NUMBER_LIMIT);
                }
            }

            resolvedPrimary = workingList[0] ?? null;
            fallbackAlternatives = workingList.slice(1);
            break;
        }

        const payload: CuratorRecommendationResponse = {
            curator: {
                id: persona.id,
                name: persona.name,
                emoji: persona.emoji,
            },
            primary: resolvedPrimary,
            alternatives: fallbackAlternatives,
            curator_note: '',
        };

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        const status = (error as { status?: number })?.status;
        const message =
            status === 429
                ? 'AI quota reached. Please check your OpenAI plan or try again later.'
                : 'Unexpected error generating curator session.';

        console.error('AI curator route failed', error);
        return NextResponse.json(
            { message },
            { status: status && status >= 400 && status < 600 ? status : 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
