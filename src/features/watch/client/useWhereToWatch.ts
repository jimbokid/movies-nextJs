'use client';

import { useQuery } from '@tanstack/react-query';
import { getWatchAvailability } from './getWatchAvailability';
import { WhereToWatch } from '../types';

type Params = {
    type: 'movie' | 'tv';
    id: string | number;
};

export function useWhereToWatch(params: Params) {
    return useQuery<{ region: string; data: WhereToWatch | null }, Error>({
        queryKey: ['watch', params.type, params.id],
        queryFn: () => getWatchAvailability(params),
        staleTime: 1000 * 60 * 60 * 6, // 6 hours
        retry: 1,
    });
}
