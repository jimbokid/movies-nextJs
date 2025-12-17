import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WatchLinksRequest, WatchLinksResponse } from '@/types/watchLinks';

type ProviderName = keyof typeof PROVIDERS;

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openaiClient = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const PROVIDERS = {
    Netflix: ['netflix.com'],
    'Apple TV': ['tv.apple.com'],
    'Prime Video': ['primevideo.com', 'amazon.com'],
    'HBO Max': ['max.com', 'hbomax.com'],
    Hulu: ['hulu.com'],
    'Disney+': ['disneyplus.com'],
    Megogo: ['megogo.net'],
    'Kyivstar TV': ['tv.kyivstar.ua'],
} as const;

const PROVIDERS_BY_COUNTRY: Record<string, ProviderName[]> = {
    UA: ['Netflix', 'Apple TV', 'Megogo', 'Kyivstar TV', 'Prime Video'],
    US: ['Netflix', 'Apple TV', 'Prime Video', 'Hulu', 'HBO Max', 'Disney+'],
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const cache = new Map<string, { payload: WatchLinksResponse; timestamp: number }>();

function normalizeCountryCode(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (trimmed.length < 2) return null;
    const code = trimmed.slice(0, 2).toUpperCase();
    return /^[A-Z]{2}$/.test(code) ? code : null;
}

function getCountry(req: Request): string {
    const headerCountry = normalizeCountryCode(req.headers.get('x-vercel-ip-country'));
    if (headerCountry) return headerCountry;
    return 'US';
}

function stripCodeFences(content: string): string {
    return content.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
}

function isAllowedDomain(provider: ProviderName, url: string): boolean {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:') return false;
        const host = parsed.hostname.toLowerCase();
        const allowedDomains = PROVIDERS[provider].map(domain => domain.toLowerCase());
        return allowedDomains.some(domain => host === domain || host.endsWith(`.${domain}`));
    } catch {
        return false;
    }
}

function isSearchUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.toLowerCase();
        if (pathname.includes('search')) return true;
        const query = parsed.search.toLowerCase();
        return query.includes('q=') || query.includes('search');
    } catch {
        return true;
    }
}

function buildAllowedProviderList(country: string): { name: ProviderName; domains: string[] }[] {
    const allowed = PROVIDERS_BY_COUNTRY[country] ?? (Object.keys(PROVIDERS) as ProviderName[]);
    return allowed.map(provider => ({ name: provider, domains: [...PROVIDERS[provider]] }));
}

function getCacheKey(request: WatchLinksRequest, country: string): string {
    const normalizedTitle = request.title.trim().toLowerCase();
    const yearPart = request.releaseYear ? `:${request.releaseYear}` : '';
    return `${country}:${request.type}:${normalizedTitle}${yearPart}`;
}

function readCache(key: string): WatchLinksResponse | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    return entry.payload;
}

function writeCache(key: string, payload: WatchLinksResponse) {
    cache.set(key, { payload, timestamp: Date.now() });
}

function parseAiResponse(
    rawContent: string,
    country: string,
): { links: WatchLinksResponse['links']; note?: string } {
    const cleaned = stripCodeFences(rawContent);
    try {
        const parsed = JSON.parse(cleaned) as {
            curator_note?: string;
            links?: Array<{ provider?: string; url?: string }>;
        };

        const allowedProviders = new Set(buildAllowedProviderList(country).map(item => item.name));
        const links: WatchLinksResponse['links'] = [];

        for (const link of parsed.links ?? []) {
            if (!link?.provider || !link?.url) continue;
            if (!allowedProviders.has(link.provider as ProviderName)) continue;
            const provider = link.provider as ProviderName;
            if (!isAllowedDomain(provider, link.url)) continue;
            if (isSearchUrl(link.url)) continue;
            if (links.some(existing => existing.provider === provider)) continue;

            links.push({ provider, url: link.url });
        }

        const note = parsed.curator_note?.trim();
        return { links, note };
    } catch {
        return { links: [], note: undefined };
    }
}

function buildPrompt({ country, request }: { country: string; request: WatchLinksRequest }): string {
    const allowedList = buildAllowedProviderList(country)
        .map(({ name, domains }) => `${name}: ${domains.join(', ')}`)
        .join('\n');

    return `You are a streaming availability assistant.

Task:
Given a title and a country, return ONLY official, legal streaming provider links where the user can watch this exact title in that country.

IMPORTANT RULES:
- Return direct title pages ONLY (no search URLs, no "/search", no query-based search links).
- Use ONLY official provider domains.
- If you are not sure a provider has the title in this country, DO NOT include it.
- Do not include rent/buy marketplaces unless they are actual streaming providers.
- Do not include piracy or unofficial websites.
- Limit to max 6 providers.
- curator_note must be 1–2 short sentences max.

Input:
Country: ${country}
Type: ${request.type} (movie or tv)
Title: ${request.title}
Original title: ${request.originalTitle ?? ''}
Release year: ${request.releaseYear ?? ''}

Allowed providers in this country:
${allowedList}

Output JSON schema (ONLY JSON):
{
  "curator_note": "string (1-2 sentences max)",
  "links": [
    { "provider": "Netflix", "url": "https://..." }
  ]
}`;
}

async function fetchAiLinks(country: string, request: WatchLinksRequest): Promise<{ links: WatchLinksResponse['links']; note?: string }> {
    if (!openaiClient) {
        return { links: [], note: 'Streaming links are not available right now.' };
    }

    const prompt = buildPrompt({ country, request });

    const completion = await openaiClient.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
            { role: 'system', content: 'You must respond only with JSON following the provided schema.' },
            { role: 'user', content: prompt },
        ],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
        return { links: [], note: 'Streaming links are not available right now.' };
    }

    return parseAiResponse(content, country);
}

function validateRequest(body: unknown): WatchLinksRequest | null {
    const parsed = body as Partial<WatchLinksRequest>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.type || !['movie', 'tv'].includes(parsed.type)) return null;
    if (!parsed.title || typeof parsed.title !== 'string') return null;

    return {
        type: parsed.type,
        title: parsed.title.trim(),
        originalTitle: parsed.originalTitle?.trim(),
        releaseYear: typeof parsed.releaseYear === 'number' ? parsed.releaseYear : undefined,
        tmdbId: typeof parsed.tmdbId === 'number' ? parsed.tmdbId : undefined,
    } satisfies WatchLinksRequest;
}

export async function POST(req: Request) {
    const country = getCountry(req);
    const body = await req.json().catch(() => null);
    const requestBody = validateRequest(body);

    if (!requestBody) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    const cacheKey = getCacheKey(requestBody, country);
    const cached = readCache(cacheKey);
    if (cached) {
        return NextResponse.json(cached, { status: 200 });
    }

    const { links, note } = await fetchAiLinks(country, requestBody);

    const payload: WatchLinksResponse = {
        country,
        updatedAt: new Date().toISOString(),
        links,
        note: note?.trim(),
    };

    writeCache(cacheKey, payload);

    return NextResponse.json(payload, { status: 200 });
}

export const dynamic = 'force-dynamic';
