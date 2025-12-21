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

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white pt-18">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>
            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                {/* Controls */}
                <div className="flex flex-col flex-wrap sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                        <SegmentedSwitch value={urlKind} onChange={handleKindChange} />
                        <SearchInput
                            value={localQuery}
                            onChange={setLocalQuery}
                            placeholder={`Search ${urlKind}...`}
                        />
                    </div>
                </div>

                {showCuratorPanel && (
                    <section
                        className={`rounded-2xl border bg-white/5 p-4 md:p-5 shadow-[0_16px_60px_rgba(0,0,0,0.4)] ${
                            highlightCuratorPanel
                                ? 'border-purple-400/50 ring-1 ring-purple-500/25'
                                : 'border-white/10'
                        }`}
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                    Curator
                                </p>
                                <h2 className="text-xl font-semibold">Stuck? Let a curator pick.</h2>
                                <p className="text-sm text-gray-300">
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

                {/* Error */}
                {isError && !showInitialSkeleton && (
                    <div className="flex items-center justify-center min-h-[30vh] text-red-400">
                        Failed to load results 😢
                    </div>
                )}

                {/* No results */}
                {!isLoading && !isError && urlQuery && data.results.length === 0 && (
                    <div className="flex items-center justify-center min-h-[30vh] text-neutral-400">
                        No results found.
                    </div>
                )}

                {/* Results */}
                {data.results.length > 0 && (
                    <InfiniteScroll
                        dataLength={data.results.length}
                        next={fetchNextPage}
                        hasMore={!!hasNextPage}
                        loader={null}
                    >
                        {kind === 'person' ? (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {data.results.map(p => (
                                    <PersonCard key={p.id} person={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {data.results.map(m => (
                                    <MovieCard
                                        key={`${m.id}-${m.title || m.name}`}
                                        movie={m}
                                        type={kind}
                                    />
                                ))}
                            </div>
                        )}
                    </InfiniteScroll>
                )}

                {/* Bottom loader shimmer */}
                <div ref={loaderRef} className="h-16 flex items-center justify-center mt-6">
                    {isLoading && data.results.length > 0 && (
                        <div className="flex gap-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 w-10 bg-neutral-700 rounded-full animate-pulse"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
