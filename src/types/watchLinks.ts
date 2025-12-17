export interface WatchLinksRequest {
    type: 'movie' | 'tv';
    title: string;
    originalTitle?: string;
    releaseYear?: number;
    tmdbId?: number;
}

export interface WatchPlatformLink {
    provider: string;
    url: string;
}

export interface WatchLinksResponse {
    country: string;
    updatedAt: string;
    links: WatchPlatformLink[];
    note?: string;
}
