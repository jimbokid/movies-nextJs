'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useWhereToWatch } from '../client/useWhereToWatch';
import { WatchProviderItem } from '../types';

type Props = { type: 'movie' | 'tv'; id: string | number };

const TYPE_BADGE: Record<WatchProviderItem['type'], { label: string; className: string }> = {
    subscription: { label: 'Stream', className: 'bg-emerald-600/20 text-emerald-200 border-emerald-500/30' },
    free: { label: 'Free', className: 'bg-blue-600/20 text-blue-200 border-blue-500/30' },
    ads: { label: 'Ads', className: 'bg-amber-600/20 text-amber-100 border-amber-500/30' },
    rent: { label: 'Rent', className: 'bg-indigo-600/20 text-indigo-100 border-indigo-500/30' },
    buy: { label: 'Buy', className: 'bg-purple-600/20 text-purple-100 border-purple-500/30' },
    unknown: { label: 'Stream', className: 'bg-gray-700/40 text-gray-200 border-gray-600/60' },
};

function ProviderRow({ provider }: { provider: WatchProviderItem }) {
    const badge = TYPE_BADGE[provider.type];

    return (
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 shadow-sm shadow-black/40">
            <div className="flex items-center gap-3">
                {provider.logoUrl ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-900">
                        <Image
                            src={provider.logoUrl}
                            alt={provider.name}
                            fill
                            className="object-contain p-1"
                        />
                    </div>
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-sm text-gray-400">
                        {provider.name.slice(0, 2).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold text-white">{provider.name}</p>
                    <span
                        className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                    >
                        {badge.label}
                    </span>
                </div>
            </div>
            {provider.link ? (
                <a
                    href={provider.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/20"
                >
                    Open
                </a>
            ) : (
                <span className="text-xs text-gray-400">No link</span>
            )}
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-800 animate-pulse" />
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-gray-800 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-gray-800 animate-pulse" />
                </div>
            </div>
            <div className="h-8 w-16 rounded bg-gray-800 animate-pulse" />
        </div>
    );
}

export function WhereToWatchPanel({ type, id }: Props) {
    const { data, isLoading, error, refetch, isFetching } = useWhereToWatch({ type, id });

    const regionLabel = useMemo(() => data?.region?.toUpperCase() ?? '--', [data?.region]);

    return (
        <section className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/70 via-gray-900/50 to-gray-800/40 p-6 shadow-[0_16px_60px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Where to watch</h2>
                    <p className="text-sm text-gray-400">Detected region: {regionLabel}</p>
                </div>
                {data?.data?.updatedAt && (
                    <p className="text-xs text-gray-500">
                        Updated {new Date(data.data.updatedAt).toLocaleString()}
                    </p>
                )}
            </div>

            {isLoading ? (
                <div className="mt-4 space-y-3">
                    {[...Array(4)].map((_, idx) => (
                        <SkeletonRow key={idx} />
                    ))}
                </div>
            ) : error ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                    <p className="mb-3">{error.message}</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/20 disabled:opacity-60"
                    >
                        Try again
                    </button>
                </div>
            ) : !data?.data ? (
                <p className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-gray-200">
                    No streaming options found in your region.
                </p>
            ) : (
                <div className="mt-4 space-y-3">
                    {data.data.providers.map(provider => (
                        <ProviderRow key={`${provider.name}-${provider.type}`} provider={provider} />
                    ))}
                </div>
            )}
        </section>
    );
}

export default WhereToWatchPanel;
