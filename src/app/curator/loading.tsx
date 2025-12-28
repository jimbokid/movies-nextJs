'use client';

export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse pb-10">
            <div className="page-shell pt-4 space-y-3">
                <div className="h-4 w-32 rounded-full bg-[var(--surface-2)]" />
                <div className="h-8 w-72 rounded-full bg-[var(--surface-2)]" />
                <div className="h-4 w-96 max-w-full rounded-full bg-[var(--surface-2)]" />
            </div>

            <div className="page-shell space-y-8">
                <div className="card-surface p-4 md:p-8 space-y-6">
                    <div className="flex flex-wrap gap-3">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="h-9 w-32 rounded-full bg-[var(--surface-2)]" />
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="h-24 rounded-2xl bg-[var(--surface-2)]" />
                        ))}
                    </div>
                </div>

                <div className="card-surface p-4 md:p-8 space-y-4">
                    <div className="h-5 w-40 rounded-full bg-[var(--surface-2)]" />
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="h-64 rounded-2xl bg-[var(--surface-2)]" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="h-12 rounded-xl bg-[var(--surface-2)]" />
                            ))}
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="h-16 rounded-2xl bg-[var(--surface-2)]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
