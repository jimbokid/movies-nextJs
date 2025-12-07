export default function LoadingDetailPage() {
    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950  text-gray-100 animate-pulse">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>
            {/* Header placeholder */}
            <section className="relative w-full h-[40vh] bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent px-4 py-10 flex flex-col justify-end">
                    <div className="max-w-6xl px-0 sm:px-4 mx-auto text-left w-full space-y-3">
                        {/* Title */}
                        <div className="h-10 w-2/3 bg-gray-800 rounded" />
                        {/* Rating + date + genres chips */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="h-4 w-16 bg-gray-800 rounded" />
                            <div className="h-4 w-24 bg-gray-800 rounded" />
                            <div className="flex flex-wrap gap-2">
                                {Array(4)
                                    .fill(0)
                                    .map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-6 w-20 bg-gray-800 rounded-full"
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="max-w-6xl mx-auto px-4 py-10 space-y-12">
                {/* Overview */}
                <div className="space-y-3">
                    <div className="h-7 w-1/4 bg-gray-800 rounded" />
                    <div className="space-y-2">
                        {Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="h-4 w-full bg-gray-800 rounded" />
                            ))}
                    </div>
                </div>

                {/* Keywords */}
                <div className="space-y-3">
                    <div className="h-7 w-1/4 bg-gray-800 rounded" />
                    <div className="flex flex-wrap gap-2">
                        {Array(8)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 w-24 bg-gray-800 rounded-full"
                                />
                            ))}
                    </div>
                </div>

                {/* Video */}
                <div className="space-y-3">
                    <div className="h-7 w-1/4 bg-gray-800 rounded" />
                    <div className="w-full aspect-video bg-gray-900 rounded-xl" />
                </div>

                {/* Cast */}
                <div className="space-y-3">
                    <div className="h-7 w-1/4 bg-gray-800 rounded" />
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {Array(10)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="flex-shrink-0 w-32 space-y-2">
                                    <div className="w-32 h-48 bg-gray-800 rounded-lg" />
                                    <div className="h-3 w-24 bg-gray-800 rounded mx-auto" />
                                    <div className="h-2 w-16 bg-gray-800 rounded mx-auto" />
                                </div>
                            ))}
                    </div>
                </div>

                {/* Similar movies */}
                <div className="space-y-3">
                    <div className="h-7 w-1/4 bg-gray-800 rounded" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {Array(12)
                            .fill(0)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-[2/3] bg-gray-800 rounded-lg"
                                />
                            ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
