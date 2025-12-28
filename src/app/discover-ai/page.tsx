'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, type Variants, stagger } from 'framer-motion';
import LoadingOverlay from '@/components/LoadingOverlay';
import Heading from '@/app/discover-ai/Heading';
import ModeSwitch from '@/app/discover-ai/ModeSwitch';
import useDiscoverAi from '@/hooks/useDiscoverAi';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import PosterImage from '@/components/movies/PosterImage';

import {
    BADGE_COLORS,
    BADGE_TITLE_COLORS,
    DEFAULT_BADGE_COLOR,
    DEFAULT_BADGE_TITLE_COLOR,
} from '@/data/moodBadges';

const badgeButtonBase =
    'px-4 md:px-6 py-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-sm md:text-base font-semibold text-[var(--text)] transition shadow-[0_10px_28px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)]';

const badgeContainerVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 15,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            when: 'beforeChildren',
            delayChildren: stagger(0.1), // Stagger children by .3 seconds
        },
    },
};

const badgeItemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 15,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.1,
            ease: 'easeIn',
        },
    },
};

export default function DiscoverAiPage() {
    const {
        mode,
        setMode,
        randomBadges,
        groupedBadges,
        selected,
        selectionLimit,
        canRecommend,
        handleToggleBadge,
        handleRecommend,
        shuffleBadges,
        round,
        recommendations,
        loading,
        loadingMessage,
        hint,
        error,
        didSearch,
        resultsRef,
    } = useDiscoverAi();
    const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
    const [modeFromUrlApplied, setModeFromUrlApplied] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const modeParam = searchParams.get('mode');
        const normalizedMode = modeParam === 'all' ? 'all' : 'random';

        setMode(prev => (prev === normalizedMode ? prev : normalizedMode));
        setModeFromUrlApplied(true);
    }, [searchParams, setMode]);

    useEffect(() => {
        if (!modeFromUrlApplied) return;

        const shouldSyncModeParam = mode === 'all' || searchParams.has('mode');
        if (!shouldSyncModeParam) return;

        const params = new URLSearchParams(searchParams);
        const currentQuery = params.toString();

        params.set('mode', mode);
        const nextQuery = params.toString();

        if (currentQuery === nextQuery) return;

        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [mode, modeFromUrlApplied, pathname, router, searchParams]);

    const scrollToResults = useCallback(() => {
        if (!resultsRef.current) return;

        const headerElement = document.querySelector('header');
        const headerHeight = headerElement?.getBoundingClientRect().height ?? 0;
        const safeOffset = headerHeight + 16;
        const elementTop =
            resultsRef.current.getBoundingClientRect().top + window.scrollY - safeOffset;

        window.scrollTo({
            top: Math.max(elementTop, 0),
            behavior: 'smooth',
        });
    }, [resultsRef]);

    useEffect(() => {
        if (!shouldScrollToResults || loading) return;

        scrollToResults();
        setShouldScrollToResults(false);
    }, [loading, scrollToResults, shouldScrollToResults]);

    const handleRecommendClick = () => {
        setShouldScrollToResults(true);
        handleRecommend();
    };

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title="Discover with AI"
                subtitle="Pick moods and let CineView assemble a calm, cinematic watchlist."
                rightSlot={<ModeSwitch value={mode} onChange={setMode} />}
            />

            <div className="page-shell space-y-8">
                <Heading shuffleBadges={shuffleBadges} shuffleDisabled={mode === 'all'} />

                <section className="relative card-surface p-5 md:p-6 space-y-6 overflow-hidden">
                    {loading && <LoadingOverlay message={loadingMessage} />}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <p className="text-caption">
                                Pick up to {selectionLimit} moods (
                                {mode === 'all'
                                    ? 'choose at least one to get recommendations'
                                    : 'pick three to get recommendations'}
                                )
                            </p>
                            <h2 className="text-headline">What are you in the mood for?</h2>
                        </div>
                        <span className="text-caption rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1">
                            {selected.length} / {selectionLimit} selected
                        </span>
                    </div>

                    {mode === 'random' ? (
                        <div key={`${mode}-${round}`} className="flex flex-wrap gap-3 md:gap-4">
                            {randomBadges.map(badge => {
                                const isSelected = selected.some(item => item.id === badge.id);
                                const categoryColor =
                                    BADGE_COLORS[badge.category] ?? DEFAULT_BADGE_COLOR;
                                const categoryTitleColor =
                                    BADGE_TITLE_COLORS[badge.category] ??
                                    DEFAULT_BADGE_TITLE_COLOR;

                                return (
                                    <motion.button
                                        variants={badgeItemVariants}
                                        key={badge.id}
                                        type="button"
                                        onClick={() => handleToggleBadge(badge)}
                                        className={`cursor-pointer ${badgeButtonBase} ${
                                            isSelected
                                                ? categoryColor
                                                : 'hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:-translate-y-0.5'
                                        }`}
                                    >
                                        <span
                                            className={`block text-[11px] uppercase tracking-[0.18em] ${categoryTitleColor}`}
                                        >
                                            {badge.category}
                                        </span>
                                        <span className="text-base">{badge.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedBadges.map(([category, badges]) => {
                                const categoryTitleColor =
                                    BADGE_TITLE_COLORS[category] ?? DEFAULT_BADGE_TITLE_COLOR;

                                return (
                                    <motion.div
                                        key={category}
                                        variants={badgeContainerVariants}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs tracking-[0.18em] uppercase ${categoryTitleColor}`}
                                            >
                                                {category.toUpperCase()}
                                            </span>
                                            <span className="h-px w-10 bg-[var(--border)]" />
                                        </div>
                                        <div className="flex flex-wrap gap-3 md:gap-4">
                                            {badges.map(badge => {
                                                const isSelected = selected.some(
                                                    item => item.id === badge.id,
                                                );
                                                const categoryColor =
                                                    BADGE_COLORS[badge.category] ??
                                                    DEFAULT_BADGE_COLOR;

                                                return (
                                                    <motion.button
                                                        variants={badgeItemVariants}
                                                        key={badge.id}
                                                        type="button"
                                                        onClick={() => handleToggleBadge(badge)}
                                                        className={`cursor-pointer ${badgeButtonBase} ${
                                                            isSelected
                                                                ? categoryColor
                                                                : 'hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        <span className="text-base">
                                                            {badge.label}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                    {hint && <p className="text-caption text-amber-200">{hint}</p>}
                </section>

                <div className="flex flex-wrap gap-3">
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={handleRecommendClick}
                        disabled={!canRecommend || loading}
                    >
                        {loading ? 'Working…' : 'Get recommendations'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={shuffleBadges}
                        disabled={mode === 'all'}
                    >
                        Try again
                    </Button>
                </div>

                <section className="space-y-6 pb-6" ref={resultsRef}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-headline">Recommendations</h2>
                        <span className="text-caption">AI-powered, mood-first</span>
                    </div>

                    {error && (
                        <ErrorState
                            message={error}
                            onRetry={shuffleBadges}
                        />
                    )}

                    {didSearch && !loading && !error && recommendations.length === 0 && (
                        <EmptyState
                            title="No luck this time."
                            message="We couldn’t match those moods. Try a different mix."
                        />
                    )}

                    {!didSearch && !error && recommendations.length === 0 && !loading && (
                        <EmptyState
                            title="Pick a mood to begin."
                            message={
                                mode === 'all'
                                    ? 'Choose at least one mood to see curated picks.'
                                    : 'Pick three moods to get started.'
                            }
                        />
                    )}

                    {recommendations.length > 0 && (
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {recommendations.map(movie => {
                                    const posterUrl = movie.poster_path
                                        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                        : null;
                                    const rating =
                                        typeof movie.vote_average === 'number'
                                            ? movie.vote_average.toFixed(1)
                                            : null;

                                    return (
                                        <div
                                            key={movie.title + movie.tmdb_id}
                                            className="card-surface flex h-full flex-col overflow-hidden"
                                        >
                                            <div className="p-5 space-y-4 flex-1 flex flex-col">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-24">
                                                        <PosterImage
                                                            src={posterUrl}
                                                            alt={movie.title}
                                                            priority={false}
                                                            className="rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Link href={`/detail/movie/${movie.tmdb_id}`}>
                                                            <h3 className="text-headline">
                                                                {movie.title}
                                                            </h3>
                                                        </Link>
                                                        {movie.release_year && (
                                                            <p className="text-caption">
                                                                {movie.release_year}
                                                            </p>
                                                        )}
                                                        {rating && (
                                                            <p className="text-caption">⭐ {rating}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {movie.overview && (
                                                    <p className="text-caption line-clamp-3">
                                                        {movie.overview}
                                                    </p>
                                                )}
                                                <p className="text-body text-[var(--text-muted)] flex-1 leading-relaxed line-clamp-4">
                                                    {movie.reason}
                                                </p>
                                                {movie.tmdb_id ? (
                                                    <Link
                                                        href={`/detail/movie/${movie.tmdb_id}`}
                                                        className="text-caption text-[var(--accent)] hover:text-[var(--text)]"
                                                    >
                                                        View details ↗
                                                    </Link>
                                                ) : (
                                                    <span className="text-caption text-[var(--text-muted)]">
                                                        No TMDB link
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
