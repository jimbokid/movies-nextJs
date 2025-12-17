export type WatchProviderType = 'stream' | 'rent' | 'buy' | 'search';

export interface WatchProvider {
    name: string;
    logo_path?: string;
    type: WatchProviderType;
    link: string;
}

export interface WatchProviderSuggestion {
    name: string;
    url: string;
}

export interface WatchProvidersRequest {
    tmdbId: number;
    type: 'movie' | 'tv';
    country?: string;
    title?: string;
}

export interface WatchProvidersResponse {
    country: string;
    providers: WatchProvider[];
    ai_note?: string;
    ai_suggestions?: WatchProviderSuggestion[];
}
