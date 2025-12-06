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
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white pt-18 overflow-hidden">
            <div className="h-screen pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>
            <div className="max-w-6xl mx-auto px-4 py-10">
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
