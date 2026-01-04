export type WatchProviderItem = {
    name: string;
    logoUrl?: string;
    type: 'subscription' | 'rent' | 'buy' | 'free' | 'ads' | 'unknown' | 'link';
    link?: string;
    source: 'streaming-availability' | 'ai-web-search';
};

export type WhereToWatch = {
    region: string;
    updatedAt: string;
    providers: WatchProviderItem[];
};

export type WatchAvailabilityApiResponse =
    | { ok: true; region: string; data: WhereToWatch | null }
    | { ok: false; error: string };
