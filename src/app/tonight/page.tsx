'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useTonightPick from '@/hooks/useTonightPick';
import { TonightMovie } from '@/types/tonight';

function formatRuntime(runtime?: number | null) {
    if (runtime === undefined || runtime === null) return '';
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function ResetTimer({ resetAt }: { resetAt?: string }) {
    const [label, setLabel] = useState('...');

    useEffect(() => {
        if (!resetAt) return;
        const target = new Date(resetAt).getTime();
        if (Number.isNaN(target)) return;

        const update = () => {
            const diff = target - Date.now();
            if (diff <= 0) {
                setLabel('moments');
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setLabel(`${hours}h ${minutes}m`);
        };

        update();
        const id = window.setInterval(update, 30_000);
        return () => window.clearInterval(id);
    }, [resetAt]);

    if (!resetAt || Number.isNaN(new Date(resetAt).getTime())) return null;

    return (
        <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(74,222,128,0.7)]" />
            <span>Resets in {label}</span>
            <span className="text-gray-500">•</span>
            <span>Resets at 00:00 (Kyiv)</span>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="grid gap-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 md:p-8 md:grid-cols-[280px,1fr]">
            <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 shimmer-surface" />
            <div className="space-y-4">
                <div className="h-8 w-1/2 rounded-full bg-white/10 shimmer-surface" />
                <div className="h-4 w-1/3 rounded-full bg-white/5 shimmer-surface" />
                <div className="h-4 w-full rounded-full bg-white/5 shimmer-surface" />
                <div className="h-4 w-3/4 rounded-full bg-white/5 shimmer-surface" />
                <div className="flex gap-3 pt-4">
                    <div className="h-11 w-32 rounded-xl bg-white/10 shimmer-surface" />
                    <div className="h-11 w-28 rounded-xl border border-white/10 shimmer-surface" />
                </div>
            </div>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-red-100 space-y-3">
            <div className="text-lg font-semibold">Something slipped.</div>
            <p className="text-red-50/90">
                We couldn’t load tonight’s pick. Give it another try to get a calm recommendation.
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-red-500/90 px-4 py-2 font-semibold text-white hover:bg-red-400 transition"
            >
                Try again
            </button>
        </div>
    );
}

function EmptyState({
    onRetry,
    onReroll,
    canReroll,
    isRerolling,
}: {
    onRetry: () => void;
    onReroll: () => void;
    canReroll: boolean;
    isRerolling: boolean;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 text-gray-100">
            <p className="text-lg font-semibold">No movie surfaced just yet.</p>
            <p className="text-gray-300">
                TMDB was a bit quiet. You can retry loading or use your one reroll for today.
            </p>
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={onRetry}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 transition"
                >
                    Retry loading
                </button>
                <button
                    type="button"
                    onClick={onReroll}
                    disabled={!canReroll || isRerolling}
                    className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/40"
                >
                    {isRerolling ? 'Rerolling...' : canReroll ? 'Use today’s reroll' : 'Reroll used'}
                </button>
            </div>
        </div>
    );
}

function TonightHero({
    movie,
    intentLine,
    whyText,
    isWhyOpen,
    onToggleWhy,
    onWatch,
}: {
    movie: TonightMovie;
    intentLine: string;
    whyText?: string;
    isWhyOpen: boolean;
    onToggleWhy: () => void;
    onWatch: () => void;
}) {
    const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : undefined;
    const runtime = formatRuntime(movie.runtime);
    const genres = movie.genres?.map(genre => genre.name).join(' • ');

    return (
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 p-6 md:p-8 md:grid-cols-[280px,1fr] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                {movie.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 280px"
                        priority
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                        Poster unavailable
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.22em] text-purple-200/70">
                        Tonight’s pick
                    </p>
                    <div className="flex flex-wrap items-baseline gap-3">
                        <h2 className="text-3xl md:text-4xl font-semibold text-white">
                            {movie.title}
                        </h2>
                        {releaseYear && (
                            <span className="text-gray-300 text-lg">• {releaseYear}</span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                        {runtime && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                                ⏱ {runtime}
                            </span>
                        )}
                        {genres && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                                🎞 {genres}
                            </span>
                        )}
                    </div>
                </div>

                <p className="text-lg text-purple-50/90 italic">{intentLine}</p>

                <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                        href={`/detail/movie/${movie.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-950 px-5 py-3 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition"
                        onClick={onWatch}
                    >
                        Watch options
                    </Link>
                    <button
                        type="button"
                        onClick={onToggleWhy}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                    >
                        {isWhyOpen ? 'Hide reason' : 'Why this?'}
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {isWhyOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 rounded-2xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-50/90">
                                {whyText ??
                                    'Reasoning is warming up, but this pick leans on mood and pacing to fit tonight.'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function TonightPage() {
    const { pickQuery, movieQuery, rerollMutation, whyMutation } = useTonightPick();
    const [isWhyOpen, setIsWhyOpen] = useState(false);

    const intentLine =
        whyMutation.data?.intentLine ??
        'One careful pick for tonight. Calmly loading a more tailored note.';
    const whyText = whyMutation.data?.whyText;
    const canReroll = pickQuery.data?.rerollAvailable ?? false;

    const isLoading = pickQuery.isLoading || (!movieQuery.data && movieQuery.isLoading);
    const hasMovieError = movieQuery.isError && Boolean(pickQuery.data);

    useEffect(() => {
        if (pickQuery.data) {
            console.log('tonight_viewed', {
                dateKey: pickQuery.data.dateKey,
                movieId: pickQuery.data.movieId,
            });
        }
    }, [pickQuery.data]);

    useEffect(() => {
        setIsWhyOpen(false);
        whyMutation.reset();
    }, [pickQuery.data?.movieId, whyMutation]);

    useEffect(() => {
        if (
            movieQuery.isSuccess &&
            pickQuery.data &&
            !whyMutation.data &&
            !whyMutation.isPending &&
            !whyMutation.isError
        ) {
            whyMutation.mutate();
        }
    }, [
        movieQuery.isSuccess,
        pickQuery.data,
        whyMutation.data,
        whyMutation.isPending,
        whyMutation.isError,
        whyMutation,
    ]);

    useEffect(() => {
        if (rerollMutation.isSuccess && pickQuery.data) {
            console.log('tonight_rerolled', {
                dateKey: pickQuery.data.dateKey,
                movieId: pickQuery.data.movieId,
            });
        }
    }, [pickQuery.data, rerollMutation.isSuccess]);

    const handleToggleWhy = () => {
        setIsWhyOpen(prev => {
            const next = !prev;
            if (next && pickQuery.data) {
                if (!whyMutation.data && !whyMutation.isPending) {
                    whyMutation.mutate();
                }
                console.log('tonight_why_opened', {
                    dateKey: pickQuery.data.dateKey,
                    movieId: pickQuery.data.movieId,
                });
            }
            return next;
        });
    };

    const handleWatch = () => {
        if (!pickQuery.data) return;
        console.log('tonight_watch_clicked', {
            dateKey: pickQuery.data.dateKey,
            movieId: pickQuery.data.movieId,
        });
    };

    const handleReroll = () => {
        rerollMutation.mutate();
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-black text-white pt-24 pb-16">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-10 top-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-10 top-32 h-56 w-56 rounded-full bg-indigo-500/15 blur-[90px]" />
                <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-amber-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4">
                <header className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌙</span>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.22em] text-purple-200/80">
                                Tonight&apos;s One Movie
                            </p>
                            <h1 className="text-3xl md:text-4xl font-semibold text-white">
                                Tonight&apos;s One Movie
                            </h1>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg">Picked for this moment — not your watchlist.</p>
                    <ResetTimer resetAt={pickQuery.data?.resetAt} />
                </header>

                {pickQuery.isError ? (
                    <ErrorState onRetry={() => pickQuery.refetch()} />
                ) : isLoading && !movieQuery.data ? (
                    <LoadingState />
                ) : hasMovieError ? (
                    <EmptyState
                        onRetry={() => movieQuery.refetch()}
                        onReroll={handleReroll}
                        canReroll={canReroll}
                        isRerolling={rerollMutation.isPending}
                    />
                ) : movieQuery.data ? (
                    <TonightHero
                        movie={movieQuery.data}
                        intentLine={intentLine}
                        whyText={whyMutation.isPending ? undefined : whyText}
                        isWhyOpen={isWhyOpen}
                        onToggleWhy={handleToggleWhy}
                        onWatch={handleWatch}
                    />
                ) : (
                    <LoadingState />
                )}

                {pickQuery.data && (
                    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-base font-semibold text-white">
                                    Not feeling this one?
                                </p>
                                <p className="text-sm text-gray-300">
                                    You can reroll once per day. Calmly resets in Kyiv at midnight.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleReroll}
                                disabled={!canReroll || rerollMutation.isPending}
                                className="rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-purple-500/40"
                            >
                                {rerollMutation.isPending
                                    ? 'Rerolling...'
                                    : canReroll
                                      ? 'Reroll'
                                      : 'Reroll used for today'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
