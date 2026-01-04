import { WatchProviderItem, WhereToWatch } from '../types';

type RawProvider = {
    name?: string;
    service?: string;
    provider?: string;
    providerName?: string;
    source?: string;
    streamingType?: string;
    type?: string;
    optionType?: string;
    availability?: string;
    link?: string;
    webUrl?: string;
    url?: string;
    watchLink?: string;
    deepLink?: string;
    deeplink?: string;
    logo?: string;
    icon?: string;
    imageSet?: {
        lightThemeImage?: string;
        darkThemeImage?: string;
        whiteLogoImage?: string;
    };
};

type StreamingData =
    | {
          streamingOptions?: Record<string, unknown>;
          streamingInfo?: Record<string, unknown>;
          lastRefreshed?: string;
      }
    | Record<string, unknown>;

const TYPE_ORDER: WatchProviderItem['type'][] = [
    'subscription',
    'buy',
    'rent',
    'free',
    'ads',
    'link',
    'unknown',
];

function toProviderType(value?: string | null): WatchProviderItem['type'] {
    if (!value) return 'unknown';
    const normalized = value.toLowerCase();

    if (normalized.includes('subscription') || normalized === 'sub') return 'subscription';
    if (normalized.includes('rent') || normalized === 'rental') return 'rent';
    if (normalized.includes('buy') || normalized.includes('purchase')) return 'buy';
    if (normalized === 'free' || normalized.includes('freevee')) return 'free';
    if (normalized.includes('ads') || normalized.includes('ad-supported')) return 'ads';
    if (normalized === 'link') return 'link';

    return 'unknown';
}

function toProviderName(provider: RawProvider) {
    return (
        provider.name ??
        provider.providerName ??
        provider.provider ??
        provider.service ??
        'Unknown provider'
    );
}

function toProviderLogo(provider: RawProvider) {
    return (
        provider.logo ??
        provider.icon ??
        provider.imageSet?.lightThemeImage ??
        provider.imageSet?.darkThemeImage ??
        provider.imageSet?.whiteLogoImage
    );
}

function toProviderLink(provider: RawProvider) {
    return (
        provider.link ??
        provider.webUrl ??
        provider.url ??
        provider.watchLink ??
        provider.deepLink ??
        provider.deeplink
    );
}

function flattenStreamingOptions(options: unknown): RawProvider[] {
    if (!options) return [];
    if (Array.isArray(options)) return options as RawProvider[];
    if (typeof options === 'object') {
        const values = Object.values(options as Record<string, unknown>);
        return values.flatMap(flattenStreamingOptions);
    }
    return [];
}

function dedupeProviders(providers: WatchProviderItem[]): WatchProviderItem[] {
    const seen = new Set<string>();

    return providers.filter(provider => {
        const key = `${provider.name.toLowerCase()}|${provider.type}|${provider.link ?? ''}`;

        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function normalizeWhereToWatch({
    payload,
    region,
}: {
    payload: StreamingData;
    region: string;
}): WhereToWatch | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const optionsSource =
        (payload.streamingOptions as Record<string, unknown>) ??
        (payload.streamingInfo as Record<string, unknown>) ??
        {};

    const regionOptions = optionsSource[region] ?? optionsSource[region.toUpperCase()];
    const options = flattenStreamingOptions(regionOptions);

    const providers = options
        .map(item => {
            const type = toProviderType(
                item.streamingType ?? item.type ?? item.optionType ?? item.availability,
            );

            return {
                name: toProviderName(item),
                type,
                link: toProviderLink(item),
                logoUrl: toProviderLogo(item),
                source: 'streaming-availability' as const,
            };
        })
        .filter(item => Boolean(item.name?.trim()))
        .sort((a, b) => {
            const typeRank = TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type);
            if (typeRank !== 0) return typeRank;
            return a.name.localeCompare(b.name);
        });

    const uniqueProviders = dedupeProviders(providers);

    if (uniqueProviders.length === 0) {
        return null;
    }

    const updatedAt =
        typeof payload.lastRefreshed === 'string' && payload.lastRefreshed
            ? payload.lastRefreshed
            : new Date().toISOString();

    return {
        region,
        updatedAt,
        providers: uniqueProviders,
    };
}
