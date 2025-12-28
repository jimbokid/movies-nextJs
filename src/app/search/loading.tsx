export default function LoadingDefaultSearchPage() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="page-shell pb-4">
                <div className="h-10 w-64 rounded-lg bg-[var(--surface-2)]" />
                <div className="mt-2 h-4 w-80 rounded-lg bg-[var(--surface-2)]" />
            </div>
            <div className="page-shell space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="h-10 w-full sm:w-[260px] rounded-xl bg-[var(--surface-2)]" />
                    <div className="h-10 w-full sm:w-[420px] rounded-xl bg-[var(--surface-2)]" />
                </div>
                <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[2/3] rounded-xl bg-[var(--surface-2)]" />
                            <div className="h-4 w-3/4 rounded-lg bg-[var(--surface-2)]" />
                            <div className="h-3 w-1/2 rounded-lg bg-[var(--surface-2)]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
