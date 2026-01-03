import 'server-only';
import { movieOfTheNightApiKey, movieOfTheNightBaseUrl } from '@/config/serverEnv';
import { normalizeWhereToWatch } from './normalizeWhereToWatch';
import { WhereToWatch } from '../types';

export class WatchAvailabilityError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = 'WatchAvailabilityError';
        this.status = status;
    }
}

type Params = {
    type: 'movie' | 'tv';
    id: string | number;
    region: string;
};

const REVALIDATE_SECONDS = 60 * 60 * 12; // 12 hours

export async function getWhereToWatch({ type, id, region }: Params): Promise<WhereToWatch | null> {
    const url = `${movieOfTheNightBaseUrl}/shows/${type}/${id}?country=${region}`;

    const response = await fetch(url, {
        headers: {
            'X-RapidAPI-Key': movieOfTheNightApiKey,
            'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
        },
        next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
        const status = response.status;
        let message = `Streaming availability request failed with status ${status}`;

        if (status === 401 || status === 403) {
            message = 'Access to streaming availability is unauthorized. Please check API credentials.';
        } else if (status === 429) {
            message = 'Streaming availability rate limit exceeded. Please try again shortly.';
        }

        throw new WatchAvailabilityError(message, status);
    }

    const payload = await response.json();
    return normalizeWhereToWatch({ payload, region });
}

export { REVALIDATE_SECONDS as WATCH_REVALIDATE_SECONDS };
