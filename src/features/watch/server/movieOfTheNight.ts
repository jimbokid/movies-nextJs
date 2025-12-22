import 'server-only';

import { OfferType, ShowType, WatchAvailability, WatchCountry, WatchOffer } from '../types';
import { PROVIDER_DOMAIN_ALLOWLIST } from '../watchLinkAllowlist';

const DEFAULT_BASE_URL = 'https://streaming-availability.p.rapidapi.com';
const REVALIDATE_SECONDS = 60 * 60 * 12;
const inFlightRequests = new Map<string, Promise<WatchAvailability>>();

const OFFER_TYPE_MAP: Record<string, OfferType> = {
    subscription: 'subscription',
    subs: 'subscription',
    streaming: 'subscription',
    rent: 'rent',
    rental: 'rent',
    buy: 'buy',
    purchase: 'buy',
    free: 'free',
    ads: 'ads',
    'ad-supported': 'ads',
    unknown: 'unknown',
};

const PROVIDER_ALIASES: Record<string, string> = {
    'primevideo': 'prime',
    'amazonprime': 'prime',
    'amazonprimevideo': 'prime',
    'amazon video': 'prime',
    'apple tv+': 'appletv',
    'apple tv': 'appletv',
    'appletv+': 'appletv',
    'hbo max': 'hbomax',
    hbomax: 'hbomax',
};

const GENERAL_ALLOWLIST: string[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeBaseUrl(base: string): string {
    if (base.startsWith('http://') || base.startsWith('https://')) return base;
    return `https://${base}`;
}

function normalizeProviderKey(raw?: unknown): string {
    if (!raw) return 'unknown';
    const text = String(raw).toLowerCase().trim();
    const compact = text.replace(/[^a-z0-9]/g, '');
    return PROVIDER_ALIASES[compact] ?? compact;
}

function normalizeOfferType(raw?: unknown): OfferType {
    if (!raw) return 'unknown';
    const key = String(raw).toLowerCase().trim();
    if (OFFER_TYPE_MAP[key]) return OFFER_TYPE_MAP[key];
    const matched = Object.keys(OFFER_TYPE_MAP).find(entry => key.includes(entry));
    return matched ? OFFER_TYPE_MAP[matched] : 'unknown';
}

function normalizePrice(value: unknown): WatchOffer['price'] | undefined {
    if (typeof value === 'number') {
        return {
            amount: value,
            currency: 'USD',
        };
    }

    if (!isRecord(value)) return undefined;

    const amount = Number(value.amount ?? value.value ?? value.price);
    const currency =
        (typeof value.currency === 'string' && value.currency) ||
        (typeof value.currency_code === 'string' && value.currency_code) ||
        (typeof value.code === 'string' && value.code) ||
        undefined;
    const formatted =
        (typeof value.formatted === 'string' && value.formatted) ||
        (typeof value.display === 'string' && value.display) ||
        (typeof value.label === 'string' && value.label) ||
        undefined;

    if (!Number.isFinite(amount) || !currency) return undefined;

    return {
        amount,
        currency,
        formatted,
    };
}

function sanitizeLink(link: unknown, providerKey: string): string | null {
    if (!link) return null;
    try {
        const url = new URL(String(link));
        if (url.protocol !== 'https:') return null;

        const allowlist = PROVIDER_DOMAIN_ALLOWLIST[providerKey] ?? GENERAL_ALLOWLIST;
        if (allowlist.length === 0) return null;

        const hostAllowed = allowlist.some(domain =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`),
        );

        return hostAllowed ? url.toString() : null;
    } catch (error) {
        console.warn('[watch] Dropped offer due to invalid URL', error);
        return null;
    }
}

function extractOffers(payload: unknown, country: WatchCountry): unknown[] {
    if (!isRecord(payload)) return [];

    const direct = payload.offers ?? payload.results ?? payload.data ?? payload.items;
    if (Array.isArray(direct)) return direct;
    if (isRecord(direct) && Array.isArray(direct.offers)) return direct.offers;

    const availability = isRecord(payload.availability) ? payload.availability : null;
    const countries = isRecord(payload.countries) ? payload.countries : null;
    const availabilityNode = availability ?? countries;
    if (availabilityNode && country && isRecord(availabilityNode[country])) {
        const countryNode = availabilityNode[country];
        if (Array.isArray((countryNode as Record<string, unknown>).offers)) {
            return (countryNode as { offers: unknown[] }).offers;
        }
    }

    return [];
}

function normalizeOffer(
    raw: unknown,
    droppedByProvider: Record<string, number>,
): WatchOffer | null {
    if (!isRecord(raw)) return null;

    const providerValue = raw.provider;
    const provider = isRecord(providerValue) ? providerValue : undefined;

    const providerKey = normalizeProviderKey(
        raw.providerKey ?? provider?.key ?? provider?.id ?? provider?.name,
    );
    const providerName =
        (typeof raw.providerName === 'string' && raw.providerName) ||
        (provider && typeof provider.name === 'string' && provider.name) ||
        (provider && typeof provider.display_name === 'string' && provider.display_name) ||
        'Unknown provider';

    const link =
        raw.link ??
        raw.url ??
        raw.deepLink ??
        raw.deeplink ??
        raw.web_url ??
        raw.webUrl ??
        raw.streamingLink;

    const sanitizedLink = sanitizeLink(link, providerKey);
    if (!sanitizedLink) {
        droppedByProvider[providerKey] = (droppedByProvider[providerKey] ?? 0) + 1;
        return null;
    }

    const price = normalizePrice(raw.price ?? raw.cost ?? raw.retail_price);
    const quality =
        (typeof raw.quality === 'string' && raw.quality) ||
        (typeof raw.presentationType === 'string' && raw.presentationType) ||
        (typeof raw.presentation_type === 'string' && raw.presentation_type) ||
        undefined;
    const type = normalizeOfferType(raw.type ?? raw.offer_type ?? raw.monetization_type);

    return {
        type,
        providerKey,
        providerName,
        link: sanitizedLink,
        price,
        quality,
    };
}

function getRapidApiHeaders(baseUrl: string): HeadersInit {
    const apiKey = process.env.MOVIE_OF_THE_NIGHT_API_KEY;
    if (!apiKey) {
        throw new Error('Missing MOVIE_OF_THE_NIGHT_API_KEY');
    }
    const host = new URL(baseUrl).hostname;
    return {
        Accept: 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': host,
    };
}

export function buildRequestUrl(type: ShowType, tmdbId: number, country: WatchCountry): string {
    const rawBase = process.env.MOVIE_OF_THE_NIGHT_BASE_URL ?? DEFAULT_BASE_URL;
    const base = normalizeBaseUrl(rawBase);
    const url = new URL(`/shows/${type}/${tmdbId}`, base);
    url.searchParams.set('country', country);
    url.searchParams.set('output_language', 'en');
    return url.toString();
}

async function fetchAvailability(
    type: ShowType,
    tmdbId: number,
    country: WatchCountry,
): Promise<WatchAvailability> {
    const rawBase = process.env.MOVIE_OF_THE_NIGHT_BASE_URL ?? DEFAULT_BASE_URL;
    const base = normalizeBaseUrl(rawBase);
    const requestUrl = buildRequestUrl(type, tmdbId, country);
    const headers = getRapidApiHeaders(base);

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers,
        next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error('[watch] Movie of the Night error', {
            url: requestUrl,
            status: response.status,
            statusText: response.statusText,
            body: body.slice(0, 800),
        });
        throw new Error(`Movie of the Night request failed with status ${response.status}`);
    }

    const payload: unknown = await response.json();
    const offers = extractOffers(payload, country);

    const droppedByProvider: Record<string, number> = {};
    const normalizedOffers: WatchOffer[] = offers
        .map(offer => normalizeOffer(offer, droppedByProvider))
        .filter((offer): offer is WatchOffer => Boolean(offer));

    if (offers.length === 0) {
        console.info(`[watch] Upstream returned empty for tmdbId=${tmdbId}, country=${country}`);
    }

    const droppedCount = Object.values(droppedByProvider).reduce((acc, val) => acc + val, 0);
    if (droppedCount > 0) {
        console.info('[watch] Dropped offers due to allowlist', {
            tmdbId,
            country,
            droppedByProvider,
        });
    }

    const payloadRecord = isRecord(payload) ? payload : {};
    const updatedAt =
        (typeof payloadRecord.updatedAt === 'string' && payloadRecord.updatedAt) ||
        (typeof payloadRecord.lastUpdated === 'string' && payloadRecord.lastUpdated) ||
        (typeof payloadRecord.lastRefreshed === 'string' && payloadRecord.lastRefreshed) ||
        new Date().toISOString();

    return {
        tmdbId,
        country,
        updatedAt,
        offers: normalizedOffers,
        droppedOffers: droppedCount,
        raw: process.env.NODE_ENV !== 'production' ? payload : undefined,
    };
}

export async function getWatchAvailability(
    type: ShowType,
    tmdbId: number,
    country: WatchCountry,
): Promise<WatchAvailability> {
    const normalizedCountry = country.toUpperCase();
    const cacheKey = `${type}-${tmdbId}-${normalizedCountry}`;

    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) return inFlight;

    const request = fetchAvailability(type, tmdbId, normalizedCountry).finally(() => {
        inFlightRequests.delete(cacheKey);
    });

    inFlightRequests.set(cacheKey, request);
    return request;
}
