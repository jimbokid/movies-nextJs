const DEFAULT_COUNTRY = (process.env.TMDB_REGION ?? process.env.DEFAULT_COUNTRY ?? 'US').toUpperCase();

function normalizeCountryCode(value?: string | null): string | null {
    if (!value) return null;

    const trimmed = value.trim();
    if (trimmed.length < 2) return null;

    const [localePart] = trimmed.split(/[,;]/);
    const possibleCode = localePart.includes('-') ? localePart.split('-')[1] : localePart;
    const code = possibleCode?.slice(0, 2).toUpperCase();

    return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

export function getUserCountry(req: Request): string {
    const headerCountry = normalizeCountryCode(req.headers.get('x-vercel-ip-country'));
    if (headerCountry) return headerCountry;

    const acceptLanguage = normalizeCountryCode(req.headers.get('accept-language'));
    if (acceptLanguage) return acceptLanguage;

    return DEFAULT_COUNTRY;
}
