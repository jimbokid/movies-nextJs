export default function DiscoverAiLoading() {
    return (
        <div className="space-y-8 animate-pulse pb-10">
            <div className="page-shell pt-4 space-y-2">
                <div className="h-4 w-32 rounded-full bg-[var(--surface-2)]" />
                <div className="h-10 w-72 rounded-lg bg-[var(--surface-2)]" />
                <div className="h-4 w-80 rounded-lg bg-[var(--surface-2)]" />
            </div>

            <div className="page-shell space-y-8">
                <section className="card-surface p-5 md:p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-2">
                            <div className="h-4 w-64 bg-[var(--surface-2)] rounded-full" />
                            <div className="h-7 w-80 bg-[var(--surface-2)] rounded-xl" />
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="h-10 w-44 rounded-full bg-[var(--surface-2)]" />
                            <div className="h-7 w-36 rounded-full bg-[var(--surface-2)]" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-11 md:h-12 min-w-[120px] rounded-2xl bg-[var(--surface-2)]"
                            />
                        ))}
                    </div>
                    <div className="h-4 w-64 bg-[var(--surface-2)] rounded-full" />
                </section>

                <div className="flex flex-wrap gap-3">
                    <div className="h-[52px] w-full md:w-[260px] rounded-xl bg-[var(--surface-2)]" />
                    <div className="h-[52px] w-[140px] rounded-xl bg-[var(--surface-2)]" />
                </div>

                <section className="space-y-4">
                    <div className="h-6 w-48 bg-[var(--surface-2)] rounded-lg" />
                    <div className="card-surface p-6 space-y-3">
                        <div className="h-4 w-3/4 bg-[var(--surface-2)] rounded" />
                        <div className="h-4 w-1/2 bg-[var(--surface-2)] rounded" />
                    </div>
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="card-surface p-5 space-y-3"
                            >
                                <div className="aspect-[2/3] rounded-xl bg-[var(--surface-2)]" />
                                <div className="h-5 w-3/4 bg-[var(--surface-2)] rounded" />
                                <div className="h-4 w-1/2 bg-[var(--surface-2)] rounded" />
                                <div className="h-4 w-full bg-[var(--surface-2)] rounded" />
                                <div className="h-4 w-2/3 bg-[var(--surface-2)] rounded" />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
