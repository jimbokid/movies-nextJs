export default function LoadingPersonPage() {
    return (
        <div className="space-y-6 animate-pulse pb-10">
            <div className="page-shell pt-4">
                <div className="h-10 w-48 rounded-lg bg-[var(--surface-2)]" />
                <div className="mt-2 h-4 w-64 rounded-lg bg-[var(--surface-2)]" />
            </div>
            <div className="page-shell">
                <div className="card-surface p-6 md:p-7 flex flex-col gap-6 md:flex-row md:items-start">
                    <div className="relative h-44 w-44 rounded-2xl bg-[var(--surface-2)]" />
                    <div className="flex-1 space-y-3">
                        <div className="h-6 w-40 rounded-lg bg-[var(--surface-2)]" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="h-4 w-full rounded-lg bg-[var(--surface-2)]" />
                            <div className="h-4 w-full rounded-lg bg-[var(--surface-2)]" />
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-4 w-full rounded-lg bg-[var(--surface-2)]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
