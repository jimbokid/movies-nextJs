import axios from 'axios';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CURATORS, DEFAULT_CURATOR_ID } from '@/data/curators';
import {
    AiCuratorResponse,
    AiRecommendedMovie,
    CuratorId,
    CuratorPersona,
    SelectedBadge,
} from '@/types/discoverAi';
import { sanitizeJson, safeExtractJsonObject } from '@/utils/aiJson';

interface RequestBody {
    curatorId?: CuratorId;
    selected?: SelectedBadge[];
    previousTitles?: string[];
}

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? 'https://api.themoviedb.org/3/';
const TMDB_LANGUAGE = process.env.TMDB_LANGUAGE ?? 'en-US';
const TMDB_REGION = process.env.TMDB_REGION ?? 'US';
const TMDB_INCLUDE_ADULT = process.env.TMDB_INCLUDE_ADULT ?? 'false';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const MOVIES_NUMBER_LIMIT = 6;
const tmdbSearchCache = new Map<string, TmdbMovieMeta | null>();

interface TmdbMovieMeta {
    id: number;
    title: string;
    poster_path?: string | null;
    release_date?: string | null;
    overview?: string | null;
    vote_average?: number | null;
}

function normalizeMovie(item: unknown): AiRecommendedMovie | null {
    if (!item || typeof item !== 'object') return null;
    const movie = item as Record<string, unknown>;

    const releaseYear = movie.release_year;
    const parsedYear =
        typeof releaseYear === 'number'
            ? releaseYear
            : typeof releaseYear === 'string'
              ? Number.parseInt(releaseYear, 10)
              : undefined;

    const parsedRating =
        typeof movie.vote_average === 'number'
            ? movie.vote_average
            : typeof movie.vote_average === 'string'
              ? Number.parseFloat(movie.vote_average)
              : undefined;

    const title = typeof movie.title === 'string' ? movie.title.trim() : '';

    if (!title) return null;

    return {
        title,
        reason: typeof movie.reason === 'string' ? movie.reason.trim() : undefined,
        poster_path: typeof movie.poster_path === 'string' ? movie.poster_path : undefined,
        release_year: Number.isFinite(parsedYear) ? parsedYear : undefined,
        overview: typeof movie.overview === 'string' ? movie.overview : undefined,
        vote_average: Number.isFinite(parsedRating) ? parsedRating : undefined,
    } satisfies AiRecommendedMovie;
}

function emptyCuratorResponse(curator: CuratorPersona): AiCuratorResponse {
    return {
        curator: { id: curator.id, name: curator.name, emoji: curator.emoji },
        curator_note: '',
        primary: null,
        alternatives: [],
    };
}

function parseCuratorResponse(content: string, fallbackCurator: CuratorPersona): AiCuratorResponse | null {
    const parsed = safeExtractJsonObject(content);

    if (!parsed || typeof parsed !== 'object') {
        return null;
    }

    if (Array.isArray(parsed)) {
        const movies = parsed.map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
        const primary = movies[0] ?? null;
        const alternatives = movies.slice(1, MOVIES_NUMBER_LIMIT);
        return {
            ...emptyCuratorResponse(fallbackCurator),
            primary,
            alternatives,
        };
    }

    const data = parsed as Record<string, unknown>;

    if (Array.isArray(data.movies)) {
        const movies = (data.movies as unknown[]).map(normalizeMovie).filter(Boolean) as AiRecommendedMovie[];
        return {
            ...emptyCuratorResponse(fallbackCurator),
            primary: movies[0] ?? null,
            alternatives: movies.slice(1, MOVIES_NUMBER_LIMIT),
        };
    }

    const curatorField = data.curator;
    const curator =
        curatorField && typeof curatorField === 'object'
            ? {
                  id: (curatorField as Record<string, unknown>).id ?? fallbackCurator.id,
                  name:
                      typeof (curatorField as Record<string, unknown>).name === 'string'
                          ? (curatorField as Record<string, unknown>).name
                          : fallbackCurator.name,
                  emoji:
                      typeof (curatorField as Record<string, unknown>).emoji === 'string'
                          ? (curatorField as Record<string, unknown>).emoji
                          : fallbackCurator.emoji,
              }
            : { id: fallbackCurator.id, name: fallbackCurator.name, emoji: fallbackCurator.emoji };

    const primary = normalizeMovie(data.primary);
    const alternatives = Array.isArray(data.alternatives)
        ? (data.alternatives as unknown[])
              .map(normalizeMovie)
              .filter(Boolean)
              .slice(0, MOVIES_NUMBER_LIMIT - 1) as AiRecommendedMovie[]
        : [];

    const curatorNote = typeof data.curator_note === 'string' ? data.curator_note.trim() : '';

    if (!primary && alternatives.length > 0) {
        return {
            curator,
            curator_note: curatorNote,
            primary: alternatives[0],
            alternatives: alternatives.slice(1, MOVIES_NUMBER_LIMIT),
        };
    }

    if (!primary && alternatives.length === 0) {
        return null;
    }

    return {
        curator,
        curator_note: curatorNote,
        primary: primary ?? null,
        alternatives,
    };
}

function buildPrompt(curator: CuratorPersona, selected: SelectedBadge[]): string {
    const moodLines = selected.map(badge => `- ${badge.label} (${badge.category})`).join('\n');

    return `You are ${curator.name} ${curator.emoji}, an AI movie curator with a ${curator.tone} tone (${curator.promptStyle}).
Recommend exactly ${MOVIES_NUMBER_LIMIT} films that fit the moods below. Keep titles recognizable and recent classics if possible.

Moods:
${moodLines}

Return ONLY raw JSON. No markdown. No code fences.
{
  "curator_note": "one or two sentences in your tone",
  "primary": { "title": "...", "release_year": 2001, "reason": "1-2 lines in your tone" },
  "alternatives": [
    { "title": "...", "release_year": 2014, "reason": "short reason" }
  ]
}`;
}

async function searchTmdbMovie(title: string, releaseYear?: number): Promise<TmdbMovieMeta | null> {
    if (!TMDB_API_KEY) return null;

    const cacheKey = `${title.toLowerCase()}:${releaseYear ?? ''}`;
    if (tmdbSearchCache.has(cacheKey)) {
        return tmdbSearchCache.get(cacheKey) ?? null;
    }

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

        if (results.length === 0) {
            tmdbSearchCache.set(cacheKey, null);
            return null;
        }

        const exactYearMatch = releaseYear
            ? results.find(movie => movie.release_date?.startsWith(String(releaseYear)))
            : null;

        const chosen = exactYearMatch ?? results[0];
        tmdbSearchCache.set(cacheKey, chosen ?? null);
        return chosen ?? null;
    } catch (error) {
        console.error('TMDB lookup failed', error);
        tmdbSearchCache.set(cacheKey, null);
        return null;
    }
}

async function enrichMovie(movie: AiRecommendedMovie): Promise<AiRecommendedMovie> {
    if (!TMDB_API_KEY) return movie;

    const meta = await searchTmdbMovie(movie.title, movie.release_year);

    if (!meta) {
        return movie;
    }

    const releaseYearFromMeta = meta.release_date
        ? Number.parseInt(meta.release_date.slice(0, 4), 10)
        : undefined;

    return {
        ...movie,
        tmdb_id: meta.id,
        poster_path: meta.poster_path ?? undefined,
        release_year:
            movie.release_year ?? (Number.isFinite(releaseYearFromMeta) ? releaseYearFromMeta : undefined),
        overview: meta.overview ?? movie.overview,
        vote_average: typeof meta.vote_average === 'number' ? meta.vote_average : movie.vote_average,
    };
}

async function buildCuratedResponse(
    prompt: string,
    curator: CuratorPersona,
    strictInstruction = false,
): Promise<AiCuratorResponse | null> {
    if (!openai) return null;

    const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
            {
                role: 'system',
                content: `You are ${curator.name} (${curator.emoji}) with a ${curator.tone} tone. ${curator.promptStyle}.` +
                    (strictInstruction ? ' Return ONLY JSON. No markdown or prose.' : ''),
            },
            { role: 'system', content: 'Respond concisely and avoid filler.' },
            { role: 'user', content: prompt },
        ],
    });

    const content = completion.choices?.[0]?.message?.content ?? '';
    const sanitized = sanitizeJson(content);
    return parseCuratorResponse(sanitized, curator);
}

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY || !openai) {
        return NextResponse.json({ message: 'Missing OpenAI API key.' }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    const selected = body?.selected;

    if (!selected || !Array.isArray(selected) || selected.length < 1 || selected.length > 3) {
        return NextResponse.json(
            { message: 'Please provide between 1 and 3 selected badges.' },
            { status: 400 },
        );
    }

    const curator =
        CURATORS.find(item => item.id === (body?.curatorId ?? DEFAULT_CURATOR_ID)) ??
        CURATORS.find(item => item.id === DEFAULT_CURATOR_ID)!;

    const prompt = buildPrompt(curator, selected);

    try {
        let aiResponse = await buildCuratedResponse(prompt, curator);

        if (!aiResponse) {
            aiResponse = await buildCuratedResponse(`${prompt}\nReturn ONLY JSON object.`, curator, true);
        }

        const baseResponse = aiResponse ?? emptyCuratorResponse(curator);

        const primary = baseResponse.primary ? await enrichMovie(baseResponse.primary) : null;
        const alternatives = await Promise.all(
            (baseResponse.alternatives ?? []).slice(0, MOVIES_NUMBER_LIMIT - 1).map(enrichMovie),
        );

        const payload: AiCuratorResponse = {
            ...baseResponse,
            primary,
            alternatives,
        };

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        const status = (error as { status?: number })?.status;
        const message =
            status === 429
                ? 'AI quota reached. Please check your OpenAI plan or try again later.'
                : 'Unexpected error generating recommendations.';

        console.error('AI recommend route failed', error);
        return NextResponse.json(
            { message },
            { status: status && status >= 400 && status < 600 ? status : 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
