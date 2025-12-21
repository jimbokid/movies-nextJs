'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { searchGlobal, SearchKind } from '@/services/searchGlobal';
import { DashboardPayload } from '@/types/dashboard';

// Single movie/TV item from your existing payload
export type MovieTvItem = DashboardPayload['results'][number];

// Full person response from the service
type PersonResponse = Awaited<ReturnType<typeof searchGlobal.searchPerson>>;
// Single person item
export type PersonItem = PersonResponse['results'][number];

// Generic paginated response shape
interface PaginatedResponse<T> {
    page: number;
    total_pages: number;
    total_results: number;
    results: T[];
}

type MovieTvPage = PaginatedResponse<MovieTvItem>;
type PersonPage = PaginatedResponse<PersonItem>;

type UseGlobalSearchReturn =
    | {
          kind: 'movie' | 'tv';
          data: { results: MovieTvItem[]; total_pages: number; totalResults: number };
          isLoading: boolean;
          isError: boolean;
          fetchNextPage: () => void;
          hasNextPage?: boolean;
      }
    | {
          kind: 'person';
          data: { results: PersonItem[]; total_pages: number; totalResults: number };
          isLoading: boolean;
          isError: boolean;
          fetchNextPage: () => void;
          hasNextPage?: boolean;
      };

export function useGlobalSearch(kind: SearchKind, query: string): UseGlobalSearchReturn {
    const qKey = ['global-search', kind, query];

    const { data, isLoading, isError, fetchNextPage, hasNextPage } = useInfiniteQuery<
        MovieTvPage | PersonPage,
        Error
    >({
        queryKey: qKey,
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => {
            if (kind === 'movie') {
                return searchGlobal.searchMovie(query, Number(pageParam));
            }

            if (kind === 'tv') {
                return searchGlobal.searchTv(query, Number(pageParam));
            }

            return searchGlobal.searchPerson(query, Number(pageParam));
        },
        getNextPageParam: lastPage =>
            lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
        refetchOnMount: false,
    });

    const pages = data?.pages ?? [];
    const first = pages[0];

    if (kind === 'person') {
        const personPages = pages as PersonPage[];
        const flat = personPages.flatMap(p => p.results) ?? [];
        const totalResults = first?.total_results ?? flat.length;

        return {
            kind,
            data: {
                results: flat,
                total_pages: first?.total_pages ?? 0,
                totalResults,
            },
            isLoading,
            isError,
            fetchNextPage,
            hasNextPage,
        };
    }

    // movie / tv
    const movieTvPages = pages as MovieTvPage[];
    const flat = movieTvPages.flatMap(p => p.results) ?? [];
    const totalResults = first?.total_results ?? flat.length;

    return {
        kind,
        data: {
            results: flat,
            total_pages: first?.total_pages ?? 0,
            totalResults,
        },
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
    };
}
