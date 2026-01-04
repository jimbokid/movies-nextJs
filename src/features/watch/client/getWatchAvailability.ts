import { WatchAvailabilityApiResponse } from '../types';

export async function getWatchAvailability(params: {
    type: 'movie' | 'tv';
    id: string;
    title?: string;
    year?: string | number;
}): Promise<WatchAvailabilityApiResponse> {
    const search = new URLSearchParams({
        type: params.type,
        id: params.id,
    });

    if (params.title) {
        search.set('title', params.title);
    }

    if (params.year) {
        search.set('year', String(params.year));
    }

    const response = await fetch(`/api/watch-availability?${search.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = (await response.json().catch(() => null)) as WatchAvailabilityApiResponse | null;

    if (!response.ok) {
        throw new Error(data?.ok === false ? data.error : 'Failed to load watch availability.');
    }

    if (!data || !data.ok) {
        throw new Error(data?.error ?? 'Unable to load watch availability.');
    }

    return data;
}
