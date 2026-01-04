'use client';
/* eslint-disable @next/next/no-img-element */

import { useMemo } from 'react';
import { useWhereToWatch } from '../client/useWhereToWatch';
import { WatchProviderItem } from '../types';

const TYPE_LABELS: Record<WatchProviderItem['type'], string> = {
    subscription: 'Subscription',
    rent: 'Rent',
    buy: 'Buy',
    free: 'Free',
    ads: 'Ads',
    unknown: 'Availability',
    link: 'Watch link',
};

function ExternalIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H18m0 0v4.5M18 6l-6 6m-1.5-3H6a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 6 18h6a1.5 1.5 0 0 0 1.5-1.5v-3"
            />
        </svg>
    );
}

function ProviderBadge({ label, tone }: { label: string; tone: 'primary' | 'muted' }) {
    const toneClass =
        tone === 'primary'
            ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20'
            : 'bg-blue-500/10 text-blue-200 border-blue-400/20';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${toneClass}`}
        >
            {tone === 'primary' ? '✓' : '🌐'} {label}
        </span>
    );
}

function ProviderRow({ provider }: { provider: WatchProviderItem }) {
    const content = (
        <div className="flex items-start gap-3">
            {provider.logoUrl ? (
                <img
                    src={provider.logoUrl}
                    alt={provider.name}
                    className="h-10 w-10 flex-shrink-0 rounded-xl bg-gray-900 object-contain p-1"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gray-900 text-sm text-gray-400 flex items-center justify-center">
                    🎬
                </div>
            )}

            <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{provider.name}</p>
                    <ProviderBadge
                        label={provider.source === 'ai-web-search' ? 'Web results' : 'Verified providers'}
                        tone={provider.source === 'ai-web-search' ? 'muted' : 'primary'}
                    />
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-200">
                        {TYPE_LABELS[provider.type]}
                    </span>
                </div>
                <p className="text-xs text-gray-400">
                    {provider.source === 'ai-web-search'
                        ? 'Found on the web for your region.'
                        : 'Sourced from our streaming availability partner.'}
                </p>
            </div>

            {provider.link && (
                <span className="text-gray-300">
                    <ExternalIcon />
                </span>
            )}
        </div>
    );

    if (provider.link) {
        return (
            <a
                href={provider.link}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-2xl border border-white/5 bg-white/5 px-3 py-3 hover:border-purple-400/30 hover:bg-purple-500/5 transition"
            >
                {content}
            </a>
        );
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3">
            {content}
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-3 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-gray-800" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-800" />
                <div className="h-3 w-1/2 rounded bg-gray-900" />
            </div>
            <div className="h-4 w-4 rounded bg-gray-800" />
        </div>
    );
}

export function WhereToWatchPanel(props: {
    id: string;
    type: 'movie' | 'tv';
    title: string;
    year?: string | number;
}) {
    const { data, isLoading, isError, refetch } = useWhereToWatch(props);

    const providers = useMemo(() => {
        if (!data || !data.ok) return [];
        return data.data?.providers ?? [];
    }, [data]);

    const region = data && data.ok ? data.region.toUpperCase() : '...';

    return (
        <section className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_60px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                        Availability
                    </p>
                    <h2 className="text-2xl font-semibold text-white">Where to watch</h2>
                    <p className="text-sm text-gray-300">Region: {region}</p>
                </div>
                {isError && (
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center justify-center rounded-full border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20 transition"
                    >
                        Retry
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="space-y-3">
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                </div>
            )}

            {!isLoading && isError && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-4 text-sm text-red-100">
                    We couldn&apos;t load streaming options right now. Please try again in a moment.
                </div>
            )}

            {!isLoading && !isError && providers.length === 0 && (
                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-sm text-gray-200">
                    No streaming options found in your region.
                </div>
            )}

            {!isLoading && !isError && providers.length > 0 && (
                <div className="space-y-3">
                    {providers.map(provider => (
                        <ProviderRow key={`${provider.name}-${provider.link ?? provider.type}`} provider={provider} />
                    ))}
                </div>
            )}

            {data && data.ok && !isLoading && (
                <p className="mt-4 text-xs text-gray-400">
                    Updated {new Date(data.data?.updatedAt ?? Date.now()).toLocaleString()}
                </p>
            )}
        </section>
    );
}

export default WhereToWatchPanel;
