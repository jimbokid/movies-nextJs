import { NextResponse } from 'next/server';
import { getWatchAvailability } from '@/features/watch/server/movieOfTheNight';
import { WatchCountry } from '@/features/watch/types';

function validateCountry(country: string | null): country is WatchCountry {
    return Boolean(country && /^[A-Z]{2}$/.test(country));
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tmdbIdParam = searchParams.get('tmdbId');
    const countryParam = searchParams.get('country');

    if (!tmdbIdParam || !countryParam) {
        return NextResponse.json({ error: 'tmdbId and country are required' }, { status: 400 });
    }

    const tmdbId = Number(tmdbIdParam);
    const country = countryParam.toUpperCase();

    if (!Number.isFinite(tmdbId)) {
        return NextResponse.json({ error: 'tmdbId must be a number' }, { status: 400 });
    }

    if (!validateCountry(country)) {
        return NextResponse.json({ error: 'country must be a 2-letter code' }, { status: 400 });
    }

    try {
        const availability = await getWatchAvailability(tmdbId, country);
        return NextResponse.json(availability);
    } catch (error) {
        console.error('[watch] Failed to load availability', error);
        return NextResponse.json({ error: 'Unable to fetch watch availability' }, { status: 500 });
    }
}
