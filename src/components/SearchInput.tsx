'use client';

import React from 'react';

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search movies, tv, or people...',
}: {
    value?: string;
    onChange: (q: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="w-full sm:w-[420px]">
            <input
                className="w-full rounded-2xl bg-neutral-800 outline-none border border-neutral-700 focus:border-neutral-500 px-4 py-3 text-sm placeholder:text-neutral-400"
                defaultValue={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
