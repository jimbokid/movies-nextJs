export default function DiscoverAiLoading() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden pt-18">
            {/* Background glows – same as page.tsx */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-24 md:top-32 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-12 space-y-10">
                {/* Heading skeleton (match Heading.tsx structure) */}
                <section className="space-y-5 animate-pulse">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="h-6 w-28 rounded-full border border-white/10 bg-white/5" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="h-10 md:h-12 w-[min(720px,85%)] bg-white/10 rounded-xl" />
                        <div className="h-5 w-[min(640px,90%)] bg-white/10 rounded-full" />
                        <div className="h-5 w-[min(520px,75%)] bg-white/5 rounded-full" />
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                            <div className="h-10 w-40 rounded-full border border-white/10 bg-white/5" />
                        </div>
                    </div>
                </section>

                {/* Mood section skeleton */}
                <section className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-4 md:p-8 space-y-6 overflow-hidden">
                    <div className="animate-pulse">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            {/* left title */}
                            <div className="space-y-2">
                                <div className="h-4 w-72 bg-purple-200/15 rounded-full" />
                                <div className="h-7 w-80 bg-white/15 rounded-xl" />
                            </div>

                            {/* right controls (ModeSwitch + selected counter) */}
                            <div className="flex flex-col items-end gap-3">
                                {/* ModeSwitch placeholder */}
                                <div className="h-10 w-44 rounded-full border border-white/10 bg-white/5" />
                                {/* selected counter chip */}
                                <div className="h-7 w-36 rounded-full border border-white/5 bg-white/5" />
                            </div>
                        </div>

                        {/* Mood badges skeleton (reserve similar wrapping) */}
                        <div className="mt-6 flex flex-wrap gap-3 md:gap-4">
                            {Array.from({ length: 16 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-11 md:h-12 min-w-[120px] rounded-3xl border border-white/10 bg-black/40"
                                />
                            ))}
                        </div>

                        {/* hint line placeholder */}
                        <div className="mt-6 h-4 w-64 bg-amber-200/15 rounded-full" />
                    </div>
                </section>

                {/* Controls skeleton (match real button sizes) */}
                <div className="flex flex-wrap gap-4 items-center animate-pulse">
                    <div className="h-[52px] w-full md:w-[280px] rounded-2xl bg-gradient-to-r from-purple-500/35 to-indigo-500/35" />
                    <div className="h-[52px] w-[140px] rounded-2xl border border-white/10 bg-white/5" />
                </div>

                {/* Recommendations skeleton */}
                <section className="space-y-6 pb-8">
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="h-7 w-48 bg-white/15 rounded-xl" />
                        <div className="h-4 w-52 bg-white/5 rounded-full" />
                    </div>

                    {/* Reserve vertical space so results appearing doesn't jump page */}
                    <div className="min-h-[520px]">
                        {/* Placeholder text block */}
                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-pulse">
                            <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
                            <div className="h-4 w-1/2 bg-white/5 rounded" />
                        </div>

                        {/* Cards skeleton grid (same grid as real) */}
                        <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col"
                                >
                                    {/* poster block matches real: h-64 */}
                                    <div className="h-64 w-full bg-gradient-to-br from-gray-800 to-gray-900" />

                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-2 w-full">
                                                <div className="h-6 w-3/4 bg-white/15 rounded" />
                                                <div className="h-4 w-1/3 bg-white/8 rounded" />
                                            </div>
                                            <div className="h-6 w-16 bg-purple-200/15 rounded-full" />
                                        </div>

                                        <div className="h-4 w-full bg-white/8 rounded" />
                                        <div className="h-4 w-5/6 bg-white/5 rounded" />
                                        <div className="h-4 w-4/6 bg-white/5 rounded" />

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="h-9 w-32 bg-purple-500/15 rounded-full" />
                                            <div className="h-4 w-20 bg-white/8 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
