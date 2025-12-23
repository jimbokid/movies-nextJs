import 'server-only';

import { WATCH_PROVIDER_PRIORITY } from '@/constants/streaming';
import { serverEnv } from '@/lib/serverEnv';
import { WatchProvider, WatchProviderType, WhereToWatch } from '@/types/whereToWatch';

type RawStreamingOption = {
    service?: string;
    provider?: string;
    name?: string;
    type?: string;
    link?: string;
    watchLink?: string;
    webUrl?: string;
    url?: string;
    deepLink?: string;
    streamingUrl?: string;
    playerUrl?: string;
    price?: { type?: string; link?: string };
    logo?: string;
    icon?: string;
    image?: string;
    imageSet?: { verticalPoster?: string; horizontalPoster?: string };
    platform?: { id?: string; name?: string; icon?: string };
    offerType?: string;
};

type StreamingOptionsRecord = Record<string, RawStreamingOption[] | undefined>;

const SERVICE_NAME_OVERRIDES: Record<string, string> = {
    netflix: 'Netflix',
    prime: 'Prime Video',
    'prime video': 'Prime Video',
    apple: 'Apple TV',
    'apple tv': 'Apple TV',
    appletv: 'Apple TV',
    'apple tv+': 'Apple TV+',
    disney: 'Disney+',
    disneyplus: 'Disney+',
    hulu: 'Hulu',
    hbo: 'Max',
    max: 'Max',
    paramount: 'Paramount+',
    paramountplus: 'Paramount+',
    peacock: 'Peacock',
    'peacock tv': 'Peacock',
    mubi: 'MUBI',
};

class UpstreamError extends Error {
    status?: number;
}

const mapProviderType = (type?: string): WatchProviderType => {
    const normalized = (type ?? '').toLowerCase();
    switch (normalized) {
        case 'subscription':
        case 'stream':
            return 'subscription';
        case 'free':
            return 'free';
        case 'ads':
        case 'ad':
            return 'ads';
        case 'rent':
            return 'rent';
        case 'buy':
        case 'purchase':
            return 'buy';
        default:
            return 'subscription';
    }
};

const typePriority = (type: WatchProviderType) => {
    const rank = WATCH_PROVIDER_PRIORITY.indexOf(type);
    return rank === -1 ? WATCH_PROVIDER_PRIORITY.length : rank;
};

const sortProviders = (providers: WatchProvider[]) =>
    providers.slice().sort((a, b) => {
        const priorityDiff = typePriority(a.type) - typePriority(b.type);
        if (priorityDiff !== 0) return priorityDiff;
        return a.name.localeCompare(b.name);
    });

const pickBestLink = (option: RawStreamingOption) =>
    option.watchLink ??
    option.link ??
    option.webUrl ??
    option.url ??
    option.playerUrl ??
    option.streamingUrl ??
    option.deepLink ??
    option.price?.link;

const formatServiceName = (serviceId: string, fallback?: string) => {
    const normalized = serviceId.toLowerCase();
    return SERVICE_NAME_OVERRIDES[normalized] ?? fallback ?? serviceId.replace(/_/g, ' ');
};

const selectBestOffer = (offers: RawStreamingOption[]): RawStreamingOption | undefined =>
    offers
        .slice()
        .sort(
            (a, b) =>
                typePriority(mapProviderType(a.type ?? a.offerType)) -
                typePriority(mapProviderType(b.type ?? b.offerType)),
        )[0];

const normalizeWhereToWatch = (payload: unknown, region: string): WhereToWatch | null => {
    const record =
        (payload as { streamingOptions?: StreamingOptionsRecord })?.streamingOptions ??
        (payload as { streamingInfo?: StreamingOptionsRecord })?.streamingInfo;

    if (!record || typeof record !== 'object') return null;

    const regionKey = region.toLowerCase();
    const optionsForRegion = (record as StreamingOptionsRecord)[regionKey] ??
        (record as StreamingOptionsRecord)[regionKey.toUpperCase()];

    if (!optionsForRegion || !Array.isArray(optionsForRegion) || optionsForRegion.length === 0)
        return null;

    const grouped = optionsForRegion.reduce<Map<string, RawStreamingOption[]>>((acc, option) => {
        const serviceId =
            option?.service ??
            option?.provider ??
            option?.platform?.id ??
            option?.name;
        if (!serviceId) return acc;
        const key = serviceId.toString();
        const current = acc.get(key) ?? [];
        current.push(option);
        acc.set(key, current);
        return acc;
    }, new Map());

    const providers: WatchProvider[] = [];

    grouped.forEach((offers, serviceId) => {
        const best = selectBestOffer(offers);
        if (!best) return;
        const link = pickBestLink(best);
        if (!link) return;
        const logo =
            best.logo ??
            best.icon ??
            best.image ??
            best.imageSet?.verticalPoster ??
            best.platform?.icon;

        providers.push({
            id: serviceId,
            name: formatServiceName(serviceId, best.name ?? best.platform?.name),
            logo,
            link,
            type: mapProviderType(best.type ?? best.offerType ?? best.price?.type),
        });
    });

    if (!providers.length) return null;

    const lastUpdatedRaw =
        (payload as { lastUpdate?: string | number })?.lastUpdate ??
        (payload as { lastUpdated?: string | number })?.lastUpdated ??
        (payload as { updatedAt?: string | number })?.updatedAt;

    const lastUpdated =
        lastUpdatedRaw !== undefined ? new Date(lastUpdatedRaw).toISOString() : undefined;

    return {
        region: regionKey,
        providers: sortProviders(providers),
        lastUpdated,
    };
};

export const getWhereToWatch = async ({
    type,
    id,
    region,
}: {
    type: 'movie' | 'tv';
    id: string | number;
    region: string;
}): Promise<WhereToWatch | null> => {
    const url = new URL(
        `${serverEnv.movieOfTheNightBaseUrl.replace(/\/$/, '')}/shows/${type}/${id}`,
    );
    url.searchParams.set('country', region.toLowerCase());

    const response = await fetch(url.toString(), {
        headers: {
            'X-RapidAPI-Key': serverEnv.movieOfTheNightApiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
        next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
        const error = new UpstreamError('Streaming availability request failed');
        error.status = response.status;
        throw error;
    }

    const payload = await response.json();
    return normalizeWhereToWatch(payload, region);
};
