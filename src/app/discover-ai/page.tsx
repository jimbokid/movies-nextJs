'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AiRecommendResponse, AiRecommendedMovie, MoodBadge } from '@/types/discoverAi';
import { sampleBadges } from '@/data/moodBadges';

const BADGE_MIN = 12;
const BADGE_MAX = 16;
const AI_RECOMMEND_ENDPOINT = '/api/ai-recommend';

const badgeButtonBase =
    'px-4 py-2 rounded-full border transition-all text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950';

export default function DiscoverAiPage() {
    const [availableBadges, setAvailableBadges] = useState<MoodBadge[]>([]);
    const [selected, setSelected] = useState<MoodBadge[]>([]);
    const [recommendations, setRecommendations] = useState<AiRecommendedMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);

    const randomCount = useCallback(() => Math.floor(Math.random() * (BADGE_MAX - BADGE_MIN + 1)) + BADGE_MIN, []);

    const shuffleBadges = useCallback(() => {
        const count = randomCount();
        setAvailableBadges(sampleBadges(count));
        setSelected([]);
        setRecommendations([]);
        setError(null);
        setHint(null);
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
        <div className="bg-gray-950 min-h-screen text-white">
            <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
                <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-purple-300">Mini-game</p>
                    <h1 className="text-4xl font-bold">AI Mood-based Movie Picker</h1>
                    <p className="text-lg text-gray-300 max-w-3xl">
                        Pick 3 vibes and I&apos;ll suggest what to watch tonight. Shuffle the moods anytime to start a new
                        round.
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <button
                            type="button"
                            onClick={shuffleBadges}
                            className="text-purple-300 hover:text-purple-200 underline underline-offset-4"
                        >
                            Shuffle moods
                        </button>
                        {selectionSummary && (
                            <span className="text-gray-500">Currently selected: {selectionSummary}</span>
                        )}
                    </div>
                </div>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-100">Pick exactly 3 moods</h2>
                        <span className="text-sm text-gray-400">{selected.length} / 3 selected</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableBadges.map(badge => {
                            const isSelected = selected.some(item => item.id === badge.id);
                            return (
                                <button
                                    key={badge.id}
                                    type="button"
                                    onClick={() => handleToggleBadge(badge)}
                                    className={`${badgeButtonBase} ${
                                        isSelected
                                            ? 'bg-purple-500/20 border-purple-400 text-purple-100 shadow-[0_0_0_1px_rgba(168,85,247,0.4)]'
                                            : 'bg-gray-900 border-gray-800 text-gray-200 hover:border-purple-400 hover:text-purple-100'
                                    }`}
                                >
                                    <span className="block text-xs uppercase tracking-wide text-gray-400">{badge.category}</span>
                                    <span className="text-base">{badge.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    {hint && <p className="text-sm text-amber-300">{hint}</p>}
                </section>

                <div className="flex flex-wrap gap-4 items-center">
                    <button
                        type="button"
                        onClick={handleRecommend}
                        disabled={selected.length !== 3 || loading}
                        className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all shadow-lg ${
                            selected.length === 3 && !loading
                                ? 'bg-purple-500 hover:bg-purple-400 text-black'
                                : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Summoning picks...' : 'Get recommendations'}
                    </button>
                    <button
                        type="button"
                        onClick={shuffleBadges}
                        className="px-5 py-3 rounded-xl border border-gray-700 text-gray-200 hover:border-purple-400 hover:text-purple-200 transition"
                    >
                        Try again
                    </button>
                    <p className="text-gray-400 text-sm">No limits for this POC — experiment freely.</p>
                </div>

                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">Recommendations</h2>
                        <span className="text-sm text-gray-500">AI-powered, tailored to your moods</span>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
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
                        <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/60 p-6 text-gray-400">
                            Pick 3 moods to get started. I&apos;ll find five movies that match your vibe.
                        </div>
                    )}

                    {recommendations.length > 0 && (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {recommendations.map(movie => {
                                const posterUrl = movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                    : null;
                                const rating = typeof movie.vote_average === 'number'
                                    ? movie.vote_average.toFixed(1)
                                    : null;

                                return (
                                    <div
                                        key={movie.title + movie.tmdb_id}
                                        className="rounded-2xl border border-gray-800 bg-gray-900/80 shadow-xl overflow-hidden flex flex-col"
                                    >
                                        {posterUrl ? (
                                            <div className="relative h-64 w-full">
                                                <Image
                                                    src={posterUrl}
                                                    alt={movie.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-64 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                                                No poster available
                                            </div>
                                        )}
                                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                                            <div className="space-y-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                                                        {movie.release_year && (
                                                            <p className="text-sm text-gray-400">{movie.release_year}</p>
                                                        )}
                                                    </div>
                                                    {rating && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100">
                                                            ⭐ {rating}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {movie.overview && (
                                                <p className="text-gray-400 text-sm leading-relaxed">{movie.overview}</p>
                                            )}
                                            <p className="text-gray-200 text-sm leading-relaxed flex-1">{movie.reason}</p>
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs uppercase tracking-[0.2em] text-purple-300">Tailored pick</span>
                                                {movie.tmdb_id ? (
                                                    <Link
                                                        href={`/detail/movie/${movie.tmdb_id}`}
                                                        className="text-sm font-semibold text-purple-300 hover:text-purple-200"
                                                    >
                                                        View details
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-gray-500">No TMDB link</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
