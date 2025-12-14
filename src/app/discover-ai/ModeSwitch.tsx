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
            <div className="relative inline-flex w-full sm:w-auto rounded-2xl border border-white/10 bg-white/5 px-1 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="relative grid w-full grid-cols-2 text-xs sm:text-sm font-medium">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 w-1/2 rounded-xl bg-gradient-to-r from-purple-500/60 via-indigo-500/60 to-purple-400/60 shadow-[0_0px_10px_rgba(129,140,248,0.55)] transition-transform duration-200 ease-out"
                        style={{ transform: `translateX(${idx * 100}%)` }}
                    />
                    {OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handle(opt.value)}
                            aria-pressed={internal === opt.value}
                            className={[
                                'relative z-10 px-4 py-2 rounded-xl transition-colors cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
                                internal === opt.value ? 'text-white' : 'text-neutral-300 hover:text-white',
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
