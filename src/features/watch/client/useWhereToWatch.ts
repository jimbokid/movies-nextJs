'use client';

import { useQuery } from '@tanstack/react-query';
import { getWatchAvailability } from './getWatchAvailability';
import { WatchAvailabilityApiResponse } from '../types';

export function useWhereToWatch(params: {
    type: 'movie' | 'tv';
    id: string;
    title?: string;
    year?: string | number;
}) {
    return useQuery<WatchAvailabilityApiResponse>({
        queryKey: ['watch', params.type, params.id],
        queryFn: () => getWatchAvailability(params),
        enabled: Boolean(params.type && params.id),
        staleTime: 1000 * 60 * 60 * 12,
    });
}
