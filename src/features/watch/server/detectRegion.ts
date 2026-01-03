import 'server-only';

const GEO_HEADERS = ['x-vercel-ip-country', 'cf-ipcountry', 'x-country-code'] as const;
const REGION_REGEX = /^[a-z]{2}$/;

type DetectRegionParams = {
    headers: Headers;
    searchParams?: URLSearchParams;
};

function isValidRegion(region: string | null | undefined): region is string {
    if (!region) return false;
    const normalized = region.toLowerCase();
    return REGION_REGEX.test(normalized) && normalized !== 'xx';
}

function detectFromHeaders(headers: Headers): string | null {
    for (const header of GEO_HEADERS) {
        const value = headers.get(header);
        if (isValidRegion(value)) {
            return value.toLowerCase();
        }
    }
    return null;
}

function detectFromAcceptLanguage(headers: Headers): string | null {
    const acceptLanguage = headers.get('accept-language');
    if (!acceptLanguage) return null;

    const locales = acceptLanguage
        .split(',')
        .map(part => part.trim().split(';')[0]?.toLowerCase())
        .filter(Boolean);

    if (locales.some(locale => locale === 'en-us' || locale.startsWith('en-us'))) {
        return 'us';
    }

    if (locales.some(locale => locale === 'uk' || locale === 'uk-ua' || locale.startsWith('uk-ua'))) {
        return 'ua';
    }

    return null;
}

export function detectRegion({ headers, searchParams }: DetectRegionParams): string {
    if (process.env.NODE_ENV !== 'production') {
        const debugRegion = searchParams?.get('debugRegion');
        if (isValidRegion(debugRegion)) {
            return debugRegion.toLowerCase();
        }
    }

    const headerRegion = detectFromHeaders(headers);
    if (headerRegion) {
        return headerRegion;
    }

    const acceptLanguageRegion = detectFromAcceptLanguage(headers);
    if (acceptLanguageRegion) {
        return acceptLanguageRegion;
    }

    return 'ua';
}
