import React from 'react';

interface RatingProps {
    value?: number | null;
    className?: string;
}

export default function Rating({ value, className = '' }: RatingProps) {
    if (typeof value !== 'number' || value <= 0) return null;

    return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
            <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
                className="h-3.5 w-3.5 text-amber-400"
            >
                <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.43 4.4a1 1 0 0 0 .95.69h4.62c.97 0 1.37 1.24.59 1.81l-3.74 2.72a1 1 0 0 0-.36 1.12l1.43 4.4c.3.92-.76 1.69-1.54 1.12l-3.74-2.72a1 1 0 0 0-1.18 0l-3.74 2.72c-.78.57-1.84-.2-1.54-1.12l1.43-4.4a1 1 0 0 0-.36-1.12L1.46 9.83c-.78-.57-.38-1.81.59-1.81h4.62a1 1 0 0 0 .95-.69l1.43-4.4Z" />
            </svg>
            <span className="font-semibold">{value.toFixed(1)}</span>
        </span>
    );
}
