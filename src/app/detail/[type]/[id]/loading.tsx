export default function LoadingDetailPage() {
    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-gray-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <section className="relative w-full overflow-hidden bg-gray-900 h-[40svh] min-h-[280px] max-h-[520px] animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent px-4 py-10 flex flex-col justify-end">
                    <div className="max-w-6xl px-0 sm:px-4 mx-auto text-left w-full space-y-3">
                        <div className="h-10 w-2/3 bg-gray-800 rounded" />
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="h-4 w-16 bg-gray-800 rounded" />
                            <div className="h-4 w-24 bg-gray-800 rounded" />
                            <div className="flex flex-wrap gap-2">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-6 w-20 bg-gray-800 rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-10 space-y-10 animate-pulse">
                <div className="space-y-3">
                    <div className="h-7 w-1/4 bg-gray-800 rounded" />
                    <div className="space-y-2">
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-4 w-full bg-gray-800 rounded" />
                        ))}
                    </div>
                </div>

                <div className="h-6 w-40 bg-gray-800/60 rounded" />
            </section>
        </main>
    );
}
