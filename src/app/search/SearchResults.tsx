'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { Search } from '@/services/search';
import { DashboardPayload } from '@/types/dashboard';
import InfiniteScroll from 'react-infinite-scroll-component';
import MovieCard from '@/components/MovieCard'; // or your Movie component
import { useMemo } from 'react';

interface SearchResultsProps {
    searchType: string;
    id: string;
}

export default function SearchResults({ searchType, id }: SearchResultsProps) {
    const { data, isLoading, isError, fetchNextPage, hasNextPage } = useInfiniteQuery<
        DashboardPayload,
        Error
    >({
        queryKey: ['search', searchType, id],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => {
            if (searchType === 'searchByGenre') {
                return Search.fetchByGenre(id, Number(pageParam));
            }
            if (searchType === 'searchByKeyword') {
                return Search.fetchByKeyword(id, Number(pageParam));
            }
            // fallback – for now same as genre
            return Search.fetchByGenre(id, Number(pageParam));
        },
        getNextPageParam: lastPage =>
            lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

    const allResults = useMemo(() => data?.pages.flatMap(page => page.results) ?? [], [data]);

    if (isLoading && !data) {
        return (
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                        <div className="aspect-[2/3] bg-gray-800 rounded-xl" />
                        <div className="h-4 w-3/4 bg-gray-800 rounded" />
                        <div className="h-3 w-1/2 bg-gray-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[40vh] text-red-400">
                Failed to load results 😢
            </div>
        );
    }

    if (!allResults.length) {
        return (
            <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
                No results found.
            </div>
        );
    }

    return (
        <InfiniteScroll
            dataLength={allResults.length}
            next={fetchNextPage}
            hasMore={!!hasNextPage}
            loader={null}
        >
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {allResults.map(movie => (
                    <MovieCard
                        key={`${movie.id}-${movie.title || movie.name}`}
                        movie={movie}
                    />
                ))}
            </div>
        </InfiniteScroll>
    );
}
