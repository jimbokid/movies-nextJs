'use client';

import React, { useEffect, useRef } from 'react';

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search movies, tv, or people...',
}: {
    value?: string;
    onChange: (q: string) => void;
    placeholder?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="w-full sm:w-[420px]">
            <input
                ref={inputRef}
                className="w-full rounded-2xl bg-neutral-800 outline-none border border-neutral-700 focus:border-neutral-500 px-4 py-3 text-sm placeholder:text-neutral-400"
                defaultValue={value ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}
