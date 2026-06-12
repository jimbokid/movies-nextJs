'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Image from 'next/image';
import Link from 'next/link';
import Loading from '@/app/(home)/loading';
import MovieCard from '@/components/MovieCard';
import Rating from '@/components/Rating';
import { buildCuratorUrl } from '@/lib/curatorLink';

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

    const [featured, ...rest] = data.results;
    const featuredYear = featured?.release_date
        ? new Date(featured.release_date).getFullYear()
        : null;

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white pt-18 overflow-hidden">
            <div className="h-screen pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Featured hero */}
                {featured && (
                    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full">
                            {featured.backdrop_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w1280${featured.backdrop_path}`}
                                    alt={featured.title || featured.name}
                                    fill
                                    priority
                                    sizes="(max-width: 1200px) 100vw, 1152px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-purple-200/90">
                                    #1 Trending today
                                </p>
                                <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight">
                                    {featured.title || featured.name}
                                </h1>
                                <div className="mt-2 flex items-center gap-3 text-sm text-gray-300">
                                    {featuredYear && <span>{featuredYear}</span>}
                                    <Rating value={featured.vote_average} />
                                </div>
                                {featured.overview && (
                                    <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-gray-300 sm:line-clamp-2 sm:block">
                                        {featured.overview}
                                    </p>
                                )}
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link
                                        href={`/detail/movie/${featured.id}`}
                                        className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_12px_40px_rgba(124,58,237,0.45)]"
                                    >
                                        View details
                                    </Link>
                                    <Link
                                        href={buildCuratorUrl({ from: 'home_hero' })}
                                        className="rounded-2xl border border-white/15 bg-gray-950/60 px-5 py-2.5 text-sm font-semibold text-gray-100 backdrop-blur transition hover:border-purple-300/60 hover:bg-purple-500/10"
                                    >
                                        Open Curator
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <h2 className="text-3xl font-bold mb-8 tracking-tight">Trending Movies</h2>

                {/* Movies Grid */}
                <InfiniteScroll
                    dataLength={data?.results.length}
                    next={fetchNextPage}
                    hasMore={data?.results.length < data?.total_pages}
                    loader={false}
                >
                    <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {rest.map(movie => (
                            <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} priority />
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
