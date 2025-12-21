'use client';

export default function Loading() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-18 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-10%] top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-[-6%] top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-[-10%] h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-10 space-y-8">
                <div className="space-y-3">
                    <div className="h-4 w-32 rounded-full bg-white/10" />
                    <div className="h-8 w-72 rounded-full bg-white/10" />
                    <div className="h-4 w-96 max-w-full rounded-full bg-white/10" />
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] space-y-6">
                    <div className="flex flex-wrap gap-3">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="h-9 w-32 rounded-full bg-white/10 animate-pulse"
                            />
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="h-24 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] space-y-4">
                    <div className="h-5 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="h-64 rounded-2xl bg-white/10 animate-pulse" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-12 rounded-xl border border-white/10 bg-white/5 animate-pulse"
                                />
                            ))}
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="h-16 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
