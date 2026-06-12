'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeywordItem } from '@/types/movie';

const VISIBLE_COUNT = 8;

export default function KeywordChips({ keywords }: { keywords: KeywordItem[] }) {
    const [expanded, setExpanded] = useState(false);

    const visible = expanded ? keywords : keywords.slice(0, VISIBLE_COUNT);
    const hiddenCount = keywords.length - VISIBLE_COUNT;

    return (
        <div className="flex flex-wrap gap-2">
            {visible.map(keyword => (
                <Link
                    key={keyword.id}
                    href={`/search/searchByKeyword/${keyword.id}/${encodeURIComponent(
                        keyword.name,
                    )}`}
                    className="inline-flex items-center rounded-full bg-gray-800/60 px-3 py-1 text-xs text-gray-200 hover:bg-gray-700 transition"
                    prefetch
                >
                    {keyword.name}
                </Link>
            ))}
            {hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={() => setExpanded(prev => !prev)}
                    className="cursor-pointer inline-flex items-center rounded-full border border-purple-300/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-100 hover:bg-purple-500/20 transition"
                >
                    {expanded ? 'Show less' : `+${hiddenCount} more`}
                </button>
            )}
        </div>
    );
}
