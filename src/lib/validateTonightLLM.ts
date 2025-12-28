import { sanitizeTonightCopy, containsSpoilerTerms } from './sanitizeTonightCopy';

export interface TonightLLMResponse {
    tmdbId?: number;
    title?: string;
    year?: number;
    intentLine?: string;
    whyText?: string;
}

interface ValidationResult {
    ok: boolean;
    errors: string[];
    value?: {
        tmdbId?: number;
        title?: string;
        year?: number;
        intentLine: string;
        whyText: string;
    };
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function countSentences(text: string) {
    return text.split(/(?<=[.!?])\s+/).filter(Boolean).length;
}

function hasEmoji(text: string) {
    return /([\u2700-\u27bf]|[\ud83c\udde6-\ud83c\uddff]{1,2}|[\ud800-\udbff][\udc00-\udfff])/u.test(
        text,
    );
}

export function validateTonightLLMResponse(payload: TonightLLMResponse): ValidationResult {
    const errors: string[] = [];

    const hasMovieId = isNumber(payload.tmdbId);
    const hasTitle = typeof payload.title === 'string' && payload.title.trim().length > 0;

    if (!hasMovieId && !hasTitle) {
        errors.push('Missing tmdbId and title');
    }

    if (isNumber(payload.tmdbId) && payload.tmdbId <= 0) {
        errors.push('tmdbId must be positive');
    }

    const intentLineRaw = typeof payload.intentLine === 'string' ? payload.intentLine.trim() : '';
    const whyTextRaw = typeof payload.whyText === 'string' ? payload.whyText.trim() : '';

    if (!intentLineRaw) errors.push('intentLine is required');
    if (!whyTextRaw) errors.push('whyText is required');

    if (containsSpoilerTerms(intentLineRaw) || containsSpoilerTerms(whyTextRaw)) {
        errors.push('Text appears to include spoilers');
    }

    const intentLine = sanitizeTonightCopy(intentLineRaw, 110, 1);
    const whyText = sanitizeTonightCopy(whyTextRaw, 320, 3);

    if (intentLine.length === 0) errors.push('intentLine empty after sanitize');
    if (whyText.length === 0) errors.push('whyText empty after sanitize');

    if (hasEmoji(intentLine)) errors.push('intentLine contains emoji');
    if (hasEmoji(whyText)) errors.push('whyText contains emoji');

    if (countSentences(intentLine) !== 1) errors.push('intentLine must be exactly 1 sentence');
    const whySentences = countSentences(whyText);
    if (whySentences < 2 || whySentences > 3) {
        errors.push('whyText must be 2-3 sentences');
    }

    return {
        ok: errors.length === 0,
        errors,
        value:
            errors.length === 0
                ? {
                      tmdbId: hasMovieId ? payload.tmdbId : undefined,
                      title: hasTitle ? payload.title?.trim() : undefined,
                      year: isNumber(payload.year) ? payload.year : undefined,
                      intentLine,
                      whyText,
                  }
                : undefined,
    };
}
