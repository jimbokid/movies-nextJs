import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
    AiRecommendResponse,
    AiRecommendedMovie,
    SelectedBadge,
} from '@/types/discoverAi';

interface RequestBody {
    selected?: SelectedBadge[];
}

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

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
                        tmdb_id: typeof item.tmdb_id === 'number' ? item.tmdb_id : undefined,
                        reason: String(item.reason ?? '').trim(),
                        poster_path: typeof item.poster_path === 'string' ? item.poster_path : undefined,
                        release_year: Number.isFinite(releaseYear) ? releaseYear : undefined,
                        overview: typeof item.overview === 'string' ? item.overview : undefined,
                    } satisfies AiRecommendedMovie;
                })
                .filter(item => item.title && item.reason);
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

    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('query', title);
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');
    if (releaseYear) {
        url.searchParams.set('primary_release_year', String(releaseYear));
    }

    try {
        const response = await fetch(url.toString(), { next: { revalidate: 0 } });
        if (!response.ok) return null;
        const data = await response.json();
        const results: TmdbMovieMeta[] = Array.isArray(data?.results)
            ? data.results.map((item: TmdbMovieMeta) => ({
                  id: item.id,
                  title: item.title,
                  poster_path: item.poster_path,
                  release_date: item.release_date,
                  overview: item.overview,
                  vote_average: item.vote_average,
              }))
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

    const releaseYearFromMeta = meta.release_date ? Number.parseInt(meta.release_date.slice(0, 4), 10) : undefined;

    return {
        ...movie,
        tmdb_id: meta.id,
        poster_path: meta.poster_path ?? undefined,
        release_year: movie.release_year ?? (Number.isFinite(releaseYearFromMeta) ? releaseYearFromMeta : undefined),
        overview: meta.overview ?? movie.overview,
        vote_average: typeof meta.vote_average === 'number' ? meta.vote_average : movie.vote_average,
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
    const prompt = `You are a movie expert and recommender. Based on the following moods and badges, suggest 5 movies.
Moods:
${moodLines}

Return ONLY valid JSON in the following format:
[
  {"title": "Movie title", "reason": "1-2 sentences on why it matches", "release_year": 1995},
  ... 4 more
]
Do not guess TMDB ids. Do not include commentary or markdown. Use null when you don't know a release year.`;

    try {
        const completion = await client.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.8,
            messages: [
                { role: 'system', content: 'You are a movie expert and recommender.' },
                { role: 'user', content: prompt },
            ],
        });

        const content = completion.choices?.[0]?.message?.content ?? '[]';
        const movies = parseAiMovies(content).slice(0, 5);

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
        return NextResponse.json({ message }, { status: status && status >= 400 && status < 600 ? status : 500 });
    }
}

export const dynamic = 'force-dynamic';
