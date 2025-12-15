'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import CuratorLoading from '@/components/CuratorLoading';
import { CURATOR_PERSONAS } from '@/data/curators';
import useCuratorSession from '@/hooks/useCuratorSession';

const cardVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
};

function StepPill({ active, label, number }: { active: boolean; label: string; number: number }) {
    return (
        <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                active
                    ? 'border-purple-400/60 bg-purple-500/10 text-white'
                    : 'border-white/10 text-gray-300'
            }`}
        >
            <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    active ? 'bg-purple-500/80 text-white' : 'bg-white/10 text-gray-200'
                }`}
            >
                {number}
            </span>
            <span className="font-medium tracking-wide">{label}</span>
        </div>
    );
}

function CuratorCard({
    id,
    name,
    emoji,
    description,
    selected,
    onSelect,
    disabled,
}: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    selected: boolean;
    onSelect: (id: string) => void;
    disabled?: boolean;
}) {
    return (
        <motion.button
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(id)}
            disabled={disabled}
            className={`group relative flex h-full flex-col gap-3 rounded-2xl border p-5 text-left transition-all duration-200 ${
                selected
                    ? 'border-purple-400/60 bg-white/10 shadow-[0_10px_40px_rgba(124,58,237,0.25)]'
                    : 'border-white/5 bg-white/5 hover:border-purple-300/50 hover:bg-white/10'
            } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>
                        {emoji}
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">Curator</p>
                        <h3 className="text-lg font-semibold text-white">{name}</h3>
                    </div>
                </div>
                {selected && (
                    <span className="rounded-full bg-purple-500/80 px-3 py-1 text-xs font-semibold text-white">Selected</span>
                )}
            </div>
            <p className="text-sm text-gray-200/90 leading-relaxed">{description}</p>
            <div className="flex items-center gap-2 text-xs text-purple-200">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Personality-forward recommendations</span>
            </div>
        </motion.button>
    );
}

function ContextOption({
    label,
    description,
    active,
    onClick,
    disabled,
}: {
    label: string;
    description?: string;
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <motion.button
            variants={cardVariants}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            disabled={disabled}
            className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
                active
                    ? 'border-purple-400/60 bg-white/10 shadow-[0_10px_30px_rgba(124,58,237,0.2)] text-white'
                    : 'border-white/5 bg-white/5 text-gray-200 hover:border-purple-300/40 hover:text-white'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
            <span className="text-base font-semibold">{label}</span>
            {description && <span className="text-sm text-gray-300 leading-relaxed">{description}</span>}
        </motion.button>
    );
}

function TogglePill({
    label,
    description,
    active,
    onToggle,
    disabled,
}: {
    label: string;
    description: string;
    active: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={`flex flex-1 min-w-[180px] items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                active
                    ? 'border-emerald-400/60 bg-emerald-500/10 text-white'
                    : 'border-white/5 bg-white/5 text-gray-200 hover:border-emerald-300/50'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
            <div className={`mt-1 h-5 w-5 rounded-full border ${active ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/20 bg-white/5'}`} />
            <div className="space-y-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
            </div>
        </button>
    );
}

function SkeletonCard({ priority }: { priority?: boolean }) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${
                priority ? 'min-h-[340px]' : 'min-h-[260px]'
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
            <div className="flex h-full flex-col justify-end p-5">
                <div className="mb-2 h-6 w-3/5 rounded-full bg-white/10" />
                <div className="h-4 w-1/3 rounded-full bg-white/5" />
            </div>
        </div>
    );
}

function CuratedMovieCard({
    title,
    reason,
    poster_path,
    release_year,
    vote_average,
    priority,
    tmdb_id,
}: {
    title: string;
    reason?: string;
    poster_path?: string;
    release_year?: number;
    vote_average?: number;
    priority?: boolean;
    tmdb_id?: number;
}) {
    const card = (
        <div
            className={`group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${
                tmdb_id ? 'hover:border-purple-300/60 hover:shadow-[0_10px_30px_rgba(124,58,237,0.2)]' : 'opacity-80'
            }`}
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
                    <div className="flex h-full items-center justify-center bg-neutral-800 text-sm text-gray-300">
                        No artwork
                    </div>
                )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80" />
            <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-200">
                    <span className="rounded-full bg-white/10 px-3 py-1">{release_year ?? '—'}</span>
                    {vote_average ? <span className="text-amber-200">⭐ {vote_average.toFixed(1)}</span> : null}
                </div>
                <h4 className="text-lg font-semibold text-white">{title}</h4>
                {reason && <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">{reason}</p>}
            </div>
        </div>
    );

    if (tmdb_id) {
        return (
            <Link href={`/detail/movie/${tmdb_id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
                {card}
            </Link>
        );
    }

    return <div className="cursor-not-allowed" aria-disabled>{card}</div>;
}

export default function CuratorPage() {
    const [showSetup, setShowSetup] = useState(true);
    const {
        step,
        selectedCurator,
        selectedCuratorId,
        curatedSelections,
        contextSelections,
        toggleSelections,
        handleSelectCurator,
        handleSelectContext,
        handleToggle,
        resetContext,
        goBackToCurator,
        goToSummary,
        goToContext,
        startSession,
        canProceedToSummary,
        canStartSession,
        result,
        loading,
        loadingMessage,
        error,
        contextGroups,
        contextToggles,
        resultsRef,
    } = useCuratorSession();

    const primaryPick = result?.primary;
    const alternatives = result?.alternatives ?? [];

    const hasResults = Boolean(primaryPick || alternatives.length > 0);
    const showResults = hasResults || loading;
    const disableInteractions = loading;

    useEffect(() => {
        if (hasResults && !loading) {
            setShowSetup(false);
        }
    }, [hasResults, loading]);

    const handleEditSelection = () => {
        setShowSetup(true);
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        goToContext();
    };

    const loadingMessageText = useMemo(
        () => loadingMessage ?? 'Curator is crafting a lineup...',
        [loadingMessage],
    );

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-[72px] text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-10%] top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-[-6%] top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-[-10%] h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-12 space-y-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-purple-200">AI Curator Session</p>
                        <h1 className="text-3xl font-semibold md:text-4xl">
                            Sit down with a film mind—not an algorithm
                        </h1>
                        <p className="text-base text-gray-200 md:max-w-2xl">
                            Choose an AI curator persona, set a quick context, and let them craft a focused session with a
                            primary pick and bold alternatives.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-200">
                        <Link
                            href="/discover-ai"
                            className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50 hover:text-white"
                        >
                            Back to Discover AI
                        </Link>
                        <span className="rounded-full border border-white/10 px-4 py-2 text-gray-300/80">
                            Free preview of premium session design
                        </span>
                    </div>
                </div>

                {(showSetup || !hasResults || loading) && (
                    <div className={`space-y-6 ${disableInteractions ? 'pointer-events-none opacity-80' : ''}`}>
                        <div className="flex flex-wrap gap-3">
                            <StepPill active={step === 1} label="Choose curator" number={1} />
                            <StepPill active={step === 2} label="Set the context" number={2} />
                            <StepPill active={step === 3} label="Confirm & start" number={3} />
                        </div>

                        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step-1"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-purple-200/80">Step 1</p>
                                            <h2 className="text-2xl font-semibold text-white">Choose your curator</h2>
                                            <p className="text-sm text-gray-300">
                                                Each persona brings a distinct tone and curation lens. Pick one to guide the session.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {CURATOR_PERSONAS.map(persona => (
                                            <CuratorCard
                                                key={persona.id}
                                                id={persona.id}
                                                name={persona.name}
                                                emoji={persona.emoji}
                                                description={persona.description}
                                                selected={selectedCuratorId === persona.id}
                                                onSelect={handleSelectCurator}
                                                disabled={disableInteractions}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => selectedCuratorId && goToContext()}
                                            disabled={!selectedCuratorId || disableInteractions}
                                            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                                selectedCuratorId && !disableInteractions
                                                    ? 'bg-purple-500 text-white hover:bg-purple-400'
                                                    : 'bg-white/5 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            Continue
                                        </button>
                                        <p className="text-sm text-gray-300">
                                            Personas are free to try. We designed this flow to scale into saved sessions later.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                                {step === 2 && (
                                    <motion.div
                                        key="step-2"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-8"
                                    >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-purple-200/80">Step 2</p>
                                            <h2 className="text-2xl font-semibold text-white">Set the context</h2>
                                            <p className="text-sm text-gray-300">
                                                Quick signals help the curator avoid generic answers and go intentional.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-200">
                                            <button
                                                type="button"
                                                onClick={resetContext}
                                                className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                            >
                                                Shuffle context
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goBackToCurator}
                                                className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                            >
                                                Choose another curator
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        {contextGroups.map(group => {
                                            const selectedOption = contextSelections[group.id];
                                            return (
                                                <div key={group.id} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                                                {group.title}
                                                            </p>
                                                            <p className="text-sm text-gray-300">{group.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-3">
                                                        {group.options.map(option => (
                                                            <ContextOption
                                                                key={option.id}
                                                                label={option.label}
                                                                description={option.description}
                                                                active={selectedOption?.id === option.id}
                                                                onClick={() => handleSelectContext(group.id, option)}
                                                                disabled={disableInteractions}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">
                                                Optional modifiers
                                            </span>
                                            <span className="h-px w-12 bg-white/10" />
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {contextToggles.map(toggle => (
                                                <TogglePill
                                                    key={toggle.id}
                                                    label={toggle.label}
                                                    description={toggle.description}
                                                    active={toggleSelections[toggle.id]}
                                                    onToggle={() => handleToggle(toggle.id)}
                                                    disabled={disableInteractions}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={goToSummary}
                                            disabled={!canProceedToSummary || disableInteractions}
                                            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                                canProceedToSummary && !disableInteractions
                                                    ? 'bg-purple-500 text-white hover:bg-purple-400'
                                                    : 'bg-white/5 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            Review session
                                        </button>
                                        {!canProceedToSummary && (
                                            <p className="text-sm text-amber-300">
                                                Pick one option for each category to continue.
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step-3"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm text-purple-200/80">Step 3</p>
                                            <h2 className="text-2xl font-semibold text-white">Confirmation</h2>
                                            <p className="text-sm text-gray-300">Make sure the tone and context feel right.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm text-gray-200">
                                            <button
                                                type="button"
                                                onClick={goToContext}
                                                className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                                disabled={disableInteractions}
                                            >
                                                Adjust context
                                            </button>
                                            <button
                                                type="button"
                                                onClick={goBackToCurator}
                                                className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                                disabled={disableInteractions}
                                            >
                                                Switch curator
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">Curator</p>
                                            <h3 className="text-xl font-semibold">{selectedCurator?.emoji} {selectedCurator?.name}</h3>
                                            <p className="text-sm text-gray-300">{selectedCurator?.description}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">Context</p>
                                            <ul className="mt-2 space-y-2 text-sm text-gray-200">
                                                {curatedSelections.map(item => (
                                                    <li key={`${item.category}-${item.label}`} className="flex items-center gap-2">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                                        <span>
                                                            {item.label} <span className="text-gray-400">({item.category})</span>
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-white/5 to-black/40 p-4">
                                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">Session vibe</p>
                                            <p className="mt-2 text-sm text-gray-200">
                                                Expect a lead pick and a handful of bold alternates. No safe lists, no filler.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={startSession}
                                            disabled={!canStartSession || loading}
                                            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                                                canStartSession
                                                    ? 'bg-purple-500 text-white hover:bg-purple-400'
                                                    : 'bg-white/5 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {loading ? 'Curator is thinking...' : 'Start session'}
                                        </button>
                                        <p className="text-sm text-gray-300">
                                            Future upgrades: save sessions, ask follow-ups, or pull a second opinion.
                                        </p>
                                    </div>
                                    {error && <p className="text-sm text-amber-300">{error}</p>}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {showResults ? (
                    <div
                        ref={resultsRef}
                        className="relative space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-purple-200">Step 4</p>
                                <h3 className="text-2xl font-semibold text-white">Curator result</h3>
                                <p className="text-sm text-gray-300">
                                    You get a lead pick plus alternatives with personality-driven notes.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {loading && (
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-purple-100">Live</span>
                                )}
                                {hasResults && !loading && (
                                    <button
                                        type="button"
                                        onClick={handleEditSelection}
                                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-100 hover:border-purple-300/60"
                                    >
                                        Edit selection
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="relative min-h-[520px]">
                            {loading && (
                                <AnimatePresence>
                                    <CuratorLoading mode={hasResults ? 'overlay' : 'full'} message={loadingMessageText} />
                                </AnimatePresence>
                            )}
                            {!result && !loading && (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-300">
                                    <SkeletonCard priority />
                                    <p className="text-sm">Kick off a session to see a curator-led lineup.</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6">
                                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-white/5 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                            {result.curator.emoji} {result.curator.name} says
                                        </p>
                                        <p className="mt-2 text-lg text-white leading-relaxed">
                                            {result.curator_note || 'Here is what I would line up for you tonight.'}
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            {primaryPick ? (
                                                <CuratedMovieCard
                                                    title={primaryPick.title}
                                                    reason={primaryPick.reason}
                                                    poster_path={primaryPick.poster_path}
                                                    release_year={primaryPick.release_year}
                                                    vote_average={primaryPick.vote_average}
                                                    tmdb_id={primaryPick.tmdb_id}
                                                    priority
                                                />
                                            ) : (
                                                <SkeletonCard priority />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">Session actions</p>
                                            <button
                                                type="button"
                                                onClick={goBackToCurator}
                                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:border-purple-300/50"
                                            >
                                                Try another curator
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetContext}
                                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white hover:border-purple-300/50"
                                            >
                                                Shuffle context
                                            </button>
                                            <p className="text-sm text-gray-300">
                                                Future add-ons: ask for justification, save to a watchlist, or request a second opinion.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-[0.18em] text-purple-200/80">Alternatives</span>
                                            <span className="h-px w-12 bg-white/10" />
                                        </div>
                                        {alternatives.length > 0 ? (
                                            <div className="grid gap-4 md:grid-cols-3">
                                                {alternatives.slice(0, 6).map(movie => (
                                                    <CuratedMovieCard
                                                        key={`${movie.title}-${movie.release_year ?? 'n/a'}`}
                                                        title={movie.title}
                                                        reason={movie.reason}
                                                        poster_path={movie.poster_path}
                                                        release_year={movie.release_year}
                                                        vote_average={movie.vote_average}
                                                        tmdb_id={movie.tmdb_id}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <SkeletonCard />
                                                <SkeletonCard />
                                                <SkeletonCard />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div ref={resultsRef} className="min-h-[520px]" aria-hidden />
                )}
            </div>
        </main>
    );
}
