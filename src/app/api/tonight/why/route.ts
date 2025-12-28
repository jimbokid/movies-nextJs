import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { API_PATH, API_TOKEN, LANGUAGE } from '@/constants/appConstants';
import { buildFallbackCopy } from '@/lib/fallbackTonightCopy';
import { sanitizeTonightCopy } from '@/lib/sanitizeTonightCopy';
import { getKyivDateKey } from '@/lib/tonightTime';
import { TonightWhyResponse } from '@/types/tonight';

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.2-mini';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface BodyShape {
    movieId?: number;
    dateKey?: string;
}

function buildPrompt({
    title,
    year,
    runtime,
    genres,
}: {
    title: string;
    year?: string;
    runtime?: number | null;
    genres?: string;
}) {
    const runtimePart = runtime ? `${runtime} minutes` : 'unknown runtime';
    const genrePart = genres ? `genres: ${genres}` : 'genres not provided';
    const yearPart = year ? ` (${year})` : '';

    return `You are a calm film curator. Give one sentence intent and two sentence why text, cinematic and spoiler-free. Avoid marketing language and hype. Never say "as an AI".

Movie: ${title}${yearPart}, ${runtimePart}, ${genrePart}.

Respond with two lines only:
INTENT: <1 sentence, calm, under 110 characters>
WHY: <2 sentences, calm, under 320 characters>`;
}

function parseAiText(text: string) {
    const intentMatch = text.match(/INTENT:\s*(.+)/i);
    const whyMatch = text.match(/WHY:\s*(.+)/i);
    if (!intentMatch || !whyMatch) return null;
    return {
        intentLine: intentMatch[1].trim(),
        whyText: whyMatch[1].trim(),
    };
}

async function fetchMovieDetails(movieId: number) {
    const response = await fetch(
        `${API_PATH}movie/${movieId}?api_key=${API_TOKEN}&language=${LANGUAGE}`,
    );
    if (!response.ok) {
        throw new Error('Failed to load movie details for why prompt');
    }
    return response.json();
}

export async function POST(request: Request) {
    const body = ((await request.json().catch(() => null)) ?? {}) as BodyShape;
    const movieId = Number(body.movieId);
    const dateKey = typeof body.dateKey === 'string' ? body.dateKey : getKyivDateKey();

    if (!Number.isFinite(movieId)) {
        return NextResponse.json({ message: 'movieId required' }, { status: 400 });
    }

    try {
        const movie = await fetchMovieDetails(movieId);
        const fallback = buildFallbackCopy(`${dateKey}-${movieId}`);

        if (!openai) {
            const response: TonightWhyResponse = {
                intentLine: sanitizeTonightCopy(fallback.intentLine, 110, 1),
                whyText: sanitizeTonightCopy(fallback.whyText, 320, 3),
                source: 'fallback',
            };
            return NextResponse.json(response);
        }

        const prompt = buildPrompt({
            title: movie.title,
            year: movie.release_date?.slice(0, 4),
            runtime: movie.runtime,
            genres: movie.genres?.map((g: { name: string }) => g.name).join(', '),
        });

        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.6,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a calm film curator. Keep responses cinematic, grounded, and free of marketing or spoilers.',
                },
                { role: 'user', content: prompt },
            ],
        });

        const content = completion.choices?.[0]?.message?.content;
        const parsed = content ? parseAiText(content) : null;
        const intentLine = sanitizeTonightCopy(
            parsed?.intentLine ?? fallback.intentLine,
            110,
            1,
        );
        const whyText = sanitizeTonightCopy(parsed?.whyText ?? fallback.whyText, 320, 3);

        const response: TonightWhyResponse = {
            intentLine,
            whyText,
            source: parsed ? 'ai' : 'fallback',
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to generate tonight why text', error);
        const fallback = buildFallbackCopy(`${dateKey}-${movieId}`);
        const response: TonightWhyResponse = {
            intentLine: sanitizeTonightCopy(fallback.intentLine, 110, 1),
            whyText: sanitizeTonightCopy(fallback.whyText, 320, 3),
            source: 'fallback',
        };
        return NextResponse.json(response, { status: 200 });
    }
}

export const dynamic = 'force-dynamic';
