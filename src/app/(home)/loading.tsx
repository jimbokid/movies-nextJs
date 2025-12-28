export default function LoadingDashboard() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="page-shell pb-2">
                <div className="h-10 w-64 rounded-lg bg-[var(--surface-2)]" />
                <div className="mt-3 h-4 w-80 rounded-lg bg-[var(--surface-2)]" />
            </div>
            <div className="page-shell space-y-6">
                <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 15 }).map((_, idx) => (
                        <div key={idx} className="space-y-3">
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
