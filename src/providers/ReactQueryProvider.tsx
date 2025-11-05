'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,      // 5 minutes: data is "fresh"
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,         // <- important for back navigation
                retry: 1,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
