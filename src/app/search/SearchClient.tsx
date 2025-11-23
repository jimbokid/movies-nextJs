'use client';

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

import SegmentedSwitch from '@/components/SegmentedSwitch';
import SearchInput from '@/components/SearchInput';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import MovieCard from '@/components/MovieCard';
import PersonCard from '@/components/PersonCard';

type Kind = 'movie' | 'tv' | 'person';

const DEFAULT_KIND: Kind = 'movie';

export default function SearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ---- Read from URL (single source of truth) ----
    const urlKind = (searchParams.get('kind') as Kind) || DEFAULT_KIND;
    const urlQuery = searchParams.get('q') ?? '';

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

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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
