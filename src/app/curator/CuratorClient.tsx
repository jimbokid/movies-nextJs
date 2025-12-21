'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CuratorResults from '@/components/curator/CuratorResults';
import CuratorSessionsDrawer from '@/components/curator/CuratorSessionsDrawer';
import useCuratorSession from '@/hooks/useCuratorSession';
import { CURATOR_PERSONAS } from '@/data/curators';
import { CuratorId } from '@/types/discoverAi';
import { RefineMode } from '@/types/curator';

const cardVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
};

function StepPill({
    active,
    label,
    number,
    locked,
}: {
    active: boolean;
    label: string;
    number: number;
    locked?: boolean;
}) {
    return (
        <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                active
                    ? 'border-purple-400/60 bg-purple-500/10 text-white'
                    : 'border-white/10 text-gray-300'
            } ${locked ? 'opacity-60' : ''}`}
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
    id: CuratorId;
    name: string;
    emoji: string;
    description: string;
    selected: boolean;
    onSelect: (id: CuratorId) => void;
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
                        <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                            Curator
                        </p>
                        <h3 className="text-lg font-semibold text-white">{name}</h3>
                    </div>
                </div>
                {selected && (
                    <span className="rounded-full bg-purple-500/80 px-3 py-1 text-xs font-semibold text-white">
                        Selected
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-200/90 leading-relaxed">{description}</p>
            <div className="flex items-center gap-2 text-xs text-purple-200">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Persona-first recommendations</span>
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
            {description && (
                <span className="text-sm text-gray-300 leading-relaxed">{description}</span>
            )}
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
            <div
                className={`mt-1 h-5 w-5 rounded-full border ${active ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/20 bg-white/5'}`}
            />
            <div className="space-y-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
            </div>
        </button>
    );
}

export default function CuratorClient() {
    const {
        step,
        setStep,
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
        newSession,
        canProceedToContext,
        canProceedToSummary,
        canStartSession,
        result,
        loading,
        loadingMessage,
        status,
        error,
        contextGroups,
        contextToggles,
        resultsRef,
        thinkingLines,
        refinePreset,
        lineupPrimary,
        lineupAlternatives,
        sessions,
        openHistory,
        closeHistory,
        historyOpen,
        loadSessionFromHistory,
        startNewFromHistory,
        moodDrift,
        setMoodDrift,
    } = useCuratorSession();
    const searchParams = useSearchParams();
    const autostartTriggeredRef = useRef(false);
    const [deepLinkContext, setDeepLinkContext] = useState<{
        from?: string;
        movieId?: string;
        movieTitle?: string | null;
        query?: string;
        curatorId?: CuratorId | null;
        refine?: RefineMode | null;
        autostart?: boolean;
    } | null>(null);

    const contextSummary = useMemo(
        () =>
            curatedSelections.length
                ? curatedSelections.map(item => `${item.label}`).join(' • ')
                : 'Light context recommended',
        [curatedSelections],
    );

    const topCollapsed = status !== 'idle';
    const showResults = status !== 'idle';
    const deepLinkAutostart = deepLinkContext?.autostart;
    const deepLinkCuratorId = deepLinkContext?.curatorId;
    const deepLinkRefine = deepLinkContext?.refine;
    const deepLinkLabel = useMemo(() => {
        if (!deepLinkContext) return null;
        if (deepLinkContext.movieTitle) return `Loaded with ${deepLinkContext.movieTitle}`;
        if (deepLinkContext.movieId) return `Loaded with movie ${deepLinkContext.movieId}`;
        if (deepLinkContext.query) return `Loaded with search “${deepLinkContext.query}”`;
        if (deepLinkContext.from) return `Opened from ${deepLinkContext.from}`;
        return null;
    }, [deepLinkContext]);

    useEffect(() => {
        const from = searchParams.get('from') ?? undefined;
        const movieId = searchParams.get('movieId') ?? undefined;
        const queryParam = searchParams.get('q') ?? undefined;
        const curatorParam = searchParams.get('curator');
        const refineParam = searchParams.get('refine');
        const autostart = searchParams.get('autostart') === '1';
        const movieTitle = searchParams.get('movieTitle');

        const validCurator = CURATOR_PERSONAS.some(persona => persona.id === curatorParam)
            ? (curatorParam as CuratorId)
            : null;
        const validRefine: RefineMode | null =
            refineParam && ['more_dark', 'more_fun', 'more_cozy', 'more_weird', 'more_action'].includes(refineParam)
                ? (refineParam as RefineMode)
                : null;

        const prioritizedMovieId = movieId ?? undefined;
        const prioritizedQuery = movieId ? undefined : queryParam ?? undefined;

        setDeepLinkContext({
            from,
            movieId: prioritizedMovieId,
            movieTitle: movieTitle ?? null,
            query: prioritizedQuery,
            curatorId: validCurator,
            refine: validRefine,
            autostart,
        });

        if (validCurator) {
            handleSelectCurator(validCurator);
        }

        if (validRefine) {
            setRefinePreset(validRefine);
        }

        if (autostart) {
            setStep(prev => (prev < 3 ? 3 : prev));
        }
    }, [handleSelectCurator, searchParams, setRefinePreset, setStep]);

    useEffect(() => {
        if (!deepLinkAutostart || selectedCuratorId) return;
        const fallbackCurator = deepLinkCuratorId ?? CURATOR_PERSONAS[0]?.id;
        if (fallbackCurator) {
            handleSelectCurator(fallbackCurator as CuratorId);
        }
    }, [deepLinkAutostart, deepLinkCuratorId, handleSelectCurator, selectedCuratorId]);

    useEffect(() => {
        if (!deepLinkAutostart || autostartTriggeredRef.current) return;
        if (!selectedCuratorId) return;

        if (!canStartSession) {
            setStep(prev => (prev < 3 ? 3 : prev));
            return;
        }

        autostartTriggeredRef.current = true;
        startSession(deepLinkRefine ?? undefined);
    }, [canStartSession, deepLinkAutostart, deepLinkRefine, selectedCuratorId, setStep, startSession]);

    useEffect(() => {
        if (!deepLinkContext) return;
        // TODO: wire up analytics event `curator_open` with deepLinkContext payload when analytics is available.
    }, [deepLinkContext]);

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950 pt-18 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-10%] top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-[-6%] top-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute left-1/3 bottom-[-10%] h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 py-10 space-y-10">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-purple-200">
                                AI Curator Session
                            </p>
                            <h1 className="text-3xl font-semibold md:text-4xl">
                                Sit down with a film mind—not an algorithm
                            </h1>
                            <p className="text-base text-gray-200 md:max-w-2xl">
                                Choose a persona, add quick context, and get a hero pick with bold alternatives.
                            </p>
                            {deepLinkLabel && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/50 bg-purple-500/10 px-3 py-1 text-xs text-purple-100">
                                    <span aria-hidden>🎯</span>
                                    <span>{deepLinkLabel}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-200">
                            <Link
                                href="/discover-ai"
                                className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50 hover:text-white"
                        >
                            Back to Discover AI
                        </Link>
                        <button
                            type="button"
                            onClick={openHistory}
                            className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50 hover:text-white"
                        >
                            Recent sessions
                        </button>
                    </div>
                </div>

                {!topCollapsed && (
                    <div
                        className={`space-y-6 ${loading ? 'pointer-events-none opacity-80' : ''}`}
                    >
                        <div className="flex flex-wrap gap-3">
                            <StepPill active={step === 1} locked={false} label="Choose curator" number={1} />
                            <StepPill active={step === 2} locked={!canProceedToContext} label="Set the context" number={2} />
                            <StepPill active={step === 3} locked={!canProceedToSummary} label="Confirm & start" number={3} />
                            {showResults && (
                                <StepPill active={status === 'loading' || status === 'ready'} locked={false} label="Results" number={4} />
                            )}
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
                                                <h2 className="text-2xl font-semibold text-white">
                                                    Choose your curator
                                                </h2>
                                                <p className="text-sm text-gray-300">
                                                    Required before you can start. Each persona steers the vibe.
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
                                                    disabled={loading}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => selectedCuratorId && canProceedToContext && goToContext()}
                                                disabled={!selectedCuratorId || !canProceedToContext || loading}
                                                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                                    selectedCuratorId && !loading
                                                        ? 'bg-purple-500 text-white hover:bg-purple-400'
                                                        : 'bg-white/5 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                Continue
                                            </button>
                                            <p className="text-sm text-gray-300">
                                                Personas are required to move forward.
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
                                                <h2 className="text-2xl font-semibold text-white">
                                                    Set the context (optional, but recommended)
                                                </h2>
                                                <p className="text-sm text-gray-300">
                                                    Quick signals help the curator avoid generic answers.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-sm text-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={resetContext}
                                                    className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                                >
                                                    Clear context
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={goBackToCurator}
                                                    className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                                >
                                                    Switch curator
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
                                                                <p className="text-sm text-gray-300">
                                                                    {group.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="grid gap-3">
                                                            {group.options.map(option => (
                                                                <ContextOption
                                                                    key={option.id}
                                                                    label={option.label}
                                                                    description={option.description}
                                                                    active={selectedOption?.id === option.id}
                                                                    onClick={() =>
                                                                        handleSelectContext(group.id, option)
                                                                    }
                                                                    disabled={loading}
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
                                                        disabled={loading}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={goToSummary}
                                                disabled={!canProceedToSummary || loading}
                                                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                                    canProceedToSummary && !loading
                                                        ? 'bg-purple-500 text-white hover:bg-purple-400'
                                                        : 'bg-white/5 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                Review session
                                            </button>
                                            <p className="text-sm text-gray-300">
                                                Context is optional—pick at least one if you want more precision.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {step >= 3 && (
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
                                                <h2 className="text-2xl font-semibold text-white">
                                                    Confirmation
                                                </h2>
                                                <p className="text-sm text-gray-300">
                                                    Required to start. Make sure the tone feels right.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-sm text-gray-200">
                                                <button
                                                    type="button"
                                                    onClick={goToContext}
                                                    className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                                    disabled={loading}
                                                >
                                                    Adjust context
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={goBackToCurator}
                                                    className="rounded-full border border-white/10 px-4 py-2 hover:border-purple-300/50"
                                                    disabled={loading}
                                                >
                                                    Switch curator
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                                    Curator
                                                </p>
                                                <h3 className="text-xl font-semibold">
                                                    {selectedCurator?.emoji} {selectedCurator?.name}
                                                </h3>
                                                <p className="text-sm text-gray-300">
                                                    {selectedCurator?.description}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                                    Context
                                                </p>
                                                <p className="mt-2 text-sm text-gray-200 leading-relaxed">
                                                    {contextSummary}
                                                </p>
                                            </div>
                                        <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-white/5 to-black/40 p-4">
                                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                                Mood drift controls
                                            </p>
                                            <div className="grid gap-3">
                                                <div className="flex items-center justify-between text-sm text-gray-200">
                                                    <span>Fun ↔ Serious</span>
                                                    <div className="flex gap-1">
                                                        {[-1, 0, 1].map(val => (
                                                            <button
                                                                key={`fun-${val}`}
                                                                type="button"
                                                                onClick={() => setMoodDrift(prev => ({ ...prev, funSerious: val }))}
                                                                className={`h-8 w-8 rounded-full border ${
                                                                    moodDrift.funSerious === val
                                                                        ? 'border-purple-400 bg-purple-500/20'
                                                                        : 'border-white/10 bg-white/5'
                                                                }`}
                                                            >
                                                                {val === -1 ? '←' : val === 1 ? '→' : '•'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-200">
                                                    <span>Mainstream ↔ Indie</span>
                                                    <div className="flex gap-1">
                                                        {[-1, 0, 1].map(val => (
                                                            <button
                                                                key={`main-${val}`}
                                                                type="button"
                                                                onClick={() => setMoodDrift(prev => ({ ...prev, mainstreamIndie: val }))}
                                                                className={`h-8 w-8 rounded-full border ${
                                                                    moodDrift.mainstreamIndie === val
                                                                        ? 'border-purple-400 bg-purple-500/20'
                                                                        : 'border-white/10 bg-white/5'
                                                                }`}
                                                            >
                                                                {val === -1 ? '←' : val === 1 ? '→' : '•'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm text-gray-200">
                                                    <span>Safe ↔ Bold</span>
                                                    <div className="flex gap-1">
                                                        {[-1, 0, 1].map(val => (
                                                            <button
                                                                key={`bold-${val}`}
                                                                type="button"
                                                                onClick={() => setMoodDrift(prev => ({ ...prev, safeBold: val }))}
                                                                className={`h-8 w-8 rounded-full border ${
                                                                    moodDrift.safeBold === val
                                                                        ? 'border-purple-400 bg-purple-500/20'
                                                                        : 'border-white/10 bg-white/5'
                                                                }`}
                                                            >
                                                                {val === -1 ? '←' : val === 1 ? '→' : '•'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                Nudge the curator without restarting the wizard. Default is balanced.
                                            </p>
                                        </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => startSession(undefined)}
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
                                                Triggers API and moves you to results.
                                            </p>
                                        </div>
                                        {error && <p className="text-sm text-amber-300">{error}</p>}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {topCollapsed && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{result?.curator.emoji ?? selectedCurator?.emoji ?? '🎬'}</span>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                    {result?.curator.name ?? selectedCurator?.name ?? 'Curator'} session active
                                </p>
                                <p className="text-sm text-gray-200 line-clamp-1">{contextSummary}</p>
                            </div>
                        </div>
                        <StepPill active label="Results" number={4} />
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={goToContext}
                                className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-100 hover:border-purple-300/60"
                            >
                                Edit session
                            </button>
                            <button
                                type="button"
                                onClick={newSession}
                                className="rounded-full border border-white/10 px-3 py-2 text-xs text-gray-100 hover:border-emerald-300/60"
                            >
                                New session
                            </button>
                        </div>
                    </div>
                )}

                <div ref={resultsRef}>
                    {showResults && (
                        <CuratorResults
                            primary={lineupPrimary}
                            alternatives={lineupAlternatives}
                            status={status}
                            onRefine={startSession}
                            activePreset={refinePreset}
                            onEdit={goToContext}
                            onNewSession={newSession}
                            curatorEmoji={selectedCurator?.emoji}
                            curatorName={selectedCurator?.name}
                            loadingMessage={loadingMessage}
                            thinkingLines={thinkingLines}
                            curatorNote={result?.curator_note ?? null}
                        />
                    )}
                </div>
            </div>

            <CuratorSessionsDrawer
                open={historyOpen}
                sessions={sessions}
                onClose={closeHistory}
                onOpenSession={loadSessionFromHistory}
                onStartFromSession={startNewFromHistory}
            />
        </main>
    );
}
