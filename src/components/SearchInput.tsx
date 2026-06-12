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

    const handleClear = () => {
        onChange('');
        inputRef.current?.focus();
    };

    return (
        <div className="w-full sm:w-[420px]">
            <div className="relative group">
                <input
                    ref={inputRef}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-3 pr-11 text-sm text-white placeholder:text-neutral-400 shadow-[0_10px_20px_rgba(0,0,0,0.55)] outline-none backdrop-blur-xl transition-colors transition-shadow focus:border-purple-400/70 focus:shadow-[0_0px_20px_rgba(129,140,248,0.55)]"
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden
                            className="h-3.5 w-3.5"
                        >
                            <path d="M5 5l10 10M15 5L5 15" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
