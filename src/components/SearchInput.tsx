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
            <div className="relative">
                <input
                    ref={inputRef}
                    className="w-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-[0_12px_28px_rgba(0,0,0,0.35)] outline-none transition focus:border-[color-mix(in_srgb,var(--accent)_40%,transparent)]"
                    defaultValue={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
            </div>
        </div>
    );
}
