export default function LoadingDashboard() {
    return (
        <main className="min-h-screen bg-neutral-900 text-white animate-pulse">
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="h-10 w-64 bg-neutral-800 rounded mb-10" />

                {/* Movie grid skeleton */}
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array(20)
                        .fill(0)
                        .map((_, i) => (
                            <div key={i} className="space-y-3">
                                {/* Poster placeholder */}
                                <div className="aspect-[2/3] bg-neutral-800 rounded-lg" />

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
