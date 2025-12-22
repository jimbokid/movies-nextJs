export type WatchCountry = string; // ISO 3166-1 alpha-2, e.g. "UA"
export type ShowType = 'movie' | 'tv';

export type OfferType = 'subscription' | 'rent' | 'buy' | 'free' | 'ads' | 'unknown';

export type WatchOffer = {
    type: OfferType;
    providerKey: string; // normalized key e.g. "netflix"
    providerName: string; // display name
    link: string; // deep link
    price?: {
        amount: number;
        currency: string;
        formatted?: string;
    };
    quality?: string; // e.g. "HD", "4K" if present
};

export type WatchAvailability = {
    tmdbId: number;
    country: WatchCountry;
    updatedAt: string; // ISO string
    offers: WatchOffer[];
    droppedOffers?: number;
    raw?: unknown; // optional for debugging (guard with NODE_ENV)
};

export function parseShowType(input: string | undefined): ShowType | null {
    if (!input) return null;
    const value = input.toLowerCase();
    if (value === 'movie' || value === 'tv') return value;
    return null;
}
