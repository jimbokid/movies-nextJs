'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export type CuratorLoadingMode = 'overlay' | 'full';

export interface CuratorLoadingProps {
    message?: string;
    mode?: CuratorLoadingMode;
    curatorName?: string;
    curatorEmoji?: string;
    thinkingLines?: string[];
}

export default function CuratorLoading({
    mode = 'overlay',
    curatorName,
    curatorEmoji,
    thinkingLines = [],
}: CuratorLoadingProps) {
    const [lineIndex, setLineIndex] = useState(0);
    const containerClasses =
        mode === 'overlay' ? 'absolute inset-0 z-30' : 'relative w-full min-h-[520px]';

    useEffect(() => {
        if (!thinkingLines.length) return undefined;
        const interval = setInterval(() => {
            setLineIndex(prev => (prev + 1) % thinkingLines.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [thinkingLines]);

    const thinkingLine = thinkingLines[lineIndex % Math.max(thinkingLines.length, 1)];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${containerClasses} pointer-events-auto rounded-3xl bg-black/80 backdrop-blur-2xl`}
        >
            <div className="flex h-full flex-col gap-6 p-6 text-left">
                <div className="flex items-center justify-between gap-3 text-sm text-purple-100">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/30 bg-purple-500/20 text-xl">
                            {curatorEmoji ?? '✨'}
                        </span>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-purple-200">
                                {curatorName ?? 'Curator'} is thinking
                            </p>
                        </div>
                    </div>
                    <motion.span
                        className="h-10 w-10 rounded-full border-2 border-white/50 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <p className="line-clamp-2">
                        {thinkingLine || 'Choosing a hero pick and bold alternatives...'}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <div className="aspect-[2/3] relative  w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 ">
                            <div className="absolute inset-0 shimmer-surface" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="h-12 rounded-xl border border-white/10 bg-white/5 shimmer-surface"
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                            Alternatives
                        </span>
                        <span className="h-px w-12 bg-white/10" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="aspect-[2/3] relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                            >
                                <div className="absolute inset-0 shimmer-surface" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
