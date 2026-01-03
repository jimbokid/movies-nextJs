export type WatchProviderItem = {
    name: string;
    logoUrl?: string;
    type: 'subscription' | 'rent' | 'buy' | 'free' | 'ads' | 'unknown';
    link?: string;
};

export type WhereToWatch = {
    region: string;
    updatedAt: string;
    providers: WatchProviderItem[];
    rawSource: 'streaming-availability';
};

export type WatchAvailabilityApiResponse =
    | { ok: true; region: string; data: WhereToWatch | null }
    | { ok: false; error: string };
