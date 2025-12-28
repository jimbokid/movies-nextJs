import { TONIGHT_FALLBACK_POOL } from '@/constants/tonightFallbackPool';

function hashString(input: string) {
    return input.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
}

export function buildTonightPick(dateKey: string, avoidMovieId?: number) {
    const rerolled = Boolean(avoidMovieId);
    const offset = rerolled ? 7 : 0;
    let index = (Math.abs(hashString(dateKey)) + offset) % TONIGHT_FALLBACK_POOL.length;
    let chosen = TONIGHT_FALLBACK_POOL[index];

    if (avoidMovieId && TONIGHT_FALLBACK_POOL.length > 1 && chosen.tmdbId === avoidMovieId) {
        index = (index + 1) % TONIGHT_FALLBACK_POOL.length;
        chosen = TONIGHT_FALLBACK_POOL[index];
    }

    return {
        movieId: chosen.tmdbId,
        source: 'fallback' as const,
    };
}
