import axios from 'axios';
import OpenAI from 'openai';
import { FALLBACK_TONIGHT_PICKS } from '@/constants/tonightFallbacks';
import { API_PATH, API_TOKEN, INCLUDE_ADULT, LANGUAGE, REGION } from '@/constants/appConstants';
import { getKyivContext } from './tonightTime';

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.2';
const TMDB_API_KEY =
    process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY ?? API_TOKEN;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? API_PATH;
const TMDB_LANGUAGE = process.env.TMDB_LANGUAGE ?? LANGUAGE;
const TMDB_REGION = process.env.TMDB_REGION ?? REGION;
const TMDB_INCLUDE_ADULT = process.env.TMDB_INCLUDE_ADULT ?? String(INCLUDE_ADULT);

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface AiTonightPayload {
    movieId?: number;
    title?: string;
    year?: number;
    intentLine?: string;
    whyText?: string;
}

interface GeneratedTonightPick {
    movieId: number;
    intentLine: string;
    whyText?: string;
    seedContext: Record<string, unknown>;
}

function hashString(input: string) {
    return input.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
}

function clampIntentLine(text?: string) {
    if (!text) return 'A calm, cinematic pick for tonight.';
    const trimmed = text.trim();
    return trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;
}

function clampWhyText(text?: string) {
    if (!text) return undefined;
    const trimmed = text.trim();
    if (!trimmed) return undefined;
    return trimmed.length > 480 ? `${trimmed.slice(0, 477)}...` : trimmed;
}

async function searchTmdbMovie(title: string, year?: number) {
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
                year,
            },
        });

        const results: Array<{
            id: number;
            title: string;
            release_date?: string;
            popularity?: number;
        }> = Array.isArray(response.data?.results) ? response.data.results : [];

        if (results.length === 0) return null;

        const yearMatch = year
            ? results.find(movie => movie.release_date?.startsWith(String(year)))
            : null;

        return yearMatch ?? results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0];
    } catch (error) {
        console.error('TMDB lookup failed for tonight pick', error);
        return null;
    }
}

async function resolveMovieId(candidate: AiTonightPayload): Promise<number | null> {
    if (typeof candidate.movieId === 'number' && Number.isFinite(candidate.movieId)) {
        return candidate.movieId;
    }

    if (!candidate.title) return null;

    const match = await searchTmdbMovie(candidate.title, candidate.year);
    return match?.id ?? null;
}

function pickFallback(dateKey: string, avoidMovieId?: number, salt = ''): GeneratedTonightPick {
    const available = FALLBACK_TONIGHT_PICKS.filter(item => item.movieId !== avoidMovieId);
    const pool = available.length > 0 ? available : FALLBACK_TONIGHT_PICKS;
    const key = `${dateKey}-${salt}`;
    const index = Math.abs(hashString(key)) % pool.length;
    const chosen = pool[index];

    return {
        movieId: chosen.movieId,
        intentLine: chosen.intentLine,
        whyText: chosen.whyText,
        seedContext: {
            source: 'fallback',
            title: chosen.title,
        },
    };
}

async function generateAiCandidate(dateKey: string): Promise<GeneratedTonightPick | null> {
    if (!openai) return null;

    const context = getKyivContext();
    const prompt = `Pick exactly one movie for tonight. Keep it calm, cinematic, and avoid mega-blockbusters unless they are the best fit. Avoid spoilers and never mention that you are an AI. Write in a grounded tone with no marketing hype.

Return strict JSON with:
{
  "movieId": <tmdb id if known>,
  "title": "<title if id unknown>",
  "year": <release year>,
  "intentLine": "<1 short sentence, max 110 characters>",
  "whyText": "<2-3 sentences explaining the fit in a calm tone>"
}

Context:
- Kyiv weekday: ${context.weekday}
- Kyiv local time: ${context.isoTime}
- Time of day vibe: ${context.timeOfDay}
- Date key: ${dateKey}`;

    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.8,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a calm film curator. Recommend one fitting movie with a quiet, confident tone. Never include code fences or explanations—only the JSON object.',
                },
                { role: 'user', content: prompt },
            ],
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content) as AiTonightPayload;
        const movieId = await resolveMovieId(parsed);

        if (!movieId) return null;

        return {
            movieId,
            intentLine: clampIntentLine(parsed.intentLine),
            whyText: clampWhyText(parsed.whyText),
            seedContext: {
                source: 'ai',
                weekday: context.weekday,
                timeOfDay: context.timeOfDay,
            },
        };
    } catch (error) {
        console.error('AI generation failed for tonight pick', error);
        return null;
    }
}

export async function buildTonightPick(
    dateKey: string,
    avoidMovieId?: number,
): Promise<GeneratedTonightPick> {
    const aiPick = await generateAiCandidate(dateKey);
    if (aiPick && aiPick.movieId !== avoidMovieId) {
        return aiPick;
    }

    return pickFallback(dateKey, avoidMovieId, avoidMovieId ? 'reroll' : 'fallback');
}
