'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { WatchProvider, WatchProvidersResponse } from '@/types/watchProviders';

interface WatchProvidersSectionProps {
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
}

function countryToFlag(code: string): string {
    if (!code || code.length !== 2) return code;
    return code
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

const providerLabels: Record<Exclude<WatchProvider['type'], 'search'>, string> = {
    stream: 'Stream',
    rent: 'Rent',
    buy: 'Buy',
};

export function WatchProvidersSection({ tmdbId, type, title }: WatchProvidersSectionProps) {
    const [data, setData] = useState<WatchProvidersResponse | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setStatus('loading');
            try {
                const response = await fetch('/api/watch-providers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tmdbId, type, title }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const payload = (await response.json()) as WatchProvidersResponse;
                setData(payload);
                setStatus('ready');
            } catch (error) {
                if ((error as Error).name === 'AbortError') return;
                setStatus('error');
            }
        };

        void load();

        return () => controller.abort();
    }, [tmdbId, type, title]);

    const groupedProviders = useMemo(() => {
        const groups: Record<'stream' | 'rent' | 'buy', WatchProvider[]> = {
            stream: [],
            rent: [],
            buy: [],
        };

        data?.providers.forEach(provider => {
            if (provider.type === 'search') return;
            if (groups[provider.type]) {
                groups[provider.type].push(provider);
            }
        });

        return groups;
    }, [data]);

    const showSkeleton = status === 'loading' || status === 'idle';
    const hasProviders = Object.values(groupedProviders).some(list => list.length > 0);

    if (status === 'error' && !data) {
        return null;
    }

    return (
        <section className="mb-10 rounded-2xl bg-gray-900/60 border border-gray-800 p-5 shadow-lg min-h-[180px]">
            <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                    <h2 className="text-2xl font-semibold">Where to watch</h2>
                    {data?.country && (
                        <p className="text-sm text-gray-400">
                            <span className="mr-1" aria-hidden>
                                {countryToFlag(data.country)}
                            </span>
                            Available in {data.country}
                        </p>
                    )}
                </div>
                {showSkeleton && <div className="h-8 w-28 rounded bg-gray-800 animate-pulse" />}
            </div>

            {showSkeleton && (
                <div className="space-y-3" aria-hidden>
                    <div className="h-4 w-1/2 rounded bg-gray-800 animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                    </div>
                </div>
            )}

            {!showSkeleton && hasProviders && (
                <div className="space-y-5">
                    {(['stream', 'rent', 'buy'] as const).map(typeKey => {
                        const providers = groupedProviders[typeKey];
                        if (providers.length === 0) return null;

                        return (
                            <div key={typeKey} className="space-y-2">
                                <p className="text-sm uppercase tracking-wide text-gray-400">{providerLabels[typeKey]}</p>
                                <div className="flex flex-wrap gap-3">
                                    {providers.map(provider => (
                                        <a
                                            key={`${provider.name}-${typeKey}`}
                                            href={provider.link}
                                            target="_blank"
                                            rel="nofollow noopener"
                                            aria-label={`${provider.name} ${providerLabels[typeKey]} option`}
                                            className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-800/60 px-4 py-2 text-sm text-gray-100 hover:border-gray-600 hover:bg-gray-800 transition"
                                        >
                                            <div className="relative h-7 w-7 overflow-hidden rounded-md bg-gray-800">
                                                {provider.logo_path ? (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                                        alt={provider.name}
                                                        fill
                                                        sizes="28px"
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 flex items-center justify-center h-full w-full">
                                                        {provider.name.slice(0, 2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col leading-tight">
                                                <span className="font-medium">{provider.name}</span>
                                                <span className="text-xs text-gray-400">{providerLabels[typeKey]}</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!showSkeleton && !hasProviders && (
                <div className="space-y-3">
                    <p className="text-gray-300 text-sm">
                        {data?.ai_note ?? 'No availability data is currently available for your region.'}
                    </p>

                    {data?.ai_suggestions && data.ai_suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {data.ai_suggestions.map(suggestion => (
                                <a
                                    key={`${suggestion.name}-${suggestion.url}`}
                                    href={suggestion.url}
                                    target="_blank"
                                    rel="nofollow noopener"
                                    aria-label={`Search for ${title} on ${suggestion.name}`}
                                    className="rounded-lg border border-gray-800 bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:border-gray-600 hover:bg-gray-800 transition"
                                >
                                    {suggestion.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default WatchProvidersSection;
