'use client';

import { useEffect, useMemo, useState } from 'react';

type WatchLinksProps = {
    type: 'movie' | 'tv';
    title: string;
    year?: number;
};

type WatchLink = { provider: string; url: string };

type WatchLinksResponse = {
    links: WatchLink[];
    note?: string;
    updatedAt: string;
};

export default function WatchLinks({ type, title, year }: WatchLinksProps) {
    const [data, setData] = useState<WatchLinksResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const requestBody = useMemo(
        () => ({
            type,
            title: title.trim(),
            year,
        }),
        [type, title, year],
    );

    useEffect(() => {
        let isCancelled = false;

        async function fetchLinks() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/watch-links', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error('Failed to load watch links');
                }

                const payload: WatchLinksResponse = await response.json();

                if (!isCancelled) {
                    setData(payload);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError('Unable to load watch links right now.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchLinks();

        return () => {
            isCancelled = true;
        };
    }, [requestBody]);

    const links = data?.links ?? [];
    const note = data?.note;

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-semibold">Where to watch</h2>
                {data?.updatedAt && (
                    <span className="text-xs text-gray-400">
                        Updated {new Date(data.updatedAt).toLocaleString()}
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="flex flex-wrap gap-3">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="h-11 w-28 rounded-2xl border border-white/10 bg-white/10 animate-pulse"
                        />
                    ))}
                </div>
            ) : error ? (
                <p className="text-sm text-red-300">{error}</p>
            ) : links.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {links.slice(0, 6).map(link => (
                        <a
                            key={link.provider}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-purple-300/60 hover:text-purple-100"
                        >
                            {link.provider}
                        </a>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-300">No official links found yet.</p>
            )}

            {note && !isLoading && (
                <p className="mt-3 text-sm text-gray-300 italic">{note}</p>
            )}
        </div>
    );
}
