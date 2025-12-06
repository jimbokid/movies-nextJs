export default function LoadingDashboard() {
    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white animate-pulse pt-18">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="h-10 w-64 bg-neutral-800 rounded mb-8" />

                {/* Movie grid skeleton */}
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array(20)
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className="space-y-3">
                                {/* Poster placeholder */}
                                <div className="aspect-[2/3] bg-neutral-800 rounded-2xl" />

                                {/* Title placeholder */}
                                <div className="h-4 w-3/4 bg-neutral-800 rounded" />

                                {/* Subtitle / year placeholder */}
                                <div className="h-3 w-1/2 bg-neutral-800 rounded" />
                            </div>
                        ))}
                </div>

                {/* Infinite scroll loader placeholder */}
                <div className="h-16 flex items-center justify-center mt-10">
                    <div className="h-4 w-24 bg-neutral-800 rounded" />
                </div>
            </div>
        </main>
    );
}
