import 'server-only';
import { WatchProviderItem, WhereToWatch } from '../types';

type ProviderType = WatchProviderItem['type'];

type StreamingEntry = {
    type?: string;
    streamingType?: string;
    service?: string;
    provider?: string;
    name?: string;
    link?: string;
    url?: string;
    webUrl?: string;
    watchLink?: string;
    homepage?: string;
    deeplink?: string;
    logo?: string;
    icon?: string;
    image?: string;
};

type StreamingInfoValue =
    | StreamingEntry
    | StreamingEntry[]
    | Record<string, StreamingEntry | StreamingEntry[]>;

type StreamingInfo =
    | Record<string, StreamingInfoValue>
    | {
          [country: string]: StreamingInfoValue;
      };

type UpstreamPayload = {
    streamingInfo?: StreamingInfo;
};

const TYPE_ORDER: ProviderType[] = ['subscription', 'free', 'ads', 'rent', 'buy', 'unknown'];
const TYPE_PRIORITY = TYPE_ORDER.reduce<Record<ProviderType, number>>((acc, type, index) => {
    acc[type] = index;
    return acc;
}, {} as Record<ProviderType, number>);

function normalizeType(value?: string): ProviderType {
    const normalized = value?.toLowerCase();

    switch (normalized) {
        case 'subscription':
        case 'sub':
        case 'streaming':
        case 'stream':
            return 'subscription';
        case 'free':
            return 'free';
        case 'ads':
        case 'ad':
        case 'withads':
        case 'with_ads':
            return 'ads';
        case 'rent':
        case 'rental':
            return 'rent';
        case 'buy':
        case 'purchase':
            return 'buy';
        default:
            return 'unknown';
    }
}

function pickLink(entry: StreamingEntry): string | undefined {
    return (
        entry.link ||
        entry.watchLink ||
        entry.url ||
        entry.webUrl ||
        entry.homepage ||
        entry.deeplink
    );
}

function pickLogo(entry: StreamingEntry): string | undefined {
    return entry.logo || entry.icon || entry.image;
}

function extractProviderName(entry: StreamingEntry, fallback: string): string {
    return entry.name || entry.service || entry.provider || fallback;
}

function flattenEntries(value: StreamingInfoValue, providerKey: string): StreamingEntry[] {
    if (Array.isArray(value)) {
        return value.map(item => ({ ...item, name: item.name ?? providerKey }));
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Some APIs nest provider details further
        if ('type' in value || 'streamingType' in value || 'link' in value || 'url' in value) {
            return [{ ...(value as StreamingEntry), name: (value as StreamingEntry).name ?? providerKey }];
        }

        return Object.entries(value).flatMap(([nestedKey, nestedValue]) =>
            flattenEntries(nestedValue as StreamingInfoValue, nestedKey),
        );
    }

    return [];
}

export function normalizeWhereToWatch({
    payload,
    region,
}: {
    payload: UpstreamPayload | undefined | null;
    region: string;
}): WhereToWatch | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const streamingInfo = (payload as UpstreamPayload).streamingInfo;
    if (!streamingInfo || typeof streamingInfo !== 'object') {
        return null;
    }

    const regionKey = region.toUpperCase();
    const normalizedRegion = region.toLowerCase();
    const regionStreaming =
        (streamingInfo as Record<string, StreamingInfoValue>)[regionKey] ??
        (streamingInfo as Record<string, StreamingInfoValue>)[normalizedRegion];

    if (!regionStreaming) {
        return null;
    }

    const entries: StreamingEntry[] = [];
    if (Array.isArray(regionStreaming) || typeof regionStreaming !== 'object') {
        entries.push(...flattenEntries(regionStreaming, ''));
    } else {
        for (const [providerKey, value] of Object.entries(regionStreaming)) {
            entries.push(...flattenEntries(value, providerKey));
        }
    }

    if (entries.length === 0) {
        return null;
    }

    const deduped = new Map<string, WatchProviderItem>();

    for (const entry of entries) {
        const providerName = extractProviderName(entry, 'Unknown');
        const providerType = normalizeType(entry.type || entry.streamingType);
        const key = `${providerName}|${providerType}`;

        const existing = deduped.get(key);
        const link = pickLink(entry) ?? existing?.link;
        const logoUrl = pickLogo(entry) ?? existing?.logoUrl;

        deduped.set(key, {
            name: providerName,
            type: providerType,
            link,
            logoUrl,
        });
    }

    const providers = Array.from(deduped.values()).sort((a, b) => {
        const priorityDiff = TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
        if (priorityDiff !== 0) return priorityDiff;
        return a.name.localeCompare(b.name);
    });

    if (providers.length === 0) {
        return null;
    }

    return {
        region: normalizedRegion,
        updatedAt: new Date().toISOString(),
        providers,
        rawSource: 'streaming-availability',
    };
}
