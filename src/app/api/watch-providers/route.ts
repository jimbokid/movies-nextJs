import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
    WatchProvider,
    WatchProviderSuggestion,
    WatchProvidersRequest,
    WatchProvidersResponse,
} from '@/types/watchProviders';
import { getUserCountry } from '@/utils/request';
import { API_PATH, API_TOKEN } from '@/constants/appConstants';

const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY ?? API_TOKEN;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? API_PATH;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.2';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface TmdbWatchProvidersResponse {
    results?: Record<
        string,
        {
            link: string;
            flatrate?: Array<{ provider_name: string; logo_path?: string | null }>;
            rent?: Array<{ provider_name: string; logo_path?: string | null }>;
            buy?: Array<{ provider_name: string; logo_path?: string | null }>;
        }
    >;
}

interface AiSuggestionPayload {
    note?: string;
    suggested_search_links?: Array<{ name?: string; url?: string }>;
}

function normalizeCountryCode(country?: string | null): string | null {
    if (!country) return null;
    const trimmed = country.trim().slice(0, 2).toUpperCase();
    return /^[A-Z]{2}$/.test(trimmed) ? trimmed : null;
}

function buildProviders(regionData: NonNullable<TmdbWatchProvidersResponse['results']>[string]): WatchProvider[] {
    const providers: WatchProvider[] = [];
    const link = regionData.link;

    const addProviders = (
        items: Array<{ provider_name: string; logo_path?: string | null }> | undefined,
        type: WatchProvider['type'],
    ) => {
        if (!Array.isArray(items)) return;
        for (const item of items) {
            providers.push({
                name: item.provider_name,
                logo_path: item.logo_path ?? undefined,
                type,
                link,
            });
        }
    };

    addProviders(regionData.flatrate, 'stream');
    addProviders(regionData.rent, 'rent');
    addProviders(regionData.buy, 'buy');

    return providers;
}

async function fetchTmdbProviders(tmdbId: number, type: 'movie' | 'tv'): Promise<TmdbWatchProvidersResponse> {
    if (!TMDB_API_KEY) {
        throw new Error('Missing TMDB API key');
    }

    const response = await fetch(`${TMDB_API_PATH}${type}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`, {
        cache: 'no-store',
        next: { revalidate: 0 },
    });

    if (!response.ok) {
        throw new Error(`TMDB watch providers request failed with status ${response.status}`);
    }

    return (await response.json()) as TmdbWatchProvidersResponse;
}

async function fetchTitle(tmdbId: number, type: 'movie' | 'tv'): Promise<string | undefined> {
    if (!TMDB_API_KEY) return undefined;

    try {
        const response = await fetch(`${TMDB_API_PATH}${type}/${tmdbId}?api_key=${TMDB_API_KEY}`, {
            cache: 'no-store',
            next: { revalidate: 0 },
        });

        if (!response.ok) return undefined;

        const payload = await response.json();
        return (payload.title ?? payload.name ?? payload.original_name ?? '') as string;
    } catch (error) {
        console.error('Failed to fetch TMDB title for AI fallback', error);
        return undefined;
    }
}

function parseAiSuggestion(content: string): AiSuggestionPayload {
    try {
        const cleaned = content.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned) as AiSuggestionPayload;
        return parsed;
    } catch (error) {
        console.error('Failed to parse AI availability note', error);
        return {};
    }
}

async function getAiFallback({
    title,
    country,
    type,
}: {
    title?: string;
    country: string;
    type: 'movie' | 'tv';
}): Promise<{ ai_note?: string; ai_suggestions?: WatchProviderSuggestion[] }> {
    if (!openaiClient) {
        return {
            ai_note: 'No availability data is currently available for your region.',
            ai_suggestions: [],
        };
    }

    const safeTitle = title?.trim() || (type === 'movie' ? 'this movie' : 'this show');

    try {
        const completion = await openaiClient.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a streaming availability assistant. Respond only with JSON. Provide search links, not direct streaming links.',
                },
                {
                    role: 'user',
                    content: `We could not find official streaming providers for "${safeTitle}" in ${country}. Explain the likely situation and recommend a few reputable platforms to search legally.
Return a JSON object with:
- "note": a concise explanation (no marketing tone)
- "suggested_search_links": array of 2-4 items with "name" and "url" fields.
Use only safe search links (e.g., Apple TV, Prime Video, Google Play, YouTube). Do NOT claim the title is available, and do NOT invent direct playback URLs.`,
                },
            ],
        });

        const content = completion.choices?.[0]?.message?.content ?? '';
        const parsed = parseAiSuggestion(content);

        const ai_suggestions: WatchProviderSuggestion[] = Array.isArray(parsed.suggested_search_links)
            ? parsed.suggested_search_links
                  .filter(link => link?.name && link?.url)
                  .map(link => ({
                      name: String(link.name),
                      url: String(link.url),
                  }))
            : [];

        return {
            ai_note: parsed.note,
            ai_suggestions,
        };
    } catch (error) {
        console.error('AI fallback for watch providers failed', error);
        return {
            ai_note: 'No availability data is currently available for your region.',
            ai_suggestions: [],
        };
    }
}

export async function POST(req: Request) {
    let country = getUserCountry(req);
    const body = (await req.json().catch(() => null)) as WatchProvidersRequest | null;

    if (!body || typeof body.tmdbId !== 'number' || !['movie', 'tv'].includes(body.type)) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    country = normalizeCountryCode(body.country) ?? country;

    let providers: WatchProvider[] = [];
    let ai_note: WatchProvidersResponse['ai_note'];
    let ai_suggestions: WatchProvidersResponse['ai_suggestions'];

    try {
        const tmdbResponse = await fetchTmdbProviders(body.tmdbId, body.type);
        const regionData = tmdbResponse.results?.[country];

        if (regionData) {
            providers = buildProviders(regionData);
        }
    } catch (error) {
        console.error('TMDB watch providers fetch failed', error);
    }

    if (providers.length === 0) {
        const aiFallback = await getAiFallback({
            title: body.title ?? (await fetchTitle(body.tmdbId, body.type)),
            country,
            type: body.type,
        });

        ai_note = aiFallback.ai_note;
        ai_suggestions = aiFallback.ai_suggestions;
    }

    const payload: WatchProvidersResponse = {
        country,
        providers,
        ai_note,
        ai_suggestions,
    };

    return NextResponse.json(payload, { status: 200 });
}

export const dynamic = 'force-dynamic';
