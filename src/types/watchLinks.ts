export interface WatchLinksRequest {
    tmdbId: number;
    type: 'movie' | 'tv';
}

export interface WatchPlatformLink {
    name: string;
    url: string;
}

export interface WatchLinksResponse {
    country: string;
    platforms: WatchPlatformLink[];
    note?: string;
}
