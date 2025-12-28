import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_PATH, API_TOKEN, LANGUAGE } from '@/constants/appConstants';
import { TonightMovie, TonightPickResponse, TonightWhyResponse } from '@/types/tonight';

async function fetchTonightPick(): Promise<TonightPickResponse> {
    const response = await fetch('/api/tonight');
    if (!response.ok) {
        throw new Error('Failed to load tonight pick');
    }
    return response.json();
}

async function fetchTonightMovie(movieId: number): Promise<TonightMovie> {
    const response = await fetch(
        `${API_PATH}movie/${movieId}?api_key=${API_TOKEN}&language=${LANGUAGE}`,
    );
    if (!response.ok) {
        throw new Error('Failed to load movie details');
    }
    return response.json();
}

async function rerollTonightPick(dateKey?: string): Promise<TonightPickResponse> {
    const response = await fetch('/api/tonight/reroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey }),
    });
    if (!response.ok) {
        throw new Error('Reroll failed');
    }
    return response.json();
}

async function fetchWhyCopy(movieId: number, dateKey?: string): Promise<TonightWhyResponse> {
    const response = await fetch('/api/tonight/why', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, dateKey }),
    });
    if (!response.ok) {
        throw new Error('Why copy failed');
    }
    return response.json();
}

export default function useTonightPick() {
    const queryClient = useQueryClient();

    const pickQuery = useQuery({
        queryKey: ['tonight-pick'],
        queryFn: fetchTonightPick,
        staleTime: 1000 * 60 * 10,
        retry: 1,
    });

    const movieQuery = useQuery({
        queryKey: ['tonight-movie', pickQuery.data?.movieId],
        enabled: Boolean(pickQuery.data?.movieId),
        queryFn: () => fetchTonightMovie(pickQuery.data!.movieId),
        staleTime: 1000 * 60 * 10,
        retry: 1,
    });

    const rerollMutation = useMutation({
        mutationFn: () => rerollTonightPick(pickQuery.data?.dateKey),
        onSuccess: data => {
            queryClient.setQueryData(['tonight-pick'], data);
            queryClient.invalidateQueries({ queryKey: ['tonight-movie'] });
            queryClient.removeQueries({ queryKey: ['tonight-why'] });
        },
    });

    const whyMutation = useMutation({
        mutationKey: ['tonight-why', pickQuery.data?.movieId],
        mutationFn: () => {
            if (!pickQuery.data?.movieId) throw new Error('No movie to explain');
            return fetchWhyCopy(pickQuery.data.movieId, pickQuery.data.dateKey);
        },
    });

    return { pickQuery, movieQuery, rerollMutation, whyMutation };
}
