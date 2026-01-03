import { NextResponse } from 'next/server';
import { detectRegion } from '@/features/watch/server/detectRegion';
import { getWhereToWatch, WatchAvailabilityError, WATCH_REVALIDATE_SECONDS } from '@/features/watch/server/movieOfTheNight';
import { WatchAvailabilityApiResponse } from '@/features/watch/types';

export const revalidate = WATCH_REVALIDATE_SECONDS;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const id = searchParams.get('id');

    if (!typeParam || (typeParam !== 'movie' && typeParam !== 'tv')) {
        return NextResponse.json<WatchAvailabilityApiResponse>(
            { ok: false, error: 'Invalid or missing type. Expected "movie" or "tv".' },
            { status: 400 },
        );
    }

    if (!id) {
        return NextResponse.json<WatchAvailabilityApiResponse>(
            { ok: false, error: 'Missing required parameter: id.' },
            { status: 400 },
        );
    }

    const region = detectRegion({ headers: request.headers, searchParams });

    try {
        const data = await getWhereToWatch({ type: typeParam, id, region });

        return NextResponse.json<WatchAvailabilityApiResponse>(
            { ok: true, region, data },
            {
                status: 200,
                headers: {
                    Vary: 'x-vercel-ip-country, cf-ipcountry, x-country-code',
                },
            },
        );
    } catch (error) {
        const status =
            error instanceof WatchAvailabilityError && error.status
                ? error.status
                : 500;
        const message =
            error instanceof Error
                ? error.message
                : 'Failed to fetch streaming availability.';

        return NextResponse.json<WatchAvailabilityApiResponse>(
            { ok: false, error: message },
            {
                status,
                headers: {
                    Vary: 'x-vercel-ip-country, cf-ipcountry, x-country-code',
                },
            },
        );
    }
}
