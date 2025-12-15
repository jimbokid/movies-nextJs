'use client';

import { motion } from 'framer-motion';

export type CuratorLoadingMode = 'overlay' | 'full';

export interface CuratorLoadingProps {
    message?: string;
    mode?: CuratorLoadingMode;
}

const shimmerBase = 'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5';

const ShimmerBlock = ({ className }: { className?: string }) => (
    <div className={`${shimmerBase} ${className ?? ''}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="aspect-[2/3]" />
    </div>
);

export default function CuratorLoading({ message, mode = 'overlay' }: CuratorLoadingProps) {
    const containerClasses =
        mode === 'overlay'
            ? 'absolute inset-0 z-30'
            : 'relative w-full min-h-[520px]';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${containerClasses} pointer-events-auto rounded-3xl bg-black/70 backdrop-blur-2xl`}
        >
            <div className="flex h-full flex-col gap-6 p-6 text-center">
                <div className="flex items-center justify-center gap-3 text-sm text-purple-100">
                    <motion.span
                        className="h-9 w-9 rounded-full border-2 border-white/50 border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    />
                    <p className="text-base font-semibold text-white">
                        {message ?? 'Curator is crafting a lineup...'}
                    </p>
                </div>

                <div className="grid flex-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <ShimmerBlock className="h-full min-h-[360px]" />
                    </div>
                    <div className="space-y-3">
                        <ShimmerBlock className="min-h-[100px]" />
                        <ShimmerBlock className="min-h-[100px]" />
                        <ShimmerBlock className="min-h-[100px]" />
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <ShimmerBlock key={idx} className="min-h-[200px]" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
