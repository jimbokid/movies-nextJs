export default function DiscoverAiLoading() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden pt-18">
            {/* Background glows – same as page.tsx */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-12 space-y-10">
                {/* Heading skeleton */}
                <section className="space-y-4 animate-pulse">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1">
                        <div className="h-2 w-2 rounded-full bg-purple-300/70" />
                        <div className="h-3 w-32 bg-white/10 rounded-full" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-8 sm:h-10 w-3/4 bg-white/10 rounded-lg" />
                        <div className="h-4 w-2/3 bg-white/10 rounded-full" />
                        <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                    </div>
                </section>

                {/* Mood section skeleton */}
                <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-4 md:p-8 space-y-6 overflow-hidden animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-2">
                            <div className="h-3 w-40 bg-purple-200/20 rounded-full" />
                            <div className="h-6 w-56 bg-white/15 rounded-full" />
                        </div>
                        <div className="h-7 w-32 bg-white/10 rounded-full" />
                    </div>

                    {/* Mood badges skeleton grid */}
                    <div className="flex flex-wrap gap-3 md:gap-4">
                        {Array.from({ length: 14 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-11 md:h-12 min-w-[90px] rounded-3xl border border-white/10 bg-black/40"
                            />
                        ))}
                    </div>

                    <div className="h-4 w-48 bg-amber-200/20 rounded-full" />
                </section>

                {/* Controls skeleton */}
                <div className="flex flex-wrap gap-4 items-center animate-pulse">
                    <div className="h-11 w-full md:w-56 rounded-2xl bg-gradient-to-r from-purple-500/40 to-indigo-500/40" />
                    <div className="h-11 w-32 rounded-2xl border border-white/10 bg-white/5" />
                </div>

                {/* Recommendations skeleton */}
                <section className="space-y-6 pb-8">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="h-6 w-40 bg-white/15 rounded-lg" />
                        <div className="h-4 w-48 bg-white/5 rounded-full" />
                    </div>

                    {/* Placeholder text block */}
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-pulse">
                        <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                        <div className="h-4 w-1/2 bg-white/5 rounded" />
                    </div>

                    {/* Cards skeleton grid */}
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col"
                            >
                                <div className="h-64 w-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                <div className="p-5 space-y-3 flex-1 flex flex-col">
                                    <div className="space-y-2">
                                        <div className="h-5 w-3/4 bg-white/15 rounded" />
                                        <div className="h-4 w-1/3 bg-white/8 rounded" />
                                    </div>
                                    <div className="h-4 w-full bg-white/8 rounded" />
                                    <div className="h-4 w-5/6 bg-white/5 rounded" />
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="h-4 w-24 bg-purple-200/20 rounded-full" />
                                        <div className="h-8 w-28 bg-purple-500/20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
