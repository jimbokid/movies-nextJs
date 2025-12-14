import axios from 'axios';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AiRecommendResponse, AiRecommendedMovie, SelectedBadge } from '@/types/discoverAi';

interface RequestBody {
    selected?: SelectedBadge[];
}

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.2';
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? 'https://api.themoviedb.org/3/';
const TMDB_LANGUAGE = process.env.TMDB_LANGUAGE ?? 'en-US';
const TMDB_REGION = process.env.TMDB_REGION ?? 'US';
const TMDB_INCLUDE_ADULT = process.env.TMDB_INCLUDE_ADULT ?? 'false';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const MOVIES_NUMBER_LIMIT = 6;

function parseAiMovies(content: string): AiRecommendedMovie[] {
    try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
            return parsed
                .map(item => {
                    const releaseYear =
                        typeof item.release_year === 'number'
                            ? item.release_year
                            : typeof item.release_year === 'string'
                              ? Number.parseInt(item.release_year, 10)
                              : undefined;

                    return {
                        title: String(item.title ?? '').trim(),
                        reason: String(item.reason ?? '').trim(),
                        poster_path:
                            typeof item.poster_path === 'string' ? item.poster_path : undefined,
                        release_year: Number.isFinite(releaseYear) ? releaseYear : undefined,
                        overview: typeof item.overview === 'string' ? item.overview : undefined,
                        vote_average:
                            typeof item.vote_average === 'number'
                                ? item.vote_average
                                : typeof item.vote_average === 'string'
                                  ? Number.parseFloat(item.vote_average)
                                  : undefined,
                    } satisfies AiRecommendedMovie;
                })
                .filter(item => item.title);
        }
    } catch (error) {
        console.error('Failed to parse AI response', error);
    }
    return [];
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
            movie.release_year ??
            (Number.isFinite(releaseYearFromMeta) ? releaseYearFromMeta : undefined),
        overview: meta.overview ?? movie.overview,
        vote_average:
            typeof meta.vote_average === 'number' ? meta.vote_average : movie.vote_average,
    };
}

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY || !openai) {
        return NextResponse.json({ message: 'Missing OpenAI API key.' }, { status: 500 });
    }

    const client = openai;

    const body = (await req.json().catch(() => null)) as RequestBody | null;
    const selected = body?.selected;

    if (!selected || !Array.isArray(selected) || selected.length < 1 || selected.length > 3) {
        return NextResponse.json(
            { message: 'Please provide between 1 and 3 selected badges.' },
            { status: 400 },
        );
    }

    const moodLines = selected.map(badge => `- ${badge.label} (${badge.category})`).join('\n');
    const prompt = `You are a movie expert and recommender. Based on the following moods and badges, suggest ${MOVIES_NUMBER_LIMIT} movies.
Moods:
${moodLines}

Return ONLY valid JSON array of movies in the following format:
[
  {"title": "Movie title", "release_year": 1995},
  ... ${MOVIES_NUMBER_LIMIT - 1} more
]
Provide the best known release year.`;

    try {
        const completion = await client.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: "Return ONLY JSON ARRAY. No markdown. No code fences." },
                { role: "user", content: prompt },
            ],
        });

        console.log(`completion`,completion.choices?.[0]?.message)

        const content = completion.choices?.[0]?.message?.content ?? '[]';


        const clearContent = content
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        const movies = parseAiMovies(clearContent).slice(0, MOVIES_NUMBER_LIMIT);

        const enriched = await Promise.all(movies.map(enrichMovie));
        const payload: AiRecommendResponse = { movies: enriched };

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
