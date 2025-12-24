export type WatchProviderType = 'subscription' | 'rent' | 'buy' | 'free' | 'ads';

export interface WatchProvider {
    id: string;
    name: string;
    logo?: string;
    link: string;
    type: WatchProviderType;
}

export interface WhereToWatch {
    region: string;
    providers: WatchProvider[];
    lastUpdated?: string;
}
