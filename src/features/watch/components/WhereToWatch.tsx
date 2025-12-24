'use client';

import { DEFAULT_STREAMING_REGION, WATCH_PROVIDER_PRIORITY } from '@/constants/streaming';
import { useWhereToWatch } from '@/features/watch/hooks/useWhereToWatch';
import { WatchProvider, WatchProviderType } from '@/types/whereToWatch';
import { useMemo, useState } from 'react';

interface WhereToWatchProps {
    type: 'movie' | 'tv';
    id: string | number;
    region?: string;
    compact?: boolean;
}

const PROVIDER_TYPE_LABELS: Record<WatchProviderType, string> = {
    subscription: 'Stream',
    free: 'Free',
    ads: 'Free (ads)',
    rent: 'Rent',
    buy: 'Buy',
};

const priorityRank = (type: WatchProviderType) => {
    const rank = WATCH_PROVIDER_PRIORITY.indexOf(type);
    return rank === -1 ? WATCH_PROVIDER_PRIORITY.length : rank;
};

const sortProviders = (providers: WatchProvider[]) =>
    providers.slice().sort((a, b) => {
        const priorityDiff = priorityRank(a.type) - priorityRank(b.type);
        if (priorityDiff !== 0) return priorityDiff;
        return a.name.localeCompare(b.name);
    });

const SkeletonChip = () => (
    <span className="h-9 w-28 animate-pulse rounded-full bg-white/5 border border-white/10" />
);

const ProviderChip = ({ provider }: { provider: WatchProvider }) => (
    <a
        key={provider.id}
        href={provider.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-100 transition hover:border-purple-300/50 hover:bg-purple-500/10"
    >
        <span>{provider.name}</span>
        <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium text-gray-200">
            {PROVIDER_TYPE_LABELS[provider.type]}
        </span>
    </a>
);

export default function WhereToWatch({
    type,
    id,
    region = DEFAULT_STREAMING_REGION,
    compact = false,
}: WhereToWatchProps) {
    const [expanded, setExpanded] = useState(false);
    const { providers, isLoading, isFetching, isError, refetch } = useWhereToWatch({
        type,
        id,
        region,
    });

    const sortedProviders = useMemo(() => sortProviders(providers), [providers]);
    const visibleProviders = useMemo(
        () => (compact && !expanded ? sortedProviders.slice(0, 3) : sortedProviders),
        [compact, expanded, sortedProviders],
    );

    const showToggle = compact && sortedProviders.length > 3 && !isLoading && !isError;

    return (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">Where to watch</h3>
                    <span className="text-xs uppercase tracking-[0.14em] text-gray-400">
                        Region: {region.toUpperCase()}
                    </span>
                </div>
                {showToggle && (
                    <button
                        type="button"
                        onClick={() => setExpanded(prev => !prev)}
                        className="text-xs font-semibold text-purple-200 underline underline-offset-4 hover:text-purple-100"
                    >
                        {expanded ? 'See less' : 'See all'}
                    </button>
                )}
            </div>

            {isLoading || isFetching ? (
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: compact ? 3 : 5 }).map((_, idx) => (
                        <SkeletonChip key={`skeleton-${idx}`} />
                    ))}
                </div>
            ) : isError ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
                    <span>Could not load streaming providers.</span>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="rounded-full border border-amber-200/50 px-3 py-1 text-xs font-semibold text-amber-50 hover:border-amber-100/80"
                    >
                        Retry
                    </button>
                </div>
            ) : visibleProviders.length === 0 ? (
                <p className="text-sm text-gray-300">
                    No streaming links found for your region.
                </p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {visibleProviders.map(provider => (
                        <ProviderChip key={`${provider.id}-${provider.type}`} provider={provider} />
                    ))}
                </div>
            )}
        </div>
    );
}
