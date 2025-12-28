import axios from 'axios';
import { API_PATH, API_TOKEN, INCLUDE_ADULT, LANGUAGE, REGION } from '@/constants/appConstants';

interface ResolveInput {
    tmdbId?: number;
    title?: string;
    year?: number;
}

export type ResolutionStrategy = 'tmdbId' | 'search' | 'fallback';

export interface ResolveResult {
    movieId: number;
    resolution: ResolutionStrategy;
    resolvedTitle?: string;
    resolvedYear?: number;
    debug?: Record<string, unknown>;
}

const TMDB_API_KEY = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY ?? API_TOKEN;
const TMDB_API_PATH = process.env.TMDB_API_PATH ?? API_PATH;
const TMDB_LANGUAGE = process.env.TMDB_LANGUAGE ?? LANGUAGE;
const TMDB_REGION = process.env.TMDB_REGION ?? REGION;
const TMDB_INCLUDE_ADULT = process.env.TMDB_INCLUDE_ADULT ?? String(INCLUDE_ADULT);

async function validateTmdbId(movieId: number) {
    if (!TMDB_API_KEY) return null;
    try {
        const response = await axios.get(`${TMDB_API_PATH}movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: TMDB_LANGUAGE,
            },
        });
        if (response.status === 200 && response.data?.id) {
            return {
                id: response.data.id as number,
                title: response.data.title as string,
                year: response.data.release_date
                    ? Number.parseInt(String(response.data.release_date).slice(0, 4), 10)
                    : undefined,
            };
        }
    } catch (error) {
        console.warn('TMDB id validation failed', movieId, error);
    }
    return null;
}

async function searchTmdb(title: string, year?: number) {
    if (!TMDB_API_KEY) return null;
    try {
        const response = await axios.get(`${TMDB_API_PATH}search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                language: TMDB_LANGUAGE,
                region: TMDB_REGION,
                include_adult: TMDB_INCLUDE_ADULT,
                query: title,
                year,
                page: 1,
            },
        });

        const results: Array<{
            id: number;
            title: string;
            release_date?: string;
            popularity?: number;
        }> = Array.isArray(response.data?.results) ? response.data.results : [];

        if (results.length === 0) return null;

        const normalized = title.trim().toLowerCase();
        const exactMatch = results.find(item => item.title?.trim().toLowerCase() === normalized);
        if (exactMatch) return exactMatch;

        const nearYear = results.find(item => {
            if (!year || !item.release_date) return false;
            const releaseYear = Number.parseInt(item.release_date.slice(0, 4), 10);
            return Math.abs(releaseYear - year) <= 1;
        });
        if (nearYear) return nearYear;

        return results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0];
    } catch (error) {
        console.warn('TMDB search failed', title, error);
        return null;
    }
}

export async function resolveTonightMovie(input: ResolveInput): Promise<ResolveResult | null> {
    if (input.tmdbId && input.tmdbId > 0) {
        const validated = await validateTmdbId(input.tmdbId);
        if (validated) {
            return {
                movieId: validated.id,
                resolution: 'tmdbId',
                resolvedTitle: validated.title,
                resolvedYear: validated.year,
            };
        }
    }

    if (input.title) {
        const result = await searchTmdb(input.title, input.year);
        if (result) {
            return {
                movieId: result.id,
                resolution: 'search',
                resolvedTitle: result.title,
                resolvedYear: result.release_date
                    ? Number.parseInt(result.release_date.slice(0, 4), 10)
                    : undefined,
                debug: { matchedFromTitle: input.title, requestedYear: input.year },
            };
        }
    }

    return null;
}
