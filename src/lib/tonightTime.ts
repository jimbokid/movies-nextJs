const KYIV_TIMEZONE = 'Europe/Kyiv';

function getKyivDate(baseDate?: Date) {
    const date = baseDate ?? new Date();
    return new Date(
        date.toLocaleString('en-US', {
            timeZone: KYIV_TIMEZONE,
        }),
    );
}

export function getKyivDateKey(baseDate?: Date): string {
    const kyivDate = getKyivDate(baseDate);
    const year = kyivDate.getFullYear();
    const month = String(kyivDate.getMonth() + 1).padStart(2, '0');
    const day = String(kyivDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getKyivResetIso(baseDate?: Date): string {
    const kyivDate = getKyivDate(baseDate);
    const reset = new Date(kyivDate);
    reset.setHours(24, 0, 0, 0);
    return reset.toISOString();
}

export function getKyivContext(baseDate?: Date) {
    const kyivDate = getKyivDate(baseDate);
    const weekday = kyivDate.toLocaleString('en-US', {
        timeZone: KYIV_TIMEZONE,
        weekday: 'long',
    });
    const hours = kyivDate.getHours();
    const timeOfDay =
        hours < 5
            ? 'late night'
            : hours < 12
              ? 'morning'
              : hours < 17
                ? 'afternoon'
                : hours < 21
                  ? 'evening'
                  : 'night';

    return {
        weekday,
        timeOfDay,
        isoTime: kyivDate.toISOString(),
    };
}

export function isValidDateKey(value?: string | null): value is string {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
