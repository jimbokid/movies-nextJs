import OpenAI from 'openai';
import { serverEnv } from '@/config/serverEnv';
import { WatchProviderItem } from '../types';

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
const ALLOWED_DOMAINS = [
    'megogo.net',
    'sweet.tv',
    'kyivstar.ua',
    'kyivstartv.com',
    'netflix.com',
    'primevideo.com',
    'apple.com',
    'tv.apple.com',
    'play.google.com',
    'youtube.com',
    'hulu.com',
    'hbomax.com',
    'max.com',
    'disneyplus.com',
    'paramountplus.com',
];

const openai = new OpenAI({
    apiKey: serverEnv.openaiApiKey,
});

type AiLink = {
    name?: string;
    link?: string;
    type?: string;
};

function isAllowedUrl(url?: string | null) {
    if (!url) return false;

    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        return ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
        return false;
    }
}

function normalizeAiLinks(items: AiLink[]): WatchProviderItem[] {
    const seen = new Set<string>();

    return items
        .map(item => ({
            name: (item.name ?? '').trim(),
            link: item.link?.trim(),
            type: 'link' as const,
            source: 'ai-web-search' as const,
        }))
        .filter(item => item.name && isAllowedUrl(item.link))
        .filter(item => {
            const key = `${item.name.toLowerCase()}|${item.link}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

async function parseResponseText(text: string): Promise<AiLink[]> {
    if (!text) return [];

    const trimmed = text.trim();

    try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? (parsed as AiLink[]) : [];
    } catch {
        return [];
    }
}

export async function aiFindWhereToWatch(params: {
    title: string;
    year?: string | number;
    type: 'movie' | 'tv';
    region: string;
}): Promise<WatchProviderItem[]> {
    const { title, year, type, region } = params;
    const releasePart = year ? ` (${year})` : '';
    const regionLabel = region.toUpperCase();

    const response = await openai.responses.create({
        model: DEFAULT_MODEL,
        input: [
            {
                role: 'system',
                content:
                    'You are a cautious media expert. Find only official streaming or purchase links. Avoid any piracy, coupon, or unofficial aggregators. Return strictly JSON.',
                type: 'message',
            },
            {
                role: 'user',
                content: `Find 3-5 official watch providers for the ${type} "${title}"${releasePart} that are available in country code ${regionLabel}.
Use the web_search tool to verify availability. Prefer national services in that country when possible.
Only include links from this allowlist: ${ALLOWED_DOMAINS.join(', ')}.
Return an array of JSON objects with: name (provider), type ("link"), link (direct title URL).
If you cannot find allowed providers, return an empty JSON array.`,
                type: 'message',
            },
        ],
        tools: [{ type: 'web_search' }],
        temperature: 0.2,
        max_output_tokens: 800,
        text: {
            format: {
                type: 'json_schema',
                json_schema: {
                    name: 'where_to_watch_links',
                    strict: true,
                    schema: {
                        type: 'array',
                        minItems: 0,
                        maxItems: 5,
                        items: {
                            type: 'object',
                            required: ['name', 'link', 'type'],
                            additionalProperties: false,
                            properties: {
                                name: { type: 'string', minLength: 1 },
                                link: { type: 'string', format: 'uri' },
                                type: { const: 'link' },
                            },
                        },
                    },
                },
            },
        },
    });

    const content = response.output_text ?? '';
    const parsed = await parseResponseText(content);

    return normalizeAiLinks(parsed);
}
