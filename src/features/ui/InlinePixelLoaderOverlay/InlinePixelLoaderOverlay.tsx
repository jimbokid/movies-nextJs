'use client';

import { useEffect, useMemo, useState } from 'react';
import PixelCarCanvas from './PixelCarCanvas';
import usePrefersReducedMotion from '@/shared/hooks/usePrefersReducedMotion';

export type InlinePixelLoaderOverlayProps = {
    show: boolean;
    label?: string;
    height?: number;
    variant?: 'compact' | 'normal';
    className?: string;
    zIndex?: number;
    dimOpacity?: number;
};

const STORAGE_KEY = 'cineview:pixelLoader:disabled';

export default function InlinePixelLoaderOverlay({
    show,
    label,
    height = 220,
    variant = 'normal',
    className = '',
    zIndex = 30,
    dimOpacity = 0.55,
}: InlinePixelLoaderOverlayProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [disableAnimation, setDisableAnimation] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;
        const stored = window.localStorage.getItem(STORAGE_KEY);
        setDisableAnimation(stored === 'true');
    }, []);

    const contentPadding =
        variant === 'compact'
            ? 'p-4 md:p-5 gap-3'
            : 'p-6 md:p-8 gap-4';

    const canvasSize = useMemo(
        () =>
            variant === 'compact'
                ? { width: 360, height: 200, density: 'low' as const }
                : { width: 440, height: 230, density: 'high' as const },
        [variant],
    );

    const showAnimation = !prefersReducedMotion && !disableAnimation;
    const isVisible = show;

    const handleHide = () => {
        setDisableAnimation(true);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, 'true');
        }
    };

    return (
        <div
            className={`pointer-events-none absolute inset-0 overflow-hidden rounded-2xl transition-all duration-300 ease-out ${show ? 'opacity-100 scale-[1]' : 'opacity-0 scale-[0.995]'} ${className}`}
            style={{ zIndex, minHeight: height }}
            aria-hidden={!isVisible}
        >
            <div
                className="absolute inset-0 rounded-2xl border border-violet-500/10 bg-gradient-to-b from-zinc-950/30 to-black/60 backdrop-blur-[2px]"
                style={{ opacity: dimOpacity }}
            />
            <div
                className={`relative flex h-full w-full flex-col items-center justify-center text-center ${contentPadding}`}
                style={{ pointerEvents: 'none' }}
            >
                {showAnimation ? (
                    <div className="flex flex-col items-center gap-3 md:gap-4">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 px-3 py-2 shadow-[0_20px_60px_rgba(88,28,135,0.35)]">
                            <PixelCarCanvas
                                running={show && mounted}
                                width={canvasSize.width}
                                height={canvasSize.height}
                                density={canvasSize.density}
                            />
                        </div>
                        {label && (
                            <p className="max-w-md text-sm font-medium text-purple-100 md:text-base">
                                {label}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 md:gap-4">
                        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-purple-100 shadow-[0_10px_35px_rgba(124,58,237,0.25)]">
                            <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
                            <span>{label ?? 'Generating...'}</span>
                        </div>
                        {prefersReducedMotion && (
                            <p className="text-xs text-gray-300">Reduced motion enabled</p>
                        )}
                    </div>
                )}

                {show && showAnimation && !prefersReducedMotion && (
                    <div className="pointer-events-auto absolute right-3 top-3">
                        <button
                            type="button"
                            onClick={handleHide}
                            className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-medium text-gray-200 transition hover:border-purple-300/50 hover:text-white"
                        >
                            Hide animation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
