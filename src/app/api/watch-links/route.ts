import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { API_PATH, API_TOKEN } from '@/constants/appConstants';
import { WatchLinksRequest, WatchLinksResponse, WatchPlatformLink } from '@/types/watchLinks';
import { CountryCode, getUserCountry } from '@/utils/request';

interface TmdbWatchProvidersResponse {
    results?: Record<
        string,
        {
            flatrate?: Array<{ provider_name: string }>;
            rent?: Array<{ provider_name: string }>;
            buy?: Array<{ provider_name: string }>;
        }
    >;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY ?? API_TOKEN;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? API_PATH;

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const PLATFORM_WHITELIST: Record<string, string[]> = {
    US: ['Netflix', 'Apple TV', 'Prime Video', 'Hulu', 'HBO Max'],
    UA: ['Netflix', 'Apple TV', 'Megogo', 'Kyivstar TV'],
    DE: ['Netflix', 'Prime Video', 'Apple TV'],
};

const PLATFORM_SEARCH_BUILDERS: Record<string, (query: string) => string> = {
    Netflix: query => `https://www.netflix.com/search?q=${query}`,
    'Apple TV': query => `https://tv.apple.com/search?term=${query}`,
    'Prime Video': query => `https://www.amazon.com/s?k=${query}&i=instant-video`,
    Hulu: query => `https://www.hulu.com/search?q=${query}`,
    'HBO Max': query => `https://www.max.com/search?q=${query}`,
    'Kyivstar TV': query => `https://tv.kyivstar.ua/search?query=${query}`,
    Megogo: query => `https://megogo.net/search?q=${query}`,
};

const NORMALIZED_NAME_MAP: Record<string, string> = {
    netflix: 'Netflix',
    'apple tv': 'Apple TV',
    'apple tv+': 'Apple TV',
    'apple tv plus': 'Apple TV',
    'prime video': 'Prime Video',
    'amazon prime video': 'Prime Video',
    'amazon video': 'Prime Video',
    amazon: 'Prime Video',
    hulu: 'Hulu',
    'hbo max': 'HBO Max',
    max: 'HBO Max',
    megogo: 'Megogo',
    'kyivstar tv': 'Kyivstar TV',
};

function sanitizeQuery(value: string): string {
    return encodeURIComponent(value).replace(/%20/g, '+');
}

function normalizeProviderName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\+/g, 'plus')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function canonicalizeProviderName(name: string): string | null {
    const normalized = normalizeProviderName(name);
    return NORMALIZED_NAME_MAP[normalized] ?? null;
}

function gatherProviderNames(regionData?: TmdbWatchProvidersResponse['results'][string]): string[] {
    if (!regionData) return [];

    const buckets = [regionData.flatrate, regionData.rent, regionData.buy].filter(Boolean) as Array<
        Array<{ provider_name: string }>
    >;

    const names = new Set<string>();
    for (const bucket of buckets) {
        bucket.forEach(provider => {
            if (provider?.provider_name) {
                names.add(provider.provider_name);
            }
        });
    }

    return Array.from(names);
}

function matchWhitelistedPlatforms(country: CountryCode, providerNames: string[]): string[] {
    const allowed = PLATFORM_WHITELIST[country] ?? [];
    if (allowed.length === 0) return [];

    const canonicalProviders = providerNames
        .map(name => canonicalizeProviderName(name))
        .filter((name): name is string => Boolean(name));

    return allowed.filter(allowedName => canonicalProviders.includes(allowedName));
}

async function fetchTmdbWatchProviders(tmdbId: number, type: 'movie' | 'tv'): Promise<TmdbWatchProvidersResponse> {
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
        console.error('Failed to fetch TMDB title for watch links', error);
        return undefined;
    }
}

async function getAvailabilityNote(title: string, country: string, type: 'movie' | 'tv'): Promise<string | undefined> {
    if (!openaiClient) {
        return 'Streaming availability is limited in your region.';
    }

    try {
        const completion = await openaiClient.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a streaming availability assistant. Respond only with a short, honest explanation. Never include URLs.',
                },
                {
                    role: 'user',
                    content: `We could not find a clear streaming platform for the ${type} "${title}" in ${country}. Explain the likely availability situation in 1-2 sentences without suggesting specific URLs.`,
                },
            ],
        });

        return completion.choices?.[0]?.message?.content?.trim();
    } catch (error) {
        console.error('AI availability note failed', error);
        return 'Streaming availability is limited in your region.';
    }
}

export async function POST(req: Request) {
    const country = getUserCountry(req);
    const body = (await req.json().catch(() => null)) as WatchLinksRequest | null;

    if (!body || typeof body.tmdbId !== 'number' || !['movie', 'tv'].includes(body.type) || !body.title) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    let platforms: WatchPlatformLink[] = [];
    let note: string | undefined;

    let title = body.title ?? 'this title';
    try {
        title = (await fetchTitle(body.tmdbId, body.type)) || title;
    } catch (error) {
        console.error('TMDB title lookup failed', error);
    }

    try {
        const tmdbResponse = await fetchTmdbWatchProviders(body.tmdbId, body.type);
        const regionData = tmdbResponse.results?.[country];

        const providerNames = gatherProviderNames(regionData);
        const matched = matchWhitelistedPlatforms(country, providerNames);

        if (matched.length > 0) {
            const query = sanitizeQuery(title);
            platforms = matched
                .map(name => {
                    const builder = PLATFORM_SEARCH_BUILDERS[name];
                    if (!builder) return null;
                    return { provider: name, url: builder(query) } satisfies WatchPlatformLink;
                })
                .filter((value): value is WatchPlatformLink => Boolean(value));
        }
    } catch (error) {
        console.error('TMDB watch providers fetch failed', error);
    }

    if (platforms.length === 0) {
        note = await getAvailabilityNote(title, country, body.type);
    }

    const payload: WatchLinksResponse = {
        country,
        updatedAt: new Date().toISOString(),
        links: platforms,
        note,
    };

    return NextResponse.json(payload, { status: 200 });
}

export const dynamic = 'force-dynamic';
