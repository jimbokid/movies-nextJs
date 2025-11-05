'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Search } from '@/services/search';
import { DashboardPayload } from '@/types/dashboard';

type SearchType = 'searchByGenre' | 'searchByKeyword';

export const useSearchPage = (searchType: SearchType, id: string) => {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery<DashboardPayload, Error>({
        initialPageParam: 1,
        queryKey: ['search', searchType, id],
        queryFn: ({ pageParam = 1 }) => {
            if (searchType === 'searchByGenre') {
                return Search.fetchByGenre(id, Number(pageParam));
            }

            return Search.fetchByKeyword(id, Number(pageParam));
        },
        getNextPageParam: lastPage => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
            return undefined;
        },
    });

    const allResults = data?.pages.flatMap(page => page.results) ?? [];

    return {
        data: {
            results: allResults,
            total_pages: data?.pages[0]?.total_pages || 0,
        },
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
    };
};
