export default function LoadingDetailPage() {
    return (
        <div className="space-y-8 animate-pulse pb-10">
            <div className="page-shell pt-4">
                <div className="h-10 w-48 rounded-lg bg-[var(--surface-2)]" />
                <div className="mt-2 h-4 w-64 rounded-lg bg-[var(--surface-2)]" />
            </div>
            <div className="page-shell">
                <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
                    <div className="aspect-[2/3] rounded-2xl bg-[var(--surface-2)]" />
                    <div className="space-y-4">
                        <div className="h-10 w-3/4 rounded-lg bg-[var(--surface-2)]" />
                        <div className="h-4 w-1/2 rounded-lg bg-[var(--surface-2)]" />
                        <div className="flex gap-3">
                            <div className="h-7 w-20 rounded-full bg-[var(--surface-2)]" />
                            <div className="h-7 w-24 rounded-full bg-[var(--surface-2)]" />
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="h-4 w-full rounded-lg bg-[var(--surface-2)]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="page-shell space-y-3">
                <div className="h-6 w-32 rounded-lg bg-[var(--surface-2)]" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-24 rounded-2xl bg-[var(--surface-2)]" />
                    ))}
                </div>
            </div>
        </div>
    );
}
