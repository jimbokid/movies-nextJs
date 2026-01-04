const COUNTRY_HEADER_KEYS = ['x-vercel-ip-country', 'cf-ipcountry'] as const;

function isValidCountryCode(code: string | null) {
    if (!code) return false;
    const normalized = code.toLowerCase();
    if (normalized === 'xx') return false;
    return /^[a-z]{2}$/.test(normalized);
}

export function detectRegion(headerList: Pick<Headers, 'get'>): string {
    for (const key of COUNTRY_HEADER_KEYS) {
        const value = headerList.get(key);
        if (isValidCountryCode(value)) {
            return value!.toLowerCase();
        }
    }

    return 'ua';
}
