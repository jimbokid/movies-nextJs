'use client';

import { useQuery } from '@tanstack/react-query';
import { ShowType, WatchAvailability, WatchCountry } from '../types';

async function fetchWatchAvailability(type: ShowType, tmdbId: number, country: WatchCountry) {
    const params = new URLSearchParams({ type, tmdbId: String(tmdbId), country });
    const response = await fetch(`/api/watch-availability?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to load watch availability');
    }

    return (await response.json()) as WatchAvailability;
}

export function useWatchAvailability(type: ShowType, tmdbId: number, country: WatchCountry) {
    return useQuery<WatchAvailability>({
        queryKey: ['watchAvailability', type, tmdbId, country],
        queryFn: () => fetchWatchAvailability(type, tmdbId, country),
        enabled: Boolean(type && tmdbId && country),
        staleTime: 1000 * 60 * 60 * 12,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
    });
}
