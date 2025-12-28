'use client';

import React from 'react';
import Button from '@/components/ui/Button';

interface HeadingProps {
    shuffleBadges: () => void;
    shuffleDisabled?: boolean;
}

export default function Heading({ shuffleBadges, shuffleDisabled = false }: HeadingProps) {
    return (
        <div className="space-y-3">
            <p className="text-caption uppercase tracking-[0.2em] text-[var(--accent-2)]">
                AI companion
            </p>
            <h1 className="text-display">Mood-based movie picker</h1>
            <p className="text-caption max-w-3xl">
                Choose a few moods, and CineView will assemble a calm, cinematic watchlist.
            </p>
            <Button
                variant="secondary"
                size="sm"
                onClick={shuffleBadges}
                disabled={shuffleDisabled}
            >
                Shuffle moods
            </Button>
        </div>
    );
}
