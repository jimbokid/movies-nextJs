'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { AiRecommendedMovie } from '@/types/discoverAi';
import { RefinePreset } from '@/types/curator';
import CuratorLoading, { CuratorLoadingMode } from './CuratorLoading';

type CuratedPick = (AiRecommendedMovie & { locked?: boolean; expanded?: boolean }) | null;

interface CuratorResultsProps {
    primary: CuratedPick;
    alternatives: CuratedPick[];
    status: 'idle' | 'loading' | 'ready' | 'error';
    onRefine: (preset: RefinePreset) => void;
    activePreset?: RefinePreset;
    onEdit: () => void;
    onNewSession: () => void;
    mode?: CuratorLoadingMode;
    curatorEmoji?: string;
    curatorName?: string;
    loadingMessage?: string;
    thinkingLines?: string[];
    onLock: (role: 'primary' | 'alternative', index?: number) => void;
    onExplain: (role: 'primary' | 'alternative', index?: number) => void;
    onSwap: (role: 'primary' | 'alternative', index?: number) => void;
    swapTarget: { role: 'primary' | 'alternative'; index?: number } | null;
    curatorNote?: string | null;
}

const refineOptions: { label: string; preset: RefinePreset }[] = [
    { label: 'More fun', preset: 'more_fun' },
    { label: 'Darker', preset: 'darker' },
    { label: 'More mainstream', preset: 'more_mainstream' },
    { label: 'More indie', preset: 'more_indie' },
    { label: 'Only newer (2015+)', preset: 'only_newer' },
    { label: 'Surprise me', preset: 'surprise' },
];

function truncateNote(note?: string | null) {
    if (!note) return null;
    const sentences = note.split(/(?<=[.!?])\s+/).slice(0, 2);
    return sentences.join(' ');
}

function MovieCard({
    pick,
    priority,
    onLock,
    onExplain,
    onSwap,
    swapping,
}: {
    pick: CuratedPick;
    priority?: boolean;
    onLock: () => void;
    onExplain: () => void;
    onSwap: () => void;
    swapping?: boolean;
}) {
    if (!pick) {
        return <div className="h-full min-h-[240px] rounded-2xl border border-white/10 bg-white/5" />;
    }

    const { title, reason, poster_path, release_year, vote_average, tmdb_id, locked, expanded } = pick;

    const content = (
        <div
            className={`group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition ${
                tmdb_id
                    ? 'hover:border-purple-300/60 hover:shadow-[0_10px_30px_rgba(124,58,237,0.2)]'
                    : 'opacity-80'
            } ${locked ? 'ring-1 ring-amber-400/70' : ''}`}
        >
            <div className="relative aspect-[2/3] w-full">
                {poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 60vw, (max-width: 1200px) 30vw, 25vw"
                        className="object-cover"
                        priority={priority}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-neutral-900 text-sm text-gray-300">
                        No artwork
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
                <div className="flex items-center justify-between text-xs text-gray-200">
                    <span className="rounded-full bg-white/10 px-3 py-1">{release_year ?? '—'}</span>
                    <div className="flex items-center gap-2">
                        {locked && <span className="text-amber-200">🔒</span>}
                        {vote_average ? <span className="text-amber-200">⭐ {vote_average.toFixed(1)}</span> : null}
                    </div>
                </div>
                <h4 className="text-lg font-semibold text-white">{title}</h4>
                {expanded && reason ? (
                    <p className="text-sm text-gray-100 leading-relaxed">{reason}</p>
                ) : reason ? (
                    <p className="text-sm text-gray-200 leading-relaxed line-clamp-2">{reason}</p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-gray-200">
                    <button
                        type="button"
                        onClick={onExplain}
                        className="rounded-full border border-white/10 px-3 py-1 hover:border-purple-300/60"
                    >
                        {expanded ? 'Hide reason' : 'Explain'}
                    </button>
                    <button
                        type="button"
                        onClick={onSwap}
                        className="rounded-full border border-white/10 px-3 py-1 hover:border-emerald-300/60"
                        disabled={swapping}
                    >
                        {swapping ? 'Swapping…' : 'Swap this one'}
                    </button>
                    <button
                        type="button"
                        onClick={onLock}
                        className={`rounded-full border px-3 py-1 ${locked ? 'border-amber-300/80 bg-amber-500/10 text-amber-100' : 'border-white/10 bg-white/5 hover:border-purple-300/60'}`}
                    >
                        {locked ? 'Unlock' : 'Lock pick'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (!tmdb_id) return content;

    return (
        <Link
            href={`/detail/movie/${tmdb_id}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
            {content}
        </Link>
    );
}

export default function CuratorResults({
    primary,
    alternatives,
    status,
    onRefine,
    activePreset,
    onEdit,
    onNewSession,
    mode = 'full',
    curatorEmoji,
    curatorName,
    loadingMessage,
    thinkingLines,
    onLock,
    onExplain,
    onSwap,
    swapTarget,
    curatorNote,
}: CuratorResultsProps) {
    const hasResults = Boolean(primary || alternatives.length);
    const note = useMemo(() => truncateNote(curatorNote), [curatorNote]);

    return (
        <div className="relative space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-purple-200">Step 4</p>
                    <h3 className="text-2xl font-semibold text-white">Curator result</h3>
                    <p className="text-sm text-gray-300">
                        Hero pick first, bold alternatives follow. Refine anytime.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {hasResults && status === 'ready' && (
                        <>
                            <button
                                type="button"
                                onClick={onEdit}
                                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-100 hover:border-purple-300/60"
                            >
                                Edit session
                            </button>
                            <button
                                type="button"
                                onClick={onNewSession}
                                className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-100 hover:border-emerald-300/60"
                            >
                                New session
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="relative min-h-[560px] overflow-hidden">
                {status === 'ready' && (
                    <div className="space-y-6">
                        {note && (
                            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/10 to-white/5 p-4 text-sm text-gray-100">
                                <p className="text-xs uppercase tracking-[0.18em] text-purple-200">
                                    {curatorEmoji} {curatorName} notes
                                </p>
                                <p className="mt-1 leading-relaxed line-clamp-2">{note}</p>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <MovieCard
                                    pick={primary}
                                    priority
                                    onLock={() => onLock('primary', 0)}
                                    onExplain={() => onExplain('primary', 0)}
                                    onSwap={() => onSwap('primary', 0)}
                                    swapping={swapTarget?.role === 'primary'}
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                    Refine
                                </p>
                                <div className="grid gap-2">
                                    {refineOptions.map(option => {
                                        const isActive = activePreset === option.preset;
                                        return (
                                            <button
                                                key={option.preset}
                                                type="button"
                                                onClick={() => onRefine(option.preset)}
                                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                                    isActive
                                                        ? 'border-purple-400/70 bg-purple-500/10 text-white'
                                                        : 'border-white/10 bg-white/5 text-gray-100 hover:border-purple-300/50'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-300">
                                    Adjust the prompt instantly—no need to restart the wizard.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                        Alternatives
                                    </span>
                                    <span className="h-px w-12 bg-white/10" />
                                </div>
                                <span className="text-xs text-gray-400">All cards are clickable for details</span>
                            </div>
                            {alternatives.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {alternatives.slice(0, 6).map((movie, idx) => (
                                        <MovieCard
                                            key={`${movie?.title ?? 'alt'}-${idx}`}
                                            pick={movie}
                                            onLock={() => onLock('alternative', idx)}
                                            onExplain={() => onExplain('alternative', idx)}
                                            onSwap={() => onSwap('alternative', idx)}
                                            swapping={swapTarget?.role === 'alternative' && swapTarget.index === idx}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="h-[220px] rounded-2xl border border-white/10 bg-white/5" />
                                    <div className="h-[220px] rounded-2xl border border-white/10 bg-white/5" />
                                    <div className="h-[220px] rounded-2xl border border-white/10 bg-white/5" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                        <p className="text-sm text-amber-200">Something went wrong. Try again.</p>
                        <button
                            type="button"
                            onClick={() => onRefine(activePreset ?? 'surprise')}
                            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white hover:border-purple-300/60"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <CuratorLoading
                        mode={mode}
                        message={loadingMessage}
                        curatorEmoji={curatorEmoji}
                        curatorName={curatorName}
                        thinkingLines={thinkingLines}
                    />
                )}
            </div>
        </div>
    );
}
