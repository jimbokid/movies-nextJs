'use client';

import { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    className?: string;
    /** Roughly how many characters to show before collapsing */
    collapseAt?: number;
}

export default function ExpandableText({
    text,
    className = '',
    collapseAt = 600,
}: ExpandableTextProps) {
    const [expanded, setExpanded] = useState(false);
    const needsCollapse = text.length > collapseAt;

    return (
        <div className={className}>
            <p
                className={`whitespace-pre-line leading-relaxed ${
                    !expanded && needsCollapse ? 'line-clamp-6' : ''
                }`}
            >
                {text}
            </p>
            {needsCollapse && (
                <button
                    type="button"
                    onClick={() => setExpanded(prev => !prev)}
                    className="cursor-pointer mt-2 text-sm font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                >
                    {expanded ? 'Show less' : 'Read more'}
                </button>
            )}
        </div>
    );
}
