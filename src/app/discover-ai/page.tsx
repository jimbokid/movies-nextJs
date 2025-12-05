'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AiRecommendResponse, AiRecommendedMovie, MoodBadge } from '@/types/discoverAi';
import { sampleBadges } from '@/data/moodBadges';

const BADGE_MIN = 12;
const BADGE_MAX = 16;
const AI_RECOMMEND_ENDPOINT = '/api/ai-recommend';

const badgeButtonBase =
    'px-4 py-3 rounded-full border transition-all text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950';

const badgeContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
};

const badgeItemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: 'easeOut' } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DiscoverAiPage() {
    const [availableBadges, setAvailableBadges] = useState<MoodBadge[]>([]);
    const [selected, setSelected] = useState<MoodBadge[]>([]);
    const [recommendations, setRecommendations] = useState<AiRecommendedMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [round, setRound] = useState(0);

    const randomCount = useCallback(() => Math.floor(Math.random() * (BADGE_MAX - BADGE_MIN + 1)) + BADGE_MIN, []);

    const shuffleBadges = useCallback(() => {
        const count = randomCount();
        setAvailableBadges(sampleBadges(count));
        setSelected([]);
        setRecommendations([]);
        setError(null);
        setHint(null);
        setRound(prev => prev + 1);
    }, [randomCount]);

    useEffect(() => {
        shuffleBadges();
    }, [shuffleBadges]);

    const handleToggleBadge = (badge: MoodBadge) => {
        const isSelected = selected.some(item => item.id === badge.id);

        if (isSelected) {
            setSelected(prev => prev.filter(item => item.id !== badge.id));
            setHint(null);
            return;
        }

        if (selected.length >= 3) {
            setHint('You can only pick 3 moods for this round.');
            return;
        }

        setSelected(prev => [...prev, badge]);
        setHint(null);
    };

    const handleRecommend = async () => {
        if (selected.length !== 3) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(AI_RECOMMEND_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selected: selected.map(item => ({ label: item.label, category: item.category })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? 'Unable to fetch recommendations.');
            }

            const data: AiRecommendResponse = await response.json();
            setRecommendations(data.movies ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const selectionSummary = useMemo(() => selected.map(item => item.label).join(', '), [selected]);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-12 space-y-10">
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-purple-200/80 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                            Mini-game
                        </p>
                        <span className="text-xs text-gray-400">Round {round + 1}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            <span className="bg-gradient-to-r from-purple-200 via-white to-purple-300 bg-clip-text text-transparent">
                                AI Mood-based Movie Picker
                            </span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-3xl">
                            Pick exactly 3 vibes and I&apos;ll summon tonight&apos;s perfect watchlist. Shuffle anytime to start a fresh round.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                            <button
                                type="button"
                                onClick={shuffleBadges}
                                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-purple-100 transition hover:border-purple-300/60 hover:bg-purple-500/10"
                            >
                                <span className="h-2 w-2 rounded-full bg-purple-300 shadow-[0_0_0_4px_rgba(168,85,247,0.15)] transition-transform group-hover:scale-110" />
                                Shuffle moods
                            </button>
                            {selectionSummary && (
                                <span className="text-gray-400">Currently selected: {selectionSummary}</span>
                            )}
                        </div>
                    </div>
                </div>

                <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-sm text-purple-200/80">Pick exactly 3 moods</p>
                            <h2 className="text-2xl font-semibold text-white">What are you in the mood for?</h2>
                        </div>
                        <span className="text-sm text-gray-300 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                            {selected.length} / 3 selected
                        </span>
                    </div>

                    <motion.div
                        key={round}
                        variants={badgeContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"
                    >
                        {availableBadges.map(badge => {
                            const isSelected = selected.some(item => item.id === badge.id);
                            return (
                                <motion.button
                                    variants={badgeItemVariants}
                                    key={badge.id}
                                    type="button"
                                    onClick={() => handleToggleBadge(badge)}
                                    className={`${badgeButtonBase} ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-purple-300 text-purple-50 shadow-[0_10px_40px_rgba(168,85,247,0.25)]'
                                            : 'bg-black/50 border-white/10 text-gray-200 hover:border-purple-300/60 hover:text-white hover:shadow-[0_10px_30px_rgba(124,58,237,0.15)]'
                                    }`}
                                >
                                    <span className="block text-[11px] uppercase tracking-[0.18em] text-gray-400">{badge.category}</span>
                                    <span className="text-base">{badge.label}</span>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                    {hint && <p className="text-sm text-amber-300">{hint}</p>}
                </section>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        type="button"
                        onClick={handleRecommend}
                        disabled={selected.length !== 3 || loading}
                        className={`relative overflow-hidden px-7 py-3 rounded-2xl text-lg font-semibold transition-all shadow-[0_12px_40px_rgba(124,58,237,0.4)] focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
                            selected.length === 3
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-[0_20px_60px_rgba(124,58,237,0.45)]'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-3 text-white">
                                <motion.span
                                    className="h-5 w-5 rounded-full border-2 border-white/60 border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                                />
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm uppercase tracking-[0.18em] text-white/80">Working</span>
                                    <span className="text-base">Summoning cinematic picks...</span>
                                </div>
                            </div>
                        ) : (
                            'Get recommendations'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={shuffleBadges}
                        className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-gray-100 hover:border-purple-300/60 hover:bg-purple-500/10 transition"
                    >
                        Try again
                    </button>
                    <p className="text-gray-400 text-sm">No limits for this POC — experiment freely.</p>
                </div>

                <section className="space-y-6 pb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">Recommendations</h2>
                        <span className="text-sm text-gray-400">AI-powered, tailored to your moods</span>
                    </div>

                    {error && (
                        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-900/40 to-transparent p-5 text-red-100 shadow-[0_15px_50px_rgba(248,113,113,0.15)]">
                            <p className="font-semibold">Something went wrong</p>
                            <p className="text-sm text-red-200">{error}</p>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={shuffleBadges}
                                    className="text-sm underline underline-offset-4 hover:text-white"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {!error && recommendations.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-gray-300 backdrop-blur-xl">
                            Pick 3 moods to get started. I&apos;ll find five movies that match your vibe.
                        </div>
                    )}

                    {recommendations.length > 0 && (
                        <motion.div
                            variants={badgeContainerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            <AnimatePresence>
                                {recommendations.map(movie => {
                                    const posterUrl = movie.poster_path
                                        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                        : null;
                                    const rating = typeof movie.vote_average === 'number'
                                        ? movie.vote_average.toFixed(1)
                                        : null;

                                    return (
                                        <motion.div
                                            variants={cardVariants}
                                            key={movie.title + movie.tmdb_id}
                                            initial="hidden"
                                            animate="show"
                                            exit={{ opacity: 0, y: 10 }}
                                            className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col"
                                        >
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-purple-600/10 via-transparent to-transparent" />
                                            {posterUrl ? (
                                                <div className="relative h-64 w-full overflow-hidden">
                                                    <Image
                                                        src={posterUrl}
                                                        alt={movie.title}
                                                        fill
                                                        className="object-cover transition duration-500 group-hover:scale-105"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-64 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                                                    No poster available
                                                </div>
                                            )}
                                            <div className="p-5 space-y-3 flex-1 flex flex-col">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                                                        {movie.release_year && (
                                                            <p className="text-sm text-gray-400">{movie.release_year}</p>
                                                        )}
                                                    </div>
                                                    {rating && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100 shadow-[0_8px_20px_rgba(124,58,237,0.25)]">
                                                            ⭐ {rating}
                                                        </span>
                                                    )}
                                                </div>
                                                {movie.overview && (
                                                    <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-3">{movie.overview}</p>
                                                )}
                                                <p className="text-gray-200 text-sm leading-relaxed flex-1">{movie.reason}</p>
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-[11px] uppercase tracking-[0.24em] text-purple-200">Tailored pick</span>
                                                    {movie.tmdb_id ? (
                                                        <Link
                                                            href={`/detail/movie/${movie.tmdb_id}`}
                                                            className="inline-flex items-center gap-2 rounded-full border border-purple-300/40 bg-purple-500/10 px-3 py-1 text-sm font-semibold text-purple-100 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)]"
                                                        >
                                                            View details
                                                            <span className="text-lg leading-none">↗</span>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-gray-500">No TMDB link</span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </section>
            </div>
        </div>
    );
}
