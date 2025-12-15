import axios from 'axios';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AiRecommendedMovie } from '@/types/discoverAi';
import { CuratorRecommendationResponse, CuratorSelection } from '@/types/curator';
import { CURATOR_PERSONAS } from '@/data/curators';

interface RequestBody {
    curatorId?: string;
    selected?: CuratorSelection[];
    previousTitles?: string[];
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

function isModernEnough(year?: number) {
    return typeof year === 'number' && year >= 1985;
}

function sanitizeJsonString(content: string): string {
    const withoutFences = content.replace(/```json/gi, '').replace(/```/g, '').trim();
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

function normalizeMovie(item: any): AiRecommendedMovie | null {
    const title = typeof item?.title === 'string' ? item.title.trim() : '';
    if (!title) return null;

    const release_year = parseYear(item.release_year);
    const vote_average =
        typeof item?.vote_average === 'number'
            ? item.vote_average
            : typeof item?.vote_average === 'string'
              ? Number.parseFloat(item.vote_average)
              : undefined;

    return {
        title,
        reason: typeof item?.reason === 'string' ? item.reason.trim() : undefined,
        poster_path: typeof item?.poster_path === 'string' ? item.poster_path : undefined,
        release_year: release_year,
        overview: typeof item?.overview === 'string' ? item.overview : undefined,
        vote_average: Number.isFinite(vote_average) ? vote_average : undefined,
    } satisfies AiRecommendedMovie;
}

function parseAiResponse(content: string): {
    curator_note: string;
    primary: AiRecommendedMovie | null;
    alternatives: AiRecommendedMovie[];
} {
    const cleaned = sanitizeJsonString(content);

    try {
        const parsed = JSON.parse(cleaned);

        const curateFromList = (list: any[]): { primary: AiRecommendedMovie | null; alternatives: AiRecommendedMovie[] } => {
            const normalized = list.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
            const primary = normalized[0] ?? null;
            const alternatives = normalized.slice(1, ALTERNATIVE_TARGET_MAX + 1);
            return { primary, alternatives };
        };

        if (Array.isArray(parsed)) {
            return { curator_note: '', ...curateFromList(parsed) };
        }

        const primary = normalizeMovie((parsed as any).primary) ?? null;
        const alternativesArray: any[] = Array.isArray((parsed as any).alternatives)
            ? (parsed as any).alternatives
            : Array.isArray((parsed as any).suggestions)
              ? (parsed as any).suggestions
              : [];

        const alternatives = alternativesArray
            .map(normalizeMovie)
            .filter(Boolean)
            .slice(0, ALTERNATIVE_TARGET_MAX) as AiRecommendedMovie[];

        if (!primary && Array.isArray(parsed)) {
            const fromArray = curateFromList(parsed as any);
            return { curator_note: String((parsed as any).curator_note ?? ''), ...fromArray };
        }

        return {
            curator_note: typeof (parsed as any).curator_note === 'string' ? (parsed as any).curator_note : '',
            primary,
            alternatives,
        };
    } catch (error) {
        console.error('Failed to parse AI curator response', error);
        return { curator_note: '', primary: null, alternatives: [] };
    }
}

interface TmdbMovieMeta {
    id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string | null;
    overview?: string | null;
    vote_average?: number | null;
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

        const exactYearMatch = releaseYear
            ? results.find(movie => movie.release_date?.startsWith(String(releaseYear)))
            : null;

        return exactYearMatch ?? results[0];
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
        release_year: movie.release_year ?? (Number.isFinite(releaseYearFromMeta) ? releaseYearFromMeta : undefined),
        overview: meta.overview ?? movie.overview,
        vote_average: typeof meta.vote_average === 'number' ? meta.vote_average : movie.vote_average,
    };
}

async function enrichRecommendations(primary: AiRecommendedMovie | null, alternatives: AiRecommendedMovie[]) {
    const enrichedPrimary = primary ? await enrichMovie(primary) : null;
    const enrichedAlternatives = await Promise.all(alternatives.map(enrichMovie));
    const validAlternatives = enrichedAlternatives.filter(Boolean) as AiRecommendedMovie[];
    return { primary: enrichedPrimary ?? null, alternatives: validAlternatives };
}

const normalizeTitle = (title: string) => title.trim().toLowerCase();

function buildPrompt({
    curator,
    selected,
    previousTitles,
    need,
    strict,
}: {
    curator: (typeof CURATOR_PERSONAS)[number];
    selected: CuratorSelection[];
    previousTitles: string[];
    need: number;
    strict?: boolean;
}) {
    const contextLines = selected.map(item => `- ${item.label} (${item.category})`).join('\n');
    const avoidTitles = previousTitles.slice(0, PREVIOUS_TITLES_MAX).join(', ');
    const avoidLines = avoidTitles
        ? `Do not recommend any of these titles: ${avoidTitles}.`
        : 'Avoid generic safe picks and overly common defaults.';

    return (
        `You are ${curator.name} ${curator.emoji} with a tone that is ${curator.tone}. Your style is ${curator.promptStyle}.\n\n` +
        `Context selections:\n${contextLines}\n\n` +
        `${avoidLines}\n` +
        `Recommend exactly ${need} films total. Only include films with release_year >= 1985; prefer 1995 or newer when possible. ` +
        `Movies must be recognizable/popular (no ultra-underground festival-only picks). Keep variety across decades and genres and avoid repeating the same director twice unless essential. ` +
        `Avoid repeating classic canon defaults every session (e.g., Fight Club, Shawshank, Inception) and avoid ultra-niche or hard-to-find titles. ` +
        `Prefer movies with strong TMDB presence and widely available/streamable options when possible. ` +
        `Return JSON with fields: {"curator_note": string, "primary": Movie, "alternatives": Movie[]} where Movie = {"title": string, "release_year": number, "reason"?: string}. ` +
        `Ensure at least ${ALTERNATIVE_TARGET_MIN} and at most ${ALTERNATIVE_TARGET_MAX} alternatives and exactly ${PRIMARY_TARGET} primary pick. ` +
        `Include at least one unconventional choice within mainstream/recognizable bounds, prefer diversity by decade and country when relevant, and penalize repeats from prior sessions. ` +
        `Respond with raw JSON only—no markdown, no commentary.${strict ? ' Output strictly valid JSON.' : ''}`
    );
}

async function requestCuratorBatch({
    curator,
    selected,
    previousTitles,
    strict,
}: {
    curator: (typeof CURATOR_PERSONAS)[number];
    selected: CuratorSelection[];
    previousTitles: string[];
    strict?: boolean;
}) {
    const userPrompt = buildPrompt({
        curator,
        selected,
        previousTitles,
        need: MOVIES_NUMBER_LIMIT,
        strict,
    });

    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content:
                    'You are an AI movie curator. Always respond with strict JSON and never include markdown or code fences. ' +
                    'Enforce persona tone in notes. Only include movies released in 1985 or later and prefer 1995-2025.',
            },
            { role: 'user', content: userPrompt },
        ],
    });

    return completion.choices?.[0]?.message?.content ?? '';
}

async function repairMovies({
    curator,
    selected,
    need,
    bannedTitles,
}: {
    curator: (typeof CURATOR_PERSONAS)[number];
    selected: CuratorSelection[];
    need: number;
    bannedTitles: string[];
}): Promise<AiRecommendedMovie[]> {
    const dedupedBanned = Array.from(new Set(bannedTitles.map(normalizeTitle)));
    const avoidList = dedupedBanned.slice(0, PREVIOUS_TITLES_MAX).join(', ');
    const userPrompt =
        `Return ONLY a JSON array of exactly ${need} movies. All release_year must be >= 1985 (prefer 1995-2025). ` +
        `Movies must be recognizable/popular and not obscure. Avoid repeating any of these titles: ${avoidList}. ` +
        `No markdown, no code fences.`;

    const completion = await openai!.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 1,
        messages: [
            {
                role: 'system',
                content:
                    `You are ${curator.name} ${curator.emoji}. Respond only with JSON arrays of movie objects {"title": string, "release_year": number, "reason"?: string}.`,
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

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY || !openai) {
        return NextResponse.json({ message: 'Missing OpenAI API key.' }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    const curatorId = body?.curatorId;
    const selected = body?.selected;
    const previousTitles = Array.isArray(body?.previousTitles)
        ? (body?.previousTitles.filter(item => typeof item === 'string') as string[])
        : [];

    if (!curatorId) {
        return NextResponse.json({ message: 'Please choose a curator persona.' }, { status: 400 });
    }

    if (!selected || !Array.isArray(selected) || selected.length === 0) {
        return NextResponse.json({ message: 'Please provide context selections.' }, { status: 400 });
    }

    const curator = CURATOR_PERSONAS.find(persona => persona.id === curatorId);

    if (!curator) {
        return NextResponse.json({ message: 'Unknown curator persona.' }, { status: 404 });
    }

    try {
        const initialContent = await requestCuratorBatch({ curator, selected, previousTitles });
        let { curator_note, primary, alternatives } = parseAiResponse(initialContent);

        if (!primary && alternatives.length === 0) {
            const strictContent = await requestCuratorBatch({ curator, selected, previousTitles, strict: true });
            ({ curator_note, primary, alternatives } = parseAiResponse(strictContent));
        }

        const combined: AiRecommendedMovie[] = [];
        if (primary) combined.push(primary);
        combined.push(...alternatives);

        const filtered = combined.filter(movie => isModernEnough(movie.release_year));

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
        let bannedTitles = [...previousTitles.map(normalizeTitle), ...curatedMovies.map(movie => normalizeTitle(movie.title))];

        if (curatedMovies.length < MOVIES_NUMBER_LIMIT) {
            const needed = MOVIES_NUMBER_LIMIT - curatedMovies.length;
            const repairs = await repairMovies({ curator, selected, need: needed, bannedTitles });
            const repairFiltered = repairs.filter(movie => isModernEnough(movie?.release_year));
            const repairDeduped = repairFiltered.filter(movie => {
                const key = normalizeTitle(movie.title);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
            curatedMovies = [...curatedMovies, ...repairDeduped].slice(0, MOVIES_NUMBER_LIMIT);
        }

        let resolvedPrimary = curatedMovies[0] ?? null;
        let fallbackAlternatives = curatedMovies.slice(1);

        const { primary: enrichedPrimary, alternatives: enrichedAlternatives } = await enrichRecommendations(
            resolvedPrimary,
            fallbackAlternatives,
        );

        // Drop items that failed TMDB validation
        const validAlternatives = enrichedAlternatives.filter(Boolean);
        const enrichedList = [enrichedPrimary, ...validAlternatives].filter(Boolean) as AiRecommendedMovie[];

        // Re-run repair if enrichment removed items
        if (enrichedList.length < MOVIES_NUMBER_LIMIT) {
            const need = MOVIES_NUMBER_LIMIT - enrichedList.length;
            bannedTitles = [...bannedTitles, ...enrichedList.map(movie => normalizeTitle(movie.title))];
            const repairs = await repairMovies({ curator, selected, need, bannedTitles });
            const filteredRepairs = repairs
                .filter(movie => isModernEnough(movie.release_year))
                .filter(movie => {
                    const key = normalizeTitle(movie.title);
                    if (seen.has(key) || bannedTitles.includes(key)) return false;
                    return true;
                })
                .slice(0, need);
            const reEnriched = await Promise.all(filteredRepairs.map(enrichMovie));
            const reEnrichedValid = reEnriched.filter(Boolean) as AiRecommendedMovie[];
            const merged = [...enrichedList, ...reEnrichedValid].slice(0, MOVIES_NUMBER_LIMIT);
            resolvedPrimary = merged[0] ?? null;
            fallbackAlternatives = merged.slice(1);
        } else {
            resolvedPrimary = enrichedList[0] ?? null;
            fallbackAlternatives = enrichedList.slice(1);
        }

        const payload: CuratorRecommendationResponse = {
            curator: {
                id: curator.id,
                name: curator.name,
                emoji: curator.emoji,
            },
            curator_note:
                curator_note ||
                (fallbackAlternatives.length + (resolvedPrimary ? 1 : 0) >= ALTERNATIVE_TARGET_MIN
                    ? 'Here is what I would line up for you tonight.'
                    : "Couldn't find enough modern matches—try different moods."),
            primary: resolvedPrimary,
            alternatives: fallbackAlternatives,
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
