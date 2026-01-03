import { WatchAvailabilityApiResponse, WhereToWatch } from '../types';

type Params = {
    type: 'movie' | 'tv';
    id: string | number;
};

export async function getWatchAvailability({ type, id }: Params): Promise<{
    region: string;
    data: WhereToWatch | null;
}> {
    const search = new URLSearchParams({
        type,
        id: String(id),
    });

    const response = await fetch(`/api/watch-availability?${search.toString()}`);

    const json = (await response.json()) as WatchAvailabilityApiResponse;

    if (!json.ok) {
        throw new Error(json.error);
    }

    return {
        region: json.region,
        data: json.data,
    };
}
