'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useWatchAvailability } from '../client/useWatchAvailability';
import { WatchOffer } from '../types';

const DEFAULT_COUNTRY = 'UA';
const STORAGE_KEY = 'cineview-watch-country';

const COUNTRY_OPTIONS = [
    { code: 'UA', label: 'Ukraine' },
    { code: 'PL', label: 'Poland' },
    { code: 'DE', label: 'Germany' },
    { code: 'US', label: 'United States' },
    { code: 'CA', label: 'Canada' },
    { code: 'GB', label: 'United Kingdom' },
];

const OFFER_GROUPS: { types: Array<WatchOffer['type']>; label: string }[] = [
    { types: ['subscription'], label: 'Subscription' },
    { types: ['free', 'ads'], label: 'Free / Ads' },
    { types: ['rent'], label: 'Rent' },
    { types: ['buy'], label: 'Buy' },
];

type Props = {
    tmdbId: number;
    country: string;
};

const normalizeCountry = (value?: string | null) =>
    value && /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : null;

function OfferRow({ offer }: { offer: WatchOffer }) {
    const priceLabel =
        offer.price?.formatted ??
        (offer.price?.amount && offer.price?.currency
            ? `${offer.price.amount} ${offer.price.currency}`
            : undefined);

    const meta = [priceLabel, offer.quality].filter(Boolean).join(' • ');

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-sm font-semibold uppercase text-indigo-100">
                    {offer.providerName.slice(0, 2)}
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">{offer.providerName}</p>
                    {meta && <p className="text-xs text-gray-400">{meta}</p>}
                </div>
            </div>
            <a
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:from-indigo-400 hover:to-purple-400"
            >
                Open
                <span aria-hidden>↗</span>
            </a>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(key => (
                <div
                    key={key}
                    className="h-14 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse"
                />
            ))}
        </div>
    );
}

export default function WhereToWatch({ tmdbId, country }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [selectedCountry, setSelectedCountry] = useState(
        normalizeCountry(country) || DEFAULT_COUNTRY,
    );
    const [hydrated, setHydrated] = useState(false);

    const debugMode = searchParams?.get('debugWatch') === '1';

    useEffect(() => {
        const candidateFromQuery = searchParams?.get('country');
        const candidateFromStorage =
            typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

        const resolved =
            normalizeCountry(candidateFromQuery) ||
            normalizeCountry(candidateFromStorage) ||
            normalizeCountry(country) ||
            DEFAULT_COUNTRY;

        setSelectedCountry(resolved);

        const params = new URLSearchParams(searchParams?.toString());
        if (resolved && params.get('country') !== resolved) {
            params.set('country', resolved);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }

        if (typeof window !== 'undefined' && resolved) {
            localStorage.setItem(STORAGE_KEY, resolved);
        }

        setHydrated(true);
    }, [country, pathname, router, searchParams]);

    const { data, isLoading, isFetching, isError, refetch } = useWatchAvailability(
        tmdbId,
        selectedCountry,
    );

    const groupedOffers = useMemo(() => {
        if (!data?.offers) return [];
        return OFFER_GROUPS.map(group => ({
            label: group.label,
            offers: data.offers.filter(offer => group.types.includes(offer.type)),
        })).filter(group => group.offers.length > 0);
    }, [data?.offers]);

    const showSkeleton = !hydrated || isLoading;

    return (
        <div className="mb-10 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/10 to-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/70">
                        Streaming availability
                    </p>
                    <h2 className="text-2xl font-semibold text-white">Where to watch</h2>
                    <p className="text-sm text-gray-300">
                        Subscription, rental, and purchase options powered by Movie of the Night.
                    </p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-200">
                    Country
                    <select
                        value={selectedCountry}
                        onChange={event => {
                            const nextCountry = event.target.value;
                            setSelectedCountry(nextCountry);
                            const params = new URLSearchParams(searchParams?.toString());
                            params.set('country', nextCountry);
                            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                            if (typeof window !== 'undefined') {
                                localStorage.setItem(STORAGE_KEY, nextCountry);
                            }
                        }}
                        className="rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-white shadow-inner focus:border-indigo-400 focus:outline-none"
                    >
                        {!COUNTRY_OPTIONS.some(option => option.code === selectedCountry) && (
                            <option value={selectedCountry}>{selectedCountry}</option>
                        )}
                        {COUNTRY_OPTIONS.map(option => (
                            <option key={option.code} value={option.code}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mt-6">
                {showSkeleton && <LoadingSkeleton />}

                {!showSkeleton && isError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                        <p className="font-semibold">Unable to load streaming options right now.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-500/80 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-red-500"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!showSkeleton && !isError && groupedOffers.length === 0 && (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-gray-200">
                        <p className="font-semibold">Not available to stream in {selectedCountry}.</p>
                        <p className="text-gray-400">Try a different country to see more options.</p>
                    </div>
                )}

                {!showSkeleton && !isError && groupedOffers.length > 0 && (
                    <div className="space-y-6">
                        {groupedOffers.map(group => (
                            <div key={group.label} className="space-y-3">
                                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-300">
                                    {group.label}
                                </p>
                                <div className="space-y-3">
                                    {group.offers.map(offer => (
                                        <OfferRow key={`${offer.providerKey}-${offer.link}`} offer={offer} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {debugMode && data && (
                    <div className="mt-4 rounded-lg border border-dashed border-white/20 bg-black/30 p-3 text-xs text-gray-300">
                        <p className="font-semibold">Debug</p>
                        <p>
                            Updated at: {new Date(data.updatedAt).toLocaleString()}
                        </p>
                        <p>Offers returned: {data.offers.length}</p>
                        <p>Dropped offers: {data.droppedOffers ?? 0}</p>
                        {isFetching && <p>Refreshing data...</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
