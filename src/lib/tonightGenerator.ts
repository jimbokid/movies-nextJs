import OpenAI from 'openai';
import { TONIGHT_FALLBACK_POOL } from '@/constants/tonightFallbackPool';
import { buildTonightPrompt } from './buildTonightPrompt';
import { buildFallbackCopy } from './fallbackTonightCopy';
import { resolveTonightMovie, ResolutionStrategy } from './resolveTonightMovie';
import { TONIGHT_SYSTEM_PROMPT } from './tonightPicker.system';
import { getKyivContext } from './tonightTime';
import { sanitizeTonightCopy } from './sanitizeTonightCopy';
import { validateTonightLLMResponse, TonightLLMResponse } from './validateTonightLLM';

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.2';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface GeneratedTonightPick {
    movieId: number;
    intentLine: string;
    whyText: string;
    seedContext: Record<string, unknown>;
    source: 'llm' | 'fallback';
    resolution: ResolutionStrategy;
    llmModel?: string;
    rawLLMResponse?: unknown;
    validationFailed?: boolean;
}

function hashString(input: string) {
    return input.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
}

function pickFallback(dateKey: string, rerolled: boolean, avoidMovieId?: number): GeneratedTonightPick {
    const offset = rerolled ? 7 : 0;
    let index = (Math.abs(hashString(dateKey)) + offset) % TONIGHT_FALLBACK_POOL.length;
    let chosen = TONIGHT_FALLBACK_POOL[index];

    if (avoidMovieId && TONIGHT_FALLBACK_POOL.length > 1 && chosen.tmdbId === avoidMovieId) {
        index = (index + 1) % TONIGHT_FALLBACK_POOL.length;
        chosen = TONIGHT_FALLBACK_POOL[index];
    }
    const seedContext = {
        source: 'fallback',
        poolIndex: index,
        tags: chosen.tags,
    };
    const copy = buildFallbackCopy(`${dateKey}-${index}`);
    return {
        movieId: chosen.tmdbId,
        intentLine: sanitizeTonightCopy(copy.intentLine, 110, 1),
        whyText: sanitizeTonightCopy(copy.whyText, 320, 3),
        seedContext,
        source: 'fallback',
        resolution: 'fallback',
    };
}

async function requestFromLLM(dateKey: string, rerolled: boolean, retryHint = '') {
    if (!openai) return { response: null, validation: null };
    const rerollContext = rerolled ? 'User rerolled; shift the energy from the prior pick.' : undefined;
    const prompt = buildTonightPrompt({
        dateKey,
        rerollContext,
    });

    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.8,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: TONIGHT_SYSTEM_PROMPT },
                { role: 'user', content: retryHint ? `${prompt}\n\nNote: ${retryHint}` : prompt },
            ],
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) return { response: null, validation: null };

        const parsed = JSON.parse(content) as TonightLLMResponse;
        const validation = validateTonightLLMResponse(parsed);
        return { response: parsed, validation, raw: content };
    } catch (error) {
        console.error('AI generation failed for tonight pick', error);
        return { response: null, validation: null };
    }
}

async function generateAiCandidate(dateKey: string, rerolled: boolean): Promise<GeneratedTonightPick | null> {
    const firstAttempt = await requestFromLLM(dateKey, rerolled);
    const validationFailed = !(firstAttempt.validation?.ok ?? true);

    if (firstAttempt.validation?.ok && firstAttempt.validation.value) {
        const resolved = await resolveTonightMovie({
            tmdbId: firstAttempt.validation.value.tmdbId,
            title: firstAttempt.validation.value.title,
            year: firstAttempt.validation.value.year,
        });

        if (resolved) {
            return {
                movieId: resolved.movieId,
                intentLine: firstAttempt.validation.value.intentLine,
                whyText: firstAttempt.validation.value.whyText,
                seedContext: {
                    source: 'ai',
                    weekday: getKyivContext().weekday,
                },
                source: 'llm',
                resolution: resolved.resolution,
                llmModel: OPENAI_MODEL,
                rawLLMResponse: process.env.NODE_ENV !== 'production' ? firstAttempt.raw : undefined,
            };
        }
    }

    const retry = await requestFromLLM(
        dateKey,
        rerolled,
        'Previous output was invalid. Return ONLY JSON object with the required fields.',
    );

    if (retry.validation?.ok && retry.validation.value) {
        const resolved = await resolveTonightMovie({
            tmdbId: retry.validation.value.tmdbId,
            title: retry.validation.value.title,
            year: retry.validation.value.year,
        });

        if (resolved) {
            return {
                movieId: resolved.movieId,
                intentLine: retry.validation.value.intentLine,
                whyText: retry.validation.value.whyText,
                seedContext: {
                    source: 'ai',
                    weekday: getKyivContext().weekday,
                },
                source: 'llm',
                resolution: resolved.resolution,
                llmModel: OPENAI_MODEL,
                rawLLMResponse: process.env.NODE_ENV !== 'production' ? retry.raw : undefined,
                validationFailed,
            };
        }
    }

    return null;
}

export async function buildTonightPick(
    dateKey: string,
    avoidMovieId?: number,
): Promise<GeneratedTonightPick> {
    const rerolled = Boolean(avoidMovieId);
    const aiPick = await generateAiCandidate(dateKey, rerolled);
    if (aiPick && aiPick.movieId !== avoidMovieId) {
        return aiPick;
    }

    return pickFallback(dateKey, rerolled, avoidMovieId);
}
