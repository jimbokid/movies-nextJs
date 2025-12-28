'use client';

import { useEffect, useState } from 'react';

export type DiscoverMode = 'random' | 'all';

const OPTIONS: { label: string; value: DiscoverMode }[] = [
    { label: 'Random', value: 'random' },
    { label: 'All moods', value: 'all' },
];

export default function ModeSwitch({
    value,
    onChange,
}: {
    value: DiscoverMode;
    onChange: (mode: DiscoverMode) => void;
}) {
    const [internal, setInternal] = useState<DiscoverMode>(value);

    useEffect(() => {
        setInternal(value);
    }, [value]);

    const handle = (v: DiscoverMode) => {
        setInternal(v);
        onChange(v);
    };

    const idx = OPTIONS.findIndex(opt => opt.value === internal);

    return (
        <div className="w-full sm:w-auto">
            <div className="relative inline-flex w-full sm:w-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-1 py-1 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <div className="relative grid w-full grid-cols-2 text-xs sm:text-sm font-medium">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 w-1/2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_65%,transparent)] transition-transform duration-200 ease-out"
                        style={{ transform: `translateX(${idx * 100}%)` }}
                    />
                    {OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handle(opt.value)}
                            aria-pressed={internal === opt.value}
                            className={[
                                'relative z-10 px-4 py-2 rounded-xl transition-colors cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]',
                                internal === opt.value
                                    ? 'text-[var(--bg)] font-semibold'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                            ].join(' ')}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
