export default function LoadingDefaultSearchPage() {
    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white pt-18">
            {/* Background glows – same as search page */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 animate-pulse">
                {/* Controls skeleton */}
                <div className="flex flex-col flex-wrap sm:flex-row gap-3 sm:items-center sm:justify-between">
                    {/* Title placeholder – matches h1 text-3xl */}
                    <div className="h-[32px] w-1/3 max-w-md bg-neutral-800 rounded-lg" />

                    {/* Segmented + input */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
                        {/* SegmentedSwitch skeleton */}
                        <div className="w-full sm:w-auto">
                            <div className="h-[44px] w-full sm:w-[260px] rounded-2xl border border-white/10 bg-white/5" />
                        </div>
                        {/* SearchInput skeleton */}
                        <div className="w-full sm:w-[420px]">
                            <div className="h-[44px] w-full rounded-2xl bg-neutral-800 border border-neutral-700" />
                        </div>
                    </div>
                </div>

                {/* Results grid skeleton (movies-style) */}
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            {/* Poster placeholder – matches MovieCard aspect */}
                            <div className="aspect-[2/3] bg-neutral-800 rounded-2xl" />
                            {/* Title line */}
                            <div className="h-4 w-3/4 bg-neutral-800 rounded" />
                            {/* Subtitle line */}
                            <div className="h-3 w-1/2 bg-neutral-800 rounded" />
                        </div>
                    ))}
                </div>

                {/* Bottom loader shimmer skeleton */}
                <div className="h-16 flex items-center justify-center mt-6">
                    <div className="flex gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-4 w-10 bg-neutral-800 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
