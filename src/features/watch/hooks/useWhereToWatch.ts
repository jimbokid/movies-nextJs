'use client';

import { DEFAULT_STREAMING_REGION } from '@/constants/streaming';
import { WatchProvider, WhereToWatch } from '@/types/whereToWatch';
import { useQuery } from '@tanstack/react-query';

interface UseWhereToWatchOptions {
    type: 'movie' | 'tv';
    id: string | number;
    region?: string;
    enabled?: boolean;
}

const fetchWhereToWatch = async ({
    type,
    id,
    region,
}: {
    type: 'movie' | 'tv';
    id: string | number;
    region: string;
}): Promise<WhereToWatch> => {
    const params = new URLSearchParams({
        type,
        id: String(id),
        region,
    });

    const response = await fetch(`/api/where-to-watch?${params.toString()}`);

    if (!response.ok) {
        throw new Error('Failed to load streaming providers');
    }

    return response.json();
};

export const useWhereToWatch = ({
    type,
    id,
    region = DEFAULT_STREAMING_REGION,
    enabled = true,
}: UseWhereToWatchOptions) => {
    const queryKey = ['whereToWatch', type, id, region];

    const query = useQuery<WhereToWatch, Error>({
        queryKey,
        queryFn: () => fetchWhereToWatch({ type, id, region }),
        enabled: enabled && Boolean(id) && Boolean(type),
        staleTime: 1000 * 60 * 60 * 12,
        gcTime: 1000 * 60 * 60 * 24,
    });

    return {
        providers: query.data?.providers ?? ([] as WatchProvider[]),
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch,
    };
};
