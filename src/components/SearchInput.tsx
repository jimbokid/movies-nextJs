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
            <div className="relative group">
                <input
                    ref={inputRef}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-sm text-white placeholder:text-neutral-400 shadow-[0_10px_20px_rgba(0,0,0,0.55)] outline-none backdrop-blur-xl transition-colors transition-shadow focus:border-purple-400/70 focus:shadow-[0_0px_20px_rgba(129,140,248,0.55)]"
                    defaultValue={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
            </div>
        </div>
    );
}
