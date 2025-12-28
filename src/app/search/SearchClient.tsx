'use client';

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

import SegmentedSwitch from '@/components/SegmentedSwitch';
import SearchInput from '@/components/SearchInput';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import MovieCard from '@/components/MovieCard';
import PersonCard from '@/components/PersonCard';
import CuratorEntryButton from '@/components/curator/CuratorEntryButton';
import CuratorQuickChips from '@/components/curator/CuratorQuickChips';
import { curatorUrlFromSearch } from '@/lib/curatorLink';
import PageHeader from '@/components/layout/PageHeader';
import MovieGrid from '@/components/movies/MovieGrid';
import MovieGridSkeleton from '@/components/movies/MovieGridSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

type Kind = 'movie' | 'tv' | 'person';

const DEFAULT_KIND: Kind = 'movie';

export default function SearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ---- Read from URL (single source of truth) ----
    const urlKind = (searchParams.get('kind') as Kind) || DEFAULT_KIND;
    const urlQuery = searchParams.get('q') ?? '';
    const trimmedQuery = urlQuery.trim();

    const [localQuery, setLocalQuery] = useState(urlQuery);

    // sync when URL changes
    useEffect(() => {
        setLocalQuery(urlQuery);
    }, [urlQuery]);

    // Helper: update a single query param while preserving others
    const replaceParam = useCallback(
        (next: Partial<{ kind: string; q: string }>) => {
            const sp = new URLSearchParams(searchParams.toString());

            if (next.kind !== undefined) sp.set('kind', next.kind);
            if (next.q !== undefined) {
                if (next.q.trim().length === 0) sp.delete('q');
                else sp.set('q', next.q);
            }

            const qs = sp.toString();
            startTransition(() => {
                router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
            });
        },
        [router, searchParams],
    );

    // debounce writing to URL
    useEffect(() => {
        const t = setTimeout(() => {
            if (localQuery !== urlQuery) replaceParam({ q: localQuery });
        }, 350);
        return () => clearTimeout(t);
    }, [localQuery, urlQuery, replaceParam]);

    // Switch kind → write to URL immediately
    const handleKindChange = useCallback(
        (k: Kind) => {
            if (k !== urlKind) replaceParam({ kind: k });
        },
        [replaceParam, urlKind],
    );

    // Use URL values to query
    const { data, isLoading, isError, fetchNextPage, hasNextPage, kind } = useGlobalSearch(
        urlKind,
        urlQuery,
    );

    const loaderRef = useRef<HTMLDivElement | null>(null);

    const title = useMemo(() => {
        if (!urlQuery) return 'Search';
        if (urlKind === 'movie') return `Results in Movies for “${urlQuery}”`;
        if (urlKind === 'tv') return `Results in TV for “${urlQuery}”`;
        return `Results in People for “${urlQuery}”`;
    }, [urlKind, urlQuery]);

    const showInitialSkeleton = isLoading && data.results.length === 0;
    const totalResults = data.totalResults;
    const showCuratorPanel = Boolean(trimmedQuery);
    const highlightCuratorPanel = !isLoading && showCuratorPanel && totalResults <= 10;

    const controls = (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <SegmentedSwitch value={urlKind} onChange={handleKindChange} />
            <SearchInput
                value={localQuery}
                onChange={setLocalQuery}
                placeholder={`Search ${urlKind}...`}
            />
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={title}
                subtitle={
                    urlQuery
                        ? 'Calm, cinematic search across film, TV, and people.'
                        : 'Start typing to search across CineView.'
                }
                rightSlot={controls}
            />

            <div className="page-shell space-y-6 pb-10">
                {showCuratorPanel && (
                    <section
                        className={`card-surface p-5 md:p-6 ${
                            highlightCuratorPanel ? 'ring-1 ring-[var(--accent)]/40' : ''
                        }`}
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <p className="text-caption uppercase tracking-[0.18em] text-[var(--accent-2)]">
                                    Curator
                                </p>
                                <h2 className="text-headline">Let a curator refine this search</h2>
                                <p className="text-caption">
                                    {highlightCuratorPanel
                                        ? 'Few results here—jump to Curator with your search baked in.'
                                        : 'Open Curator anytime with this search as context.'}
                                </p>
                            </div>
                            <CuratorEntryButton
                                href={curatorUrlFromSearch(trimmedQuery || '', { from: 'search' })}
                                variant={highlightCuratorPanel ? 'primary' : 'secondary'}
                                size="sm"
                                ariaLabel="Open Curator from search"
                            >
                                Open Curator
                            </CuratorEntryButton>
                        </div>
                        <CuratorQuickChips
                            source="search"
                            query={trimmedQuery}
                            className="mt-3"
                        />
                    </section>
                )}

                {isError && !showInitialSkeleton && (
                    <ErrorState
                        message="We couldn’t fetch search results right now."
                        onRetry={() => router.refresh()}
                    />
                )}

                {!isLoading && !isError && urlQuery && data.results.length === 0 && (
                    <EmptyState
                        title="Nothing loud here."
                        message="Try adjusting the kind or searching a different title."
                        actionLabel="Clear search"
                        onAction={() => replaceParam({ q: '' })}
                    />
                )}

                {showInitialSkeleton ? (
                    <MovieGridSkeleton count={15} />
                ) : (
                    data.results.length > 0 && (
                        <InfiniteScroll
                            dataLength={data.results.length}
                            next={fetchNextPage}
                            hasMore={!!hasNextPage}
                            loader={null}
                        >
                            {kind === 'person' ? (
                                <MovieGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {data.results.map(p => (
                                        <PersonCard key={p.id} person={p} />
                                    ))}
                                </MovieGrid>
                            ) : (
                                <MovieGrid>
                                    {data.results.map(m => (
                                        <MovieCard
                                            key={`${m.id}-${m.title || m.name}`}
                                            movie={m}
                                            type={kind}
                                        />
                                    ))}
                                </MovieGrid>
                            )}
                        </InfiniteScroll>
                    )
                )}

                <div ref={loaderRef} className="h-12 flex items-center justify-center">
                    {isLoading && data.results.length > 0 && (
                        <span className="text-caption text-[var(--text-muted)]">
                            Loading more results…
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
