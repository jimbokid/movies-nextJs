'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Dashboard } from '@/services/dashboard';
import { DashboardPayload } from '@/types/dashboard';

export const useDashboard = () => {
    const { data, isLoading, isError, fetchNextPage } = useInfiniteQuery<DashboardPayload, Error>({
        initialPageParam: 1,
        queryKey: ['dashboard'],
        queryFn: ({ pageParam = 1 }) => Dashboard.getDashboard(Number(pageParam)),
        getNextPageParam: lastPage => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
            return undefined;
        }
    });

    const allResults = data?.pages.flatMap(page => page.results) ?? [];

    return {
        data: {
            ...data,
            results: allResults,
            total_pages: data?.pages[0].total_pages || 0,
        },
        isError,
        isLoading,
        fetchNextPage,
    };
};
