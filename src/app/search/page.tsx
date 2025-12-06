import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white pt-18">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                        <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
                    </div>
                    <div className="max-w-6xl mx-auto px-4 py-10">
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
