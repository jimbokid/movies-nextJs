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
                .map(item => ({
                    title: String(item.title ?? '').trim(),
                    tmdb_id: typeof item.tmdb_id === 'number' ? item.tmdb_id : undefined,
                    reason: String(item.reason ?? '').trim(),
                    poster_path: typeof item.poster_path === 'string' ? item.poster_path : undefined,
                    release_year:
                        typeof item.release_year === 'number'
                            ? item.release_year
                            : typeof item.release_year === 'string'
                              ? Number.parseInt(item.release_year, 10)
                              : undefined,
                }))
                .filter(item => item.title && item.reason);
        }
    } catch (error) {
        console.error('Failed to parse AI response', error);
    }
    return [];
}

async function searchTmdbMovie(title: string): Promise<AiRecommendedMovie | null> {
    if (!TMDB_API_KEY) return null;

    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.set('api_key', TMDB_API_KEY);
    url.searchParams.set('query', title);
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');

    try {
        const response = await fetch(url.toString(), { next: { revalidate: 0 } });
        if (!response.ok) return null;
        const data = await response.json();
        const match = data?.results?.[0];
        if (!match) return null;

        return {
            title: match.title,
            tmdb_id: match.id,
            reason: '',
            poster_path: match.poster_path ?? undefined,
            release_year: match.release_date ? Number.parseInt(match.release_date.slice(0, 4), 10) : undefined,
        };
    } catch (error) {
        console.error('TMDB lookup failed', error);
        return null;
    }
}

async function enrichMovie(movie: AiRecommendedMovie): Promise<AiRecommendedMovie> {
    if (movie.tmdb_id && movie.poster_path && movie.release_year) {
        return movie;
    }

    const lookup = await searchTmdbMovie(movie.title);
    if (!lookup) return movie;

    return {
        ...movie,
        tmdb_id: movie.tmdb_id ?? lookup.tmdb_id,
        poster_path: movie.poster_path ?? lookup.poster_path,
        release_year: movie.release_year ?? lookup.release_year,
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
  {"title": "Movie title", "tmdb_id": 123, "reason": "1-2 sentences on why it matches", "poster_path": "/path.jpg", "release_year": 1995},
  ... 4 more
]
Use null when you do not know a tmdb_id or poster_path. Do not include any other commentary.`;

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
        console.error('AI recommend route failed', error);
        return NextResponse.json({ message: 'Unexpected error generating recommendations.' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic';
