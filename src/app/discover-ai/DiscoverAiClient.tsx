'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants, stagger } from 'framer-motion';
import LoadingOverlay from '@/components/LoadingOverlay';
import Heading from '@/app/discover-ai/Heading';
import ModeSwitch from '@/app/discover-ai/ModeSwitch';
import useDiscoverAi from '@/hooks/useDiscoverAi';
import {
    BADGE_COLORS,
    BADGE_TITLE_COLORS,
    DEFAULT_BADGE_COLOR,
    DEFAULT_BADGE_TITLE_COLOR,
} from '@/data/moodBadges';
import { CURATORS } from '@/data/curators';

const badgeButtonBase =
    'px-5 md:px-8 py-2 rounded-3xl border transition-all text-sm md:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950';

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
            delayChildren: stagger(0.1),
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

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: 'easeInOut',
        },
    },
};

export default function DiscoverAiClient() {
    const {
        mode,
        setMode,
        curatorId,
        setCuratorId,
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
        curation,
        hasResults,
        loading,
        loadingMessage,
        hint,
        error,
        didSearch,
        resultsRef,
    } = useDiscoverAi();

    const selectedCurator = CURATORS.find(cur => cur.id === curatorId) ?? CURATORS[0];
    const alternatives = curation?.alternatives ?? [];
    const primary = curation?.primary ?? null;

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden pt-18">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-12 space-y-10">
                <Heading shuffleBadges={shuffleBadges} shuffleDisabled={loading || mode === 'all'} />

                <section className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-4 md:p-8 space-y-6 overflow-hidden">
                    {loading && <LoadingOverlay message={loadingMessage} />}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <p className="text-sm text-purple-200/80">Choose your AI curator</p>
                            <div className="flex flex-wrap gap-3">
                                {CURATORS.map(curator => {
                                    const isActive = curator.id === curatorId;
                                    return (
                                        <button
                                            key={curator.id}
                                            type="button"
                                            onClick={() => setCuratorId(curator.id)}
                                            disabled={loading}
                                            className={`cursor-pointer rounded-2xl border px-4 py-3 transition shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-lg flex items-center gap-3 ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-400/40 text-white'
                                                    : 'bg-black/40 border-white/10 text-gray-200 hover:border-purple-300/60 hover:text-white'
                                            } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="text-xl" aria-hidden>
                                                {curator.emoji}
                                            </span>
                                            <div className="text-left">
                                                <span className="hidden sm:block text-sm font-semibold">{curator.name}</span>
                                                <span className="sm:hidden text-sm font-semibold">{curator.emoji}</span>
                                                <p className="text-[12px] text-gray-300/80 leading-tight">{curator.tagline}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="w-max flex flex-col items-end gap-3 shrink-0">
                            <ModeSwitch value={mode} onChange={setMode} disabled={loading} />
                            <span className="text-sm text-gray-300 bg-white/5 border border-white/5 px-3 py-1 rounded-full">
                                {selected.length} / {selectionLimit} selected
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <p className="text-sm text-purple-200/80">
                                Pick up to {selectionLimit} moods to guide {selectedCurator.name}
                            </p>
                            <h2 className="text-2xl font-semibold text-white">What are you in the mood for?</h2>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-gray-300">
                            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                                {mode === 'all' ? 'Browse all moods' : 'Quick random mix'}
                            </span>
                        </div>
                    </div>

                    {mode === 'random' ? (
                        <motion.div
                            key={`${mode}-${round}`}
                            variants={badgeContainerVariants}
                            initial="hidden"
                            animate="show"
                            className="flex flex-wrap gap-3 md:gap-4"
                        >
                            {randomBadges.map(badge => {
                                const isSelected = selected.some(item => item.id === badge.id);
                                const categoryColor = BADGE_COLORS[badge.category] ?? DEFAULT_BADGE_COLOR;
                                const categoryTitleColor = BADGE_TITLE_COLORS[badge.category] ?? DEFAULT_BADGE_TITLE_COLOR;

                                return (
                                    <motion.button
                                        variants={badgeItemVariants}
                                        key={badge.id}
                                        type="button"
                                        onClick={() => handleToggleBadge(badge)}
                                        disabled={loading}
                                        className={`cursor-pointer ${badgeButtonBase} ${
                                            isSelected
                                                ? categoryColor
                                                : 'bg-black/50 border-white/10 text-gray-200 hover:border-purple-300/60 hover:text-white hover:shadow-[0_10px_30px_rgba(124,58,237,0.15)]'
                                        } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <span className={`block text-[11px] uppercase tracking-[0.18em] ${categoryTitleColor}`}>
                                            {badge.category}
                                        </span>
                                        <span className="text-base">{badge.label}</span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {groupedBadges.map(([category, badges]) => {
                                const categoryTitleColor = BADGE_TITLE_COLORS[category] ?? DEFAULT_BADGE_TITLE_COLOR;

                                return (
                                    <motion.div key={category} variants={badgeContainerVariants} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs tracking-[0.18em] uppercase text-gray-300 ${categoryTitleColor}`}
                                            >
                                                {category.toUpperCase()}
                                            </span>
                                            <span className="h-px w-10 bg-white/10" />
                                        </div>
                                        <div className="flex flex-wrap gap-3 md:gap-4">
                                            {badges.map(badge => {
                                                const isSelected = selected.some(item => item.id === badge.id);
                                                const categoryColor = BADGE_COLORS[badge.category] ?? DEFAULT_BADGE_COLOR;

                                                return (
                                                    <motion.button
                                                        variants={badgeItemVariants}
                                                        key={badge.id}
                                                        type="button"
                                                        onClick={() => handleToggleBadge(badge)}
                                                        disabled={loading}
                                                        className={`cursor-pointer ${badgeButtonBase} ${
                                                            isSelected
                                                                ? categoryColor
                                                                : 'bg-black/50 border-white/10 text-gray-200 hover:border-purple-300/60 hover:text-white hover:shadow-[0_10px_30px_rgba(124,58,237,0.15)]'
                                                        } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    >
                                                        <span className="text-base">{badge.label}</span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                    {hint && <p className="text-sm text-amber-300">{hint}</p>}
                </section>

                <div className="flex flex-wrap gap-4 items-center" ref={resultsRef}>
                    <button
                        type="button"
                        onClick={handleRecommend}
                        disabled={!canRecommend || loading}
                        className={`cursor-pointer relative overflow-hidden px-7 py-3 rounded-2xl text-lg font-semibold transition-all shadow-[0_12px_40px_rgba(124,58,237,0.4)] focus:outline-none focus:ring-2 focus:ring-purple-400/50 w-full md:w-auto ${
                            canRecommend && !loading
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
                                <div className="flex flex-col leading-tight">Working</div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-white">
                                <div className="flex flex-col leading-tight">Get curated picks</div>
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={shuffleBadges}
                        disabled={mode === 'all' || loading}
                        className={`cursor-pointer px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-gray-100 transition ${
                            mode === 'all' || loading
                                ? 'opacity-60 cursor-not-allowed'
                                : 'hover:border-purple-300/60 hover:bg-purple-500/10'
                        }`}
                    >
                        Try again
                    </button>
                </div>

                <section className="space-y-6 pb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">Curated picks</h2>
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
                                    disabled={mode === 'all' || loading}
                                    className={`text-sm underline underline-offset-4 ${
                                        mode === 'all' || loading
                                            ? 'text-gray-500 cursor-not-allowed'
                                            : 'hover:text-white'
                                    }`}
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {didSearch && !loading && !error && recommendations.length === 0 && (
                        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-red-200 shadow-[0_10px_40px_rgba(240,70,70,0.15)] backdrop-blur-xl">
                            <h3 className="text-xl font-semibold mb-2">No luck this time 🎲</h3>
                            <p className="text-sm">
                                I couldn`t match any movies to that mood combination. Try different vibes or shuffle!
                            </p>
                        </div>
                    )}

                    {!didSearch && !error && recommendations.length === 0 && !loading && (
                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-gray-300 backdrop-blur-xl">
                            Pick up to {selectionLimit} moods to get started. I’ll find the best cinematic match.
                        </div>
                    )}

                    {hasResults && (
                        <div className="space-y-5">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)] flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                    <span className="text-lg" aria-hidden>
                                        {curation?.curator?.emoji ?? selectedCurator.emoji}
                                    </span>
                                    <span className="font-semibold">{curation?.curator?.name ?? selectedCurator.name}</span>
                                    <span className="text-gray-400">/ Curator Note</span>
                                </div>
                                <p className="text-base text-gray-100 leading-relaxed">
                                    {curation?.curator_note || 'Handpicking something special for you...'}
                                </p>
                            </div>

                            {primary && (
                                <motion.div
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="grid gap-6 lg:grid-cols-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.55)] overflow-hidden"
                                >
                                    <div className="relative lg:col-span-2 h-72 w-full h-full">
                                        {primary.poster_path ? (
                                            primary.tmdb_id ? (
                                                <Link href={`/detail/movie/${primary.tmdb_id}`} className="block h-full w-full">
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w500${primary.poster_path}`}
                                                        alt={primary.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 40vw"
                                                    />
                                                </Link>
                                            ) : (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w500${primary.poster_path}`}
                                                    alt={primary.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, 40vw"
                                                />
                                            )
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                                                No poster available
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-4 lg:col-span-3 flex flex-col">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                {primary.tmdb_id ? (
                                                    <Link href={`/detail/movie/${primary.tmdb_id}`}>
                                                        <h3 className="text-2xl font-semibold text-white">{primary.title}</h3>
                                                    </Link>
                                                ) : (
                                                    <h3 className="text-2xl font-semibold text-white">{primary.title}</h3>
                                                )}
                                                {primary.release_year && (
                                                    <p className="text-sm text-gray-400">{primary.release_year}</p>
                                                )}
                                            </div>
                                            {typeof primary.vote_average === 'number' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100 shadow-[0_8px_20px_rgba(124,58,237,0.25)]">
                                                    ⭐ {primary.vote_average.toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                        {primary.overview && (
                                            <p className="text-gray-300/90 text-sm leading-relaxed">{primary.overview}</p>
                                        )}
                                        {primary.reason && (
                                            <p className="text-purple-100 text-sm leading-relaxed bg-purple-500/10 border border-purple-300/20 rounded-2xl px-4 py-3">
                                                {primary.reason}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between pt-2 mt-auto">
                                            {primary.tmdb_id ? (
                                                <Link
                                                    href={`/detail/movie/${primary.tmdb_id}`}
                                                    className="inline-flex items-center gap-2 rounded-full border border-purple-300/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)]"
                                                >
                                                    View details
                                                    <span className="text-lg leading-none">↗</span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-gray-500">No TMDB link</span>
                                            )}
                                            <span className="text-xs text-gray-400">Primary pick</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {alternatives.length > 0 && (
                                <motion.div
                                    variants={badgeContainerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                >
                                    <AnimatePresence>
                                        {alternatives.map(movie => {
                                            const posterUrl = movie.poster_path
                                                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                                : null;
                                            const rating =
                                                typeof movie.vote_average === 'number'
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
                                                    {posterUrl ? (
                                                        movie.tmdb_id ? (
                                                            <Link
                                                                href={`/detail/movie/${movie.tmdb_id}`}
                                                                className="relative h-64 w-full overflow-hidden"
                                                            >
                                                                <Image
                                                                    src={posterUrl}
                                                                    alt={movie.title}
                                                                    fill
                                                                    className="object-cover transition duration-500 group-hover:scale-105"
                                                                    sizes="
                                                            (max-width: 480px) 45vw,
                                                            (max-width: 768px) 33vw,
                                                            (max-width: 1200px) 25vw,
                                                            20vw
                        "
                                                                />
                                                            </Link>
                                                        ) : (
                                                            <div className="relative h-64 w-full overflow-hidden">
                                                                <Image
                                                                    src={posterUrl}
                                                                    alt={movie.title}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="
                                                            (max-width: 480px) 45vw,
                                                            (max-width: 768px) 33vw,
                                                            (max-width: 1200px) 25vw,
                                                            20vw
                        "
                                                                />
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="h-64 w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-gray-500">
                                                            No poster available
                                                        </div>
                                                    )}
                                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="space-y-1">
                                                                {movie.tmdb_id ? (
                                                                    <Link href={`/detail/movie/${movie.tmdb_id}`}>
                                                                        <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                                                                    </Link>
                                                                ) : (
                                                                    <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                                                                )}
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
                                                            <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-3">
                                                                {movie.overview}
                                                            </p>
                                                        )}
                                                        {movie.reason && (
                                                            <p className="text-gray-200 text-sm leading-relaxed flex-1">{movie.reason}</p>
                                                        )}
                                                        <div className="flex items-center justify-between pt-2">
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
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
