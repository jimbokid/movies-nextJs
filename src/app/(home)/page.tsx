'use client';

import { useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDashboard } from '@/hooks/useDashboard';
import Loading from '@/app/(home)/loading';
import MovieCard from '@/components/MovieCard';
import PageHeader from '@/components/layout/PageHeader';
import MovieGrid from '@/components/movies/MovieGrid';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
    const { data, fetchNextPage, isLoading, isError } = useDashboard();
    const loaderRef = useRef<HTMLDivElement | null>(null);

    if (isLoading && data.results.length === 0) return <Loading />;

    if (isError)
        return (
            <div className="page-shell py-10">
                <ErrorState message="Something didn’t load. Please retry in a moment." />
            </div>
        );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Discover"
                subtitle="Trending picks across film and TV. Updated frequently."
            />

            {data.results.length === 0 ? (
                <div className="page-shell pb-12">
                    <EmptyState
                        title="Nothing loud here."
                        message="We couldn’t find any titles. Please try again soon."
                    />
                </div>
            ) : (
                <div className="page-shell pb-4">
                    <InfiniteScroll
                        dataLength={data?.results.length}
                        next={fetchNextPage}
                        hasMore={data?.results.length < data?.total_pages}
                        loader={null}
                    >
                        <MovieGrid>
                            {data?.results.map(movie => (
                                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} priority />
                            ))}
                        </MovieGrid>
                    </InfiniteScroll>
                    <div ref={loaderRef} className="h-16 flex items-center justify-center mt-2">
                        {isLoading && (
                            <span className="text-caption text-[var(--text-muted)]">
                                Loading more…
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
