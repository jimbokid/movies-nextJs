import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { detectRegion } from '@/features/watch/server/detectRegion';
import { aiFindWhereToWatch } from '@/features/watch/server/aiWhereToWatch';
import { getWhereToWatch, MovieOfTheNightError } from '@/features/watch/server/movieOfTheNight';
import {
    WatchAvailabilityApiResponse,
    WatchProviderItem,
    WhereToWatch,
} from '@/features/watch/types';

const AI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const aiCache = new Map<string, { providers: WatchProviderItem[]; expiresAt: number }>();

export const revalidate = 60 * 60 * 12;

function withVaryHeaders<T>(
    body: T,
    init?: {
        status?: number;
        statusText?: string;
        headers?: HeadersInit;
    },
) {
    const varyHeaders = new Headers(init?.headers);
    varyHeaders.set('Vary', 'x-vercel-ip-country, cf-ipcountry');

    return NextResponse.json(body, {
        ...init,
        headers: varyHeaders,
    });
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');
    const title = url.searchParams.get('title') ?? undefined;
    const year = url.searchParams.get('year') ?? undefined;

    if (type !== 'movie' && type !== 'tv') {
        return withVaryHeaders<WatchAvailabilityApiResponse>(
            { ok: false, error: 'Invalid type. Supported values are "movie" or "tv".' },
            { status: 400 },
        );
    }

    if (!id) {
        return withVaryHeaders<WatchAvailabilityApiResponse>(
            { ok: false, error: 'Missing required parameter "id".' },
            { status: 400 },
        );
    }

    const region = detectRegion(await headers());

    let primary: WhereToWatch | null = null;

    try {
        primary = await getWhereToWatch({ type, id, region });
    } catch (error) {
        const status = error instanceof MovieOfTheNightError ? error.status : undefined;

        if (status && [401, 403, 429].includes(status)) {
            const message =
                status === 401
                    ? 'Streaming availability credentials are not authorized.'
                    : status === 403
                      ? 'Streaming availability request was forbidden.'
                      : 'Streaming availability request was rate limited. Please try again soon.';

            return withVaryHeaders<WatchAvailabilityApiResponse>(
                { ok: false, error: message },
                { status },
            );
        }

        console.error('Primary watch availability lookup failed', error);
    }

    if (primary && primary.providers.length > 0) {
        return withVaryHeaders<WatchAvailabilityApiResponse>({
            ok: true,
            region,
            data: primary,
        });
    }

    if (!title) {
        return withVaryHeaders<WatchAvailabilityApiResponse>({
            ok: true,
            region,
            data: null,
        });
    }

    const cacheKey = `${type}:${id}:${region}`;
    const now = Date.now();
    const cached = aiCache.get(cacheKey);
    let providers: WatchProviderItem[] = [];

    if (cached && cached.expiresAt > now) {
        providers = cached.providers;
    } else {
        try {
            providers = await aiFindWhereToWatch({ title, year, type, region });
            aiCache.set(cacheKey, { providers, expiresAt: now + AI_CACHE_TTL_MS });
        } catch (error) {
            console.error('AI watch availability lookup failed', error);
            return withVaryHeaders<WatchAvailabilityApiResponse>(
                { ok: false, error: 'Unable to fetch web-based watch links at this time.' },
                { status: 500 },
            );
        }
    }

    if (!providers.length) {
        return withVaryHeaders<WatchAvailabilityApiResponse>({
            ok: true,
            region,
            data: null,
        });
    }

    const fallbackData: WhereToWatch = {
        region,
        updatedAt: new Date().toISOString(),
        providers,
    };

    return withVaryHeaders<WatchAvailabilityApiResponse>({
        ok: true,
        region,
        data: fallbackData,
    });
}
