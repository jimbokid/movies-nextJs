'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '@/app/(home)/loading';
import MovieCard from '@/components/MovieCard';

export default function DashboardPage() {
    const { data, fetchNextPage, isLoading, isError } = useDashboard();
    const loaderRef = useRef<HTMLDivElement | null>(null);

    if (isLoading && data.results.length === 0) return <Loading />;

    if (isError)
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                Failed to load movies 😢
            </div>
        );

    return (
        <main className="min-h-screen bg-neutral-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-8 tracking-tight">Trending Movies 🎥</h1>

                {/* Movies Grid */}
                <InfiniteScroll
                    dataLength={data?.results.length}
                    next={fetchNextPage}
                    hasMore={data?.results.length < data?.total_pages}
                    loader={false}
                >
                    <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {data?.results.map(movie => (
                            <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
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
