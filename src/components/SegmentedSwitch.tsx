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
        <div className="w-full sm:w-auto rounded-2xl bg-neutral-800 p-1 text-sm">
            <div className="relative w-full sm:w-auto grid grid-cols-3">
                <div
                    className="absolute top-0 bottom-0 w-1/3 rounded-xl bg-neutral-700 transition-transform"
                    style={{
                        transform: `translateX(${idx * 100}%)`,
                    }}
                />
                {OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => handle(opt.value)}
                        className={[
                            'relative z-10 px-4 py-2 rounded-xl transition-colors cursor-pointer',
                            internal === opt.value
                                ? 'text-white'
                                : 'text-neutral-300 hover:text-white',
                        ].join(' ')}
                        type="button"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
