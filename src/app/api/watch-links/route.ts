import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PROVIDERS } from '@/constants/watchProviders';

type WatchLinksRequest = {
    type: 'movie' | 'tv';
    title: string;
    year?: number;
    country?: string;
};

type WatchLink = { provider: string; url: string };

type WatchLinksResponse = {
    links: WatchLink[];
    note?: string;
    updatedAt: string;
};

type CacheEntry = { expiresAt: number; value: WatchLinksResponse };

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const cache = new Map<string, CacheEntry>();

function cacheKeyFromRequest(body: WatchLinksRequest): string {
    return `${body.type}:${body.title.toLowerCase().trim()}:${body.year ?? ''}:${body.country ?? 'US'}`;
}

function isAllowedHost(provider: string, host: string): boolean {
    const allowedDomains = PROVIDERS[provider];
    if (!allowedDomains) return false;

    return allowedDomains.some(domain => host === domain || host.endsWith(`.${domain}`));
}

function isSearchLikeUrl(url: URL): boolean {
    const path = url.pathname.toLowerCase();
    const query = url.search.toLowerCase();

    return (
        path.includes('/search') ||
        query.includes('q=') ||
        query.includes('query=') ||
        query.includes('search=')
    );
}

function validateLink(link: unknown): WatchLink | null {
    const provider = typeof (link as { provider?: unknown }).provider === 'string'
        ? (link as { provider: string }).provider.trim()
        : '';
    const url = typeof (link as { url?: unknown }).url === 'string'
        ? (link as { url: string }).url.trim()
        : '';

    if (!provider || !url || !PROVIDERS[provider]) {
        return null;
    }

    try {
        const parsed = new URL(url);

        if (parsed.protocol !== 'https:') return null;
        if (isSearchLikeUrl(parsed)) return null;
        if (!isAllowedHost(provider, parsed.hostname.toLowerCase())) return null;

        return { provider, url: parsed.toString() };
    } catch (error) {
        console.error('Invalid URL in AI response', error);
        return null;
    }
}

function stripCodeFences(content: string): string {
    return content.replace(/```json/i, '').replace(/```/g, '').replace(/^json/i, '').trim();
}

function parseAiResponse(content: string): { links: WatchLink[]; note?: string } {
    const cleaned = stripCodeFences(content);

    try {
        const parsed = JSON.parse(cleaned) as { links?: unknown; note?: unknown };

        const rawLinks = Array.isArray(parsed.links) ? parsed.links : [];
        const seen = new Set<string>();
        const links: WatchLink[] = [];

        for (const item of rawLinks) {
            const validated = validateLink(item);
            if (validated && !seen.has(validated.provider)) {
                links.push(validated);
                seen.add(validated.provider);
                if (links.length >= 6) break;
            }
        }

        const note =
            typeof parsed.note === 'string' && parsed.note.trim() ? parsed.note.trim() : undefined;

        return { links, note };
    } catch (error) {
        console.error('Failed to parse AI watch links response', error);
        return { links: [] };
    }
}

function buildPrompt(body: WatchLinksRequest): string {
    const yearText = Number.isFinite(body.year) ? body.year : 'unknown';
    const country = body.country ?? 'US';

    return `You are a streaming link assistant.

Given a movie/TV title, return up to 6 official places where a user can watch it online.
Rules:
- Return DIRECT title pages only (no search URLs, no provider homepages).
- Use ONLY official streaming providers.
- Do NOT include piracy/unofficial sites.
- If unsure about a direct title link, omit that provider.
- Only include providers available in ${country}. Omit providers if availability is uncertain.
- Output ONLY valid JSON (no markdown, no code fences).

Input:
Type: ${body.type}
Title: "${body.title}"
Year: ${yearText}
Country: ${country}

Output JSON schema:
{
  "note": "optional, 1 short sentence max",
  "links": [
    { "provider": "Netflix", "url": "https://..." }
  ]
}`;
}

function getCachedResponse(key: string): WatchLinksResponse | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt > Date.now()) {
        return entry.value;
    }

    cache.delete(key);
    return null;
}

function setCache(key: string, value: WatchLinksResponse) {
    cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

function normalizeCountry(input?: string | null): string | undefined {
    if (!input) return undefined;
    const trimmed = input.trim();
    if (!trimmed) return undefined;

    const match = trimmed.match(/[A-Za-z]{2}/);
    if (!match) return undefined;

    return match[0].toUpperCase();
}

function resolveCountry(req: Request, requestedCountry?: string): string {
    const headerCountry =
        normalizeCountry(req.headers.get('x-vercel-ip-country')) ??
        normalizeCountry(req.headers.get('cf-ipcountry'));

    return headerCountry ?? normalizeCountry(requestedCountry) ?? 'US';
}

export async function POST(req: Request) {
    if (!process.env.OPENAI_API_KEY || !openai) {
        return NextResponse.json({ message: 'Missing OpenAI API key.' }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as WatchLinksRequest | null;

    if (!body || (body.type !== 'movie' && body.type !== 'tv') || !body.title?.trim()) {
        return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
    }

    const normalizedBody: WatchLinksRequest = {
        type: body.type,
        title: body.title.trim(),
        year: typeof body.year === 'number' ? body.year : undefined,
        country: resolveCountry(req, body.country),
    };

    const cacheKey = cacheKeyFromRequest(normalizedBody);
    const cached = getCachedResponse(cacheKey);
    if (cached) {
        return NextResponse.json(cached, { status: 200 });
    }

    const prompt = buildPrompt(normalizedBody);

    try {
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            temperature: 0.2,
            max_tokens: 500,
            messages: [
                { role: 'system', content: 'Return only official provider domains and direct title pages. Return raw JSON only.' },
                { role: 'user', content: prompt },
            ],
        });

        const content = completion.choices?.[0]?.message?.content ?? '';
        const parsed = parseAiResponse(content);

        const payload: WatchLinksResponse = {
            links: parsed.links,
            note:
                parsed.links.length > 0
                    ? parsed.note
                    : 'No official links found yet.',
            updatedAt: new Date().toISOString(),
        };

        setCache(cacheKey, payload);

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch watch links from OpenAI', error);
        return NextResponse.json(
            { message: 'Unable to fetch watch links at this time.' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
