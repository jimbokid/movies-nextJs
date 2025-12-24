import { DEFAULT_STREAMING_REGION } from '@/constants/streaming';
import { getWhereToWatch } from '@/lib/movieOfTheNight/client';
import { NextRequest, NextResponse } from 'next/server';

const cacheHeaders = {
    'Cache-Control': 's-maxage=43200, stale-while-revalidate=86400',
};

const respond = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers: cacheHeaders });

export async function GET(request: NextRequest) {
    const searchParams = new URL(request.url).searchParams;
    const typeParam = searchParams.get('type');
    const id = searchParams.get('id');
    const region = (searchParams.get('region') ?? DEFAULT_STREAMING_REGION).toLowerCase();

    if (!typeParam || !id) {
        return respond({ message: 'Missing required params' }, 400);
    }

    const type = typeParam === 'tv' ? 'tv' : typeParam === 'movie' ? 'movie' : null;

    if (!type) {
        return respond({ message: 'Invalid type parameter' }, 400);
    }

    try {
        const payload = await getWhereToWatch({ type, id, region });

        if (!payload || payload.providers.length === 0) {
            return respond({ message: 'No streaming providers found' }, 404);
        }

        return respond(payload, 200);
    } catch (error) {
        const status = (error as { status?: number })?.status;

        if (status === 429) {
            return respond({ message: 'Rate limited by upstream provider' }, 429);
        }

        if (status === 404) {
            return respond({ message: 'No streaming providers found' }, 404);
        }

        console.error('Failed to fetch where-to-watch data', error);

        return respond({ message: 'Streaming availability service unavailable' }, 502);
    }
}
