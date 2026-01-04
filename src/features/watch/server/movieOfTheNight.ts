import { serverEnv } from '@/config/serverEnv';
import { normalizeWhereToWatch } from './normalizeWhereToWatch';
import { WhereToWatch } from '../types';

const RAPID_HOST = 'streaming-availability.p.rapidapi.com';
const TWELVE_HOURS = 60 * 60 * 12;

export class MovieOfTheNightError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.status = status;
        this.name = 'MovieOfTheNightError';
    }
}

export async function getWhereToWatch(params: {
    type: 'movie' | 'tv';
    id: string;
    region: string;
}): Promise<WhereToWatch | null> {
    const { type, id, region } = params;
    const url = `${serverEnv.movieOfTheNightBaseUrl}/shows/${type}/${id}?country=${region}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': serverEnv.movieOfTheNightApiKey,
            'X-RapidAPI-Host': RAPID_HOST,
        },
        next: {
            revalidate: TWELVE_HOURS,
        },
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new MovieOfTheNightError(
            `Streaming availability request failed with status ${response.status}`,
            response.status,
        );
    }

    const payload = await response.json();

    return normalizeWhereToWatch({
        payload,
        region,
    });
}
