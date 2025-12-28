'use client';

import { useSearchPage } from '@/hooks/useSearchPage';
import { useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import MovieCard from '@/components/MovieCard';
import LoadingSearchPage from '@/app/search/[searchType]/[id]/[name]/loading';
import PageHeader from '@/components/layout/PageHeader';
import MovieGrid from '@/components/movies/MovieGrid';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

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
            <div className="page-shell py-10">
                <ErrorState message="Failed to load results. Please try again." />
            </div>
        );

    if (data.results.length === 0)
        return (
            <div className="space-y-6 pb-10">
                <PageHeader
                    title={title}
                    subtitle="CineView kept it quiet for this filter."
                />
                <div className="page-shell">
                    <EmptyState
                        title="Nothing loud here."
                        message="Try adjusting the filter to find a match."
                    />
                </div>
            </div>
        );

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title={title}
                subtitle="Curated titles based on your filter."
            />
            <div className="page-shell">
                <InfiniteScroll
                    dataLength={data.results.length}
                    next={fetchNextPage}
                    hasMore={!!hasNextPage}
                    loader={null}
                >
                    <MovieGrid>
                        {data.results.map(movie => (
                            <MovieCard
                                key={`${movie.id}-${movie.title || movie.name}`}
                                movie={movie}
                            />
                        ))}
                    </MovieGrid>
                </InfiniteScroll>

                <div ref={loaderRef} className="h-12 flex items-center justify-center mt-4">
                    {isLoading && (
                        <span className="text-caption text-[var(--text-muted)]">
                            Loading more…
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
