import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Entitlements } from '@/types/entitlements';

export function useEntitlements() {
    return useQuery<Entitlements, Error>({
        queryKey: ['entitlements'],
        queryFn: async () => {
            const res = await fetch('/api/me/entitlements');
            if (res.status === 401) {
                throw new Error('UNAUTHENTICATED');
            }
            if (!res.ok) {
                throw new Error('FAILED_TO_LOAD');
            }
            return (await res.json()) as Entitlements;
        },
        staleTime: 1000 * 60 * 5,
        retry: false,
    });
}

export function useRefreshEntitlements() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ['entitlements'] });
}
