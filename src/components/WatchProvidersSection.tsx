'use client';
import { useEffect, useMemo, useState } from 'react';
import { WatchLinksResponse } from '@/types/watchLinks';

interface WatchProvidersSectionProps {
    tmdbId: number;
    type: 'movie' | 'tv';
}

function countryToFlag(code: string): string {
    if (!code || code.length !== 2) return code;
    return code
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export function WatchProvidersSection({ tmdbId, type }: WatchProvidersSectionProps) {
    const [data, setData] = useState<WatchLinksResponse | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            setStatus('loading');
            try {
                const response = await fetch('/api/watch-links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tmdbId, type }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }

                const payload = (await response.json()) as WatchLinksResponse;
                setData(payload);
                setStatus('ready');
            } catch (error) {
                if ((error as Error).name === 'AbortError') return;
                setStatus('error');
            }
        };

        void load();

        return () => controller.abort();
    }, [tmdbId, type]);

    const platforms = useMemo(() => data?.platforms ?? [], [data]);

    const showSkeleton = status === 'loading' || status === 'idle';
    const hasProviders = platforms.length > 0;

    if (status === 'error' && !data) {
        return null;
    }

    return (
        <section className="mb-10 rounded-2xl bg-gray-900/60 border border-gray-800 p-5 shadow-lg min-h-[150px]">
            <div className="flex items-center justify-between gap-3 mb-4">
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
                    <div className="h-4 w-40 rounded bg-gray-800 animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                        <div className="h-12 flex-1 rounded-lg bg-gray-800 animate-pulse" />
                    </div>
                </div>
            )}

            {!showSkeleton && hasProviders && (
                <div className="flex flex-wrap gap-3" role="list">
                    {platforms.map(platform => (
                        <a
                            key={platform.name}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            aria-label={`Open ${platform.name} in a new tab`}
                            className="rounded-xl border border-gray-800 bg-gray-800/60 px-4 py-3 text-sm font-medium text-gray-100 hover:border-gray-600 hover:bg-gray-800 transition"
                            role="listitem"
                        >
                            {platform.name}
                        </a>
                    ))}
                </div>
            )}

            {!showSkeleton && !hasProviders && (
                <div className="space-y-2">
                    <p className="text-gray-300 text-sm">Streaming availability is limited in your region.</p>
                    {data?.note && <p className="text-gray-400 text-sm">{data.note}</p>}
                </div>
            )}
        </section>
    );
}

export default WatchProvidersSection;
