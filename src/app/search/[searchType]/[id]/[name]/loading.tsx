export default function LoadingSearchPage({ title }: { title: string }) {
    return (
        <div className="space-y-6 animate-pulse pb-10">
            <span className="sr-only">{title}</span>
            <div className="page-shell">
                <div className="h-10 w-64 rounded-lg bg-[var(--surface-2)]" />
                <div className="mt-2 h-4 w-80 rounded-lg bg-[var(--surface-2)]" />
            </div>
            <div className="page-shell">
                <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[2/3] bg-[var(--surface-2)] rounded-xl" />
                            <div className="h-4 w-3/4 bg-[var(--surface-2)] rounded-lg" />
                            <div className="h-3 w-1/2 bg-[var(--surface-2)] rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
