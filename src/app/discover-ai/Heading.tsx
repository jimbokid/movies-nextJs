'use client';

import React from 'react';

interface HeadingProps {
    shuffleBadges: () => void;
    shuffleDisabled?: boolean;
}

export default function Heading({ shuffleBadges, shuffleDisabled = false }: HeadingProps) {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-200/80 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Mini-game
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-purple-200 via-white to-purple-300 bg-clip-text text-transparent">
                        AI Mood-based Movie Picker
                    </span>
                </h1>
                <p className="text-lg text-gray-300 max-w-3xl">
                    Pick exactly 3 vibes and I&apos;ll summon tonight&apos;s perfect watchlist.
                    Shuffle anytime to start a fresh round.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <button
                        type="button"
                        onClick={shuffleBadges}
                        disabled={shuffleDisabled}
                        className={`cursor-pointer group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-purple-100 transition hover:border-purple-300/60 hover:bg-purple-500/10 ${
                            shuffleDisabled
                                ? 'opacity-60 cursor-not-allowed hover:border-white/10 hover:bg-white/5'
                                : ''
                        }`}
                    >
                        <span className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_0_4px_rgba(168,85,247,0.15)] transition-transform group-hover:scale-110" />
                        Shuffle moods
                    </button>
                </div>
            </div>
        </div>
    );
}
