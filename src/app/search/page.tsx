import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-gray-950 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-10">
                        <div className="h-8 w-40 bg-gray-800 rounded mb-6 animate-pulse" />
                        <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-pulse">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="aspect-[2/3] bg-gray-800 rounded-2xl" />
                                    <div className="h-4 w-3/4 bg-gray-800 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-800 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            }
        >
            <SearchClient />
        </Suspense>
    );
}
