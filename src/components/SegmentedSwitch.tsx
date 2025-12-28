'use client';

import { useState } from 'react';

type Opt = { label: string; value: 'movie' | 'tv' | 'person' };

const OPTIONS: Opt[] = [
    { label: 'Movie', value: 'movie' },
    { label: 'TV', value: 'tv' },
    { label: 'Actors', value: 'person' },
];

export default function SegmentedSwitch({
    value,
    onChange,
}: {
    value: 'movie' | 'tv' | 'person';
    onChange: (v: 'movie' | 'tv' | 'person') => void;
}) {
    const [internal, setInternal] = useState(value);

    const handle = (v: Opt['value']) => {
        setInternal(v);
        onChange(v);
    };

    const idx = OPTIONS.findIndex(o => o.value === internal);

    return (
        <div className="w-full sm:w-auto">
            <div className="relative inline-flex w-full sm:w-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-1 py-1 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <div className="relative grid w-full grid-cols-3 text-xs sm:text-sm font-medium">
                    <div
                        className="pointer-events-none absolute inset-y-0 w-1/3 rounded-xl bg-[color-mix(in_srgb,var(--accent)_65%,transparent)] transition-transform duration-200 ease-out"
                        style={{
                            transform: `translateX(${idx * 100}%)`,
                        }}
                    />
                    {OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handle(opt.value)}
                            className={[
                                'relative z-10 px-4 py-2 rounded-xl transition-colors cursor-pointer text-center',
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
