'use client';

import { useSearchPage } from '@/hooks/useSearchPage';
import { useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import MovieCard from '@/components/MovieCard';
import LoadingSearchPage from '@/app/search/[searchType]/[id]/[name]/loading';

interface SearchPageProps {
    params: {
        searchType: string;
        id: string;
        name: string;
    };
}

export default function SearchPage({ params }: SearchPageProps) {
    const { searchType, id, name } = params;
    const decodedName = decodeURIComponent(name);

    const { data, fetchNextPage, isLoading, isError, hasNextPage } = useSearchPage(
        searchType as 'searchByGenre' | 'searchByKeyword',
        id,
    );

    const loaderRef = useRef<HTMLDivElement | null>(null);

    let title = '';
    switch (searchType) {
        case 'searchByGenre':
            title = `Best in "${decodedName}" genre`;
            break;
        case 'searchByKeyword':
            title = `Best by "${decodedName}" keyword`;
            break;
        default:
            title = `Results for "${decodedName}"`;
    }

    if (isLoading && data.results.length === 0) {
        return <LoadingSearchPage title={title} />;
    }

    if (isError)
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Failed to load results 😢
            </div>
        );

    if (data.results.length === 0)
        return (
            <main className="min-h-screen bg-gray-950 text-white">
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <h1 className="text-3xl font-bold mb-8 tracking-tight">{title}</h1>
                    <div className="flex items-center justify-center min-h-[40vh] text-neutral-400">
                        No results found.
                    </div>
                </div>
            </main>
        );

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-8 tracking-tight">{title}</h1>

                {/* Movies Grid */}
                <InfiniteScroll
                    dataLength={data.results.length}
                    next={fetchNextPage}
                    hasMore={!!hasNextPage}
                    loader={false}
                >
                    <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {data.results.map(movie => (
                            <MovieCard
                                key={`${movie.id}-${movie.title || movie.name}`}
                                movie={movie}
                            />
                        ))}
                    </div>
                </InfiniteScroll>

                {/* Infinite Scroll Loader */}
                <div ref={loaderRef} className="h-16 flex items-center justify-center mt-10">
                    {isLoading && (
                        <span className="text-neutral-400 animate-pulse">Loading more...</span>
                    )}
                </div>
            </div>
        </main>
    );
}
