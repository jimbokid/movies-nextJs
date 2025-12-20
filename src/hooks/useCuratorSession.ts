'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CURATOR_PERSONAS } from '@/data/curators';
import { CONTEXT_GROUPS, CONTEXT_TOGGLES } from '@/data/curatorContext';
import { CURATOR_THINKING_LINES } from '@/constants/curatorThinking';
import {
    CuratorContextOption,
    CuratorRecommendationResponse,
    CuratorSelection,
    CuratorSession,
    RefinePreset,
} from '@/types/curator';
import { AiRecommendedMovie, CuratorPersona, CuratorId } from '@/types/discoverAi';
import { readLocalStorage, writeLocalStorage } from '@/utils/storage';

const AI_CURATOR_ENDPOINT = '/api/ai-curator';
const SESSION_STORAGE_KEY = 'cineview.curator.sessions.v1';
const PREVIOUS_TITLES_CAP = 20;
type SessionStatus = 'idle' | 'loading' | 'ready' | 'error';
type CuratedPick = (AiRecommendedMovie & { locked?: boolean; expanded?: boolean }) | null;

export type CuratorStep = 1 | 2 | 3 | 4;

type ContextSelectionState = Record<string, CuratorContextOption | null>;
type ToggleSelectionState = Record<string, boolean>;

const buildDefaultContext = (): ContextSelectionState =>
    Object.fromEntries(CONTEXT_GROUPS.map(group => [group.id, null]));

const buildDefaultToggles = (): ToggleSelectionState =>
    Object.fromEntries(CONTEXT_TOGGLES.map(toggle => [toggle.id, false]));

const buildSelectedBadges = (
    contextSelections: ContextSelectionState,
    toggleSelections: ToggleSelectionState,
): CuratorSelection[] => {
    const selections: CuratorSelection[] = [];
    Object.values(contextSelections)
        .filter(Boolean)
        .forEach(item => {
            selections.push({ label: item!.label, category: item!.category });
        });
    CONTEXT_TOGGLES.forEach(toggle => {
        if (toggleSelections[toggle.id]) {
            selections.push({ label: toggle.label, category: toggle.category });
        }
    });
    return selections;
};

const getPersonaById = (id: CuratorId | null): CuratorPersona | null =>
    id ? CURATOR_PERSONAS.find(curator => curator.id === id) ?? null : null;

export function useCuratorSession() {
    const [step, setStep] = useState<CuratorStep>(1);
    const [selectedCuratorId, setSelectedCuratorId] = useState<CuratorId | null>(null);
    const [contextSelections, setContextSelections] = useState<ContextSelectionState>(() =>
        buildDefaultContext(),
    );
    const [toggleSelections, setToggleSelections] = useState<ToggleSelectionState>(() =>
        buildDefaultToggles(),
    );
    const [result, setResult] = useState<CuratorRecommendationResponse | null>(null);
    const [refinePreset, setRefinePreset] = useState<RefinePreset | undefined>(undefined);
    const [lineupPrimary, setLineupPrimary] = useState<CuratedPick | null>(null);
    const [lineupAlternatives, setLineupAlternatives] = useState<CuratedPick[]>([]);
    const [sessions, setSessions] = useState<CuratorSession[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingLineIndex, setLoadingLineIndex] = useState(0);
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [swapTarget, setSwapTarget] = useState<{ role: 'primary' | 'alternative'; index?: number } | null>(null);
    const [rejectedTitles, setRejectedTitles] = useState<string[]>([]);
    const [swappedTitles, setSwappedTitles] = useState<string[]>([]);
    const [moodDrift, setMoodDrift] = useState<{ funSerious: number; mainstreamIndie: number; safeBold: number }>({
        funSerious: 0,
        mainstreamIndie: 0,
        safeBold: 0,
    });
    const [historyOpen, setHistoryOpen] = useState(false);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const stored = readLocalStorage<CuratorSession[]>(SESSION_STORAGE_KEY, []);
        if (stored.length) {
            setSessions(stored);
            const last = stored[0];
            setSelectedCuratorId(last.curatorId);
            setStep(2);
        }
    }, []);

    useEffect(() => {
        writeLocalStorage(SESSION_STORAGE_KEY, sessions.slice(0, 10));
    }, [sessions]);

    useEffect(() => {
        if (!loading) return undefined;

        const personaLines =
            (selectedCuratorId && CURATOR_THINKING_LINES[selectedCuratorId]) ??
            Object.values(CURATOR_THINKING_LINES).flat();
        const interval = setInterval(() => {
            setLoadingLineIndex(prev => (prev + 1) % personaLines.length);
        }, 1900);

        return () => clearInterval(interval);
    }, [loading, selectedCuratorId]);

    useEffect(() => {
        if (status === 'ready' && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [status]);

    const selectedCurator = useMemo(() => getPersonaById(selectedCuratorId), [selectedCuratorId]);

    const curatedSelections = useMemo<CuratorSelection[]>(() => {
        const base: CuratorSelection[] = Object.values(contextSelections)
            .filter(Boolean)
            .map(item => ({ label: item!.label, category: item!.category }));

        CONTEXT_TOGGLES.forEach(toggle => {
            if (toggleSelections[toggle.id]) {
                base.push({ label: toggle.label, category: toggle.category });
            }
        });

        return base;
    }, [contextSelections, toggleSelections]);

    const canProceedToContext = Boolean(selectedCurator);
    const canProceedToSummary = Boolean(selectedCurator);
    const canStartSession = step >= 3 && Boolean(selectedCurator);

    const buildPreviousTitles = useCallback(() => {
        const titles = new Set<string>();
        sessions.forEach(session => {
            const { primary, alternatives } = session.result;
            if (primary?.title) titles.add(primary.title);
            alternatives.forEach(item => item.title && titles.add(item.title));
        });
        return Array.from(titles).slice(-PREVIOUS_TITLES_CAP);
    }, [sessions]);

    const resetCuratorResults = useCallback(
        (opts?: { preserveRefine?: boolean }) => {
            setResult(null);
            setStatus('idle');
            setLineupPrimary(null);
            setLineupAlternatives([]);
            setSwapTarget(null);
            setRejectedTitles([]);
            setSwappedTitles([]);
            if (!opts?.preserveRefine) {
                setRefinePreset(undefined);
            }
        },
        [],
    );

    const handleSelectCurator = (curatorId: CuratorId) => {
        setSelectedCuratorId(curatorId);
        setError(null);
        if (step === 1) {
            setStep(2);
        }
    };

    const handleSelectContext = (groupId: string, option: CuratorContextOption) => {
        setContextSelections(prev => ({ ...prev, [groupId]: option }));
        resetCuratorResults();
        setError(null);
    };

    const handleToggle = (toggleId: string) => {
        setToggleSelections(prev => ({ ...prev, [toggleId]: !prev[toggleId] }));
        resetCuratorResults();
        setError(null);
    };

    const resetContext = useCallback(() => {
        setContextSelections(buildDefaultContext());
        setToggleSelections(buildDefaultToggles());
        resetCuratorResults();
        setError(null);
        setStep(selectedCuratorId ? 2 : 1);
    }, [resetCuratorResults, selectedCuratorId]);

    const toCuratedPick = (movie: AiRecommendedMovie | null, locked = false): CuratedPick =>
        movie ? { ...movie, locked, expanded: false } : null;

    const applyFreshResult = useCallback(
        (data: CuratorRecommendationResponse) => {
            setResult(data);
            const primaryPick = toCuratedPick(data.primary);
            const altPicks = data.alternatives.map(item => toCuratedPick(item)).filter(Boolean) as CuratedPick[];
            setLineupPrimary(primaryPick);
            setLineupAlternatives(altPicks.slice(0, 6));
        },
        [],
    );

    const mergeResultRespectingLocks = useCallback(
        (data: CuratorRecommendationResponse) => {
            setResult(data);
            const incomingPrimary = toCuratedPick(data.primary);
            const incomingAlts = data.alternatives.map(item => toCuratedPick(item)).filter(Boolean) as CuratedPick[];
            const lockedPrimary = lineupPrimary?.locked ? lineupPrimary : null;
            const primaryPick = lockedPrimary ?? incomingPrimary;

            const lockedAlts = lineupAlternatives.filter(pick => pick?.locked);
            const lockedTitles = lockedAlts
                .map(item => item?.title)
                .filter(Boolean) as string[];
            const seen = new Set<string>([
                ...(primaryPick?.title ? [primaryPick.title] : []),
                ...lockedTitles,
            ]);

            const mergedAlts: CuratedPick[] = [...lockedAlts];
            incomingAlts.forEach(item => {
                if (!item?.title) return;
                const key = item.title;
                if (seen.has(key)) return;
                mergedAlts.push(item);
                seen.add(key);
            });

            setLineupPrimary(primaryPick ?? null);
            setLineupAlternatives(mergedAlts.slice(0, 6));
        },
        [lineupAlternatives, lineupPrimary],
    );

    const cancelInFlight = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
    };

    const collectCurrentTitles = () => {
        const titles: string[] = [];
        if (lineupPrimary?.title) titles.push(lineupPrimary.title);
        lineupAlternatives.forEach(item => item?.title && titles.push(item.title));
        return titles;
    };

    const startSession = useCallback(
        async (preset?: RefinePreset) => {
            if (!selectedCurator || !canStartSession) return;

            cancelInFlight();
            const controller = new AbortController();
            controllerRef.current = controller;
            const usePreset = preset ?? refinePreset;

            try {
                resetCuratorResults({ preserveRefine: true });
                setLoading(true);
                setStatus('loading');
                setError(null);
                setRefinePreset(usePreset);
                setStep(4);

                const response = await fetch(AI_CURATOR_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        curatorId: selectedCurator.id,
                        selected: curatedSelections,
                        refinePreset: usePreset,
                        previousTitles: buildPreviousTitles(),
                        lockedTitles: collectCurrentTitles(),
                        rejectedTitles,
                        swappedTitles,
                        mode: 'full',
                        moodDrift,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message ?? 'Unable to start curator session.');
                }

                const data: CuratorRecommendationResponse = await response.json();
                if (lineupPrimary?.locked || lineupAlternatives.some(item => item?.locked)) {
                    mergeResultRespectingLocks(data);
                } else {
                    applyFreshResult(data);
                }
                setStatus('ready');

                setSessions(prev => {
                    const newSession: CuratorSession = {
                        id: crypto.randomUUID(),
                        createdAt: Date.now(),
                        curatorId: selectedCurator.id,
                        selectedBadges: buildSelectedBadges(contextSelections, toggleSelections),
                        context: { ...contextSelections, toggles: toggleSelections },
                        refinePreset: usePreset,
                        result: data,
                    };

                    const next = [newSession, ...prev].slice(0, 10);
                    return next;
                });
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
                setStatus('error');
                setError(err instanceof Error ? err.message : 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        },
        [
            applyFreshResult,
            buildPreviousTitles,
            canStartSession,
            contextSelections,
            curatedSelections,
            moodDrift,
            refinePreset,
            rejectedTitles,
            resetCuratorResults,
            selectedCurator,
            toggleSelections,
            swappedTitles,
        ],
    );

    const goBackToCurator = () => {
        cancelInFlight();
        setStep(1);
        resetCuratorResults();
        setError(null);
    };

    const goToSummary = () => {
        if (canProceedToSummary) {
            setStep(3);
        }
    };

    const goToContext = () => {
        if (canProceedToContext) {
            setStep(2);
            resetCuratorResults();
        }
    };

    const toggleLock = (role: 'primary' | 'alternative', index = 0) => {
        if (role === 'primary') {
            setLineupPrimary(prev => (prev ? { ...prev, locked: !prev.locked } : prev));
            return;
        }
        setLineupAlternatives(prev =>
            prev.map((item, idx) => {
                if (idx !== index || !item) return item;
                return { ...item, locked: !item.locked };
            }),
        );
    };

    const toggleExplain = (role: 'primary' | 'alternative', index = 0) => {
        if (role === 'primary') {
            setLineupPrimary(prev => (prev ? { ...prev, expanded: !prev.expanded } : prev));
            return;
        }
        setLineupAlternatives(prev =>
            prev.map((item, idx) => {
                if (idx !== index || !item) return item;
                return { ...item, expanded: !item.expanded };
            }),
        );
    };

    const handleSwap = async (role: 'primary' | 'alternative', index = 0) => {
        const target = role === 'primary' ? lineupPrimary : lineupAlternatives[index] ?? null;
        if (!selectedCurator || !target || target.locked) return;

        setSwapTarget({ role, index });
        try {
            const response = await fetch(AI_CURATOR_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curatorId: selectedCurator.id,
                    selected: curatedSelections,
                    refinePreset,
                    previousTitles: buildPreviousTitles(),
                    lockedTitles: collectCurrentTitles().filter(title => {
                        if (role === 'primary' && lineupPrimary?.title === title) return false;
                        if (role === 'alternative' && lineupAlternatives[index]?.title === title) return false;
                        return true;
                    }),
                    rejectedTitles,
                    swappedTitles,
                    targetTitle: target.title,
                    mode: role === 'primary' ? 'swap_primary' : 'swap_alternative',
                    moodDrift,
                }),
            });
            if (!response.ok) {
                throw new Error('Unable to swap this pick.');
            }
            const data: CuratorRecommendationResponse = await response.json();
            const replacement = data.replacement ?? data.primary ?? data.alternatives[0] ?? null;
            if (replacement) {
                const newPick: CuratedPick = { ...replacement, locked: false, expanded: false };
                if (role === 'primary') {
                    setRejectedTitles(prev => [...prev, lineupPrimary?.title ?? ''].filter(Boolean));
                    setLineupPrimary(newPick);
                } else {
                    setRejectedTitles(prev => [...prev, lineupAlternatives[index]?.title ?? ''].filter(Boolean));
                    setLineupAlternatives(prev => {
                        const next = [...prev];
                        next[index] = newPick;
                        return next;
                    });
                }
                setSwappedTitles(prev => [...prev, target.title]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Swap failed.');
        } finally {
            setSwapTarget(null);
        }
    };

    const openHistory = () => setHistoryOpen(true);
    const closeHistory = () => setHistoryOpen(false);

    const loadSessionFromHistory = (sessionId: string) => {
        const session = sessions.find(item => item.id === sessionId);
        if (!session) return;
        setSelectedCuratorId(session.curatorId);
        setRefinePreset(session.refinePreset);
        applyFreshResult(session.result);
        setStatus('ready');
        setStep(4);
        setHistoryOpen(false);
    };

    const startNewFromHistory = (sessionId: string) => {
        const session = sessions.find(item => item.id === sessionId);
        if (!session) return;
        setSelectedCuratorId(session.curatorId);
        setStep(2);
        resetCuratorResults();
        setHistoryOpen(false);
    };

    const newSession = () => {
        cancelInFlight();
        resetCuratorResults();
        setStep(selectedCuratorId ? 2 : 1);
    };

    const thinkingLines =
        (selectedCuratorId && CURATOR_THINKING_LINES[selectedCuratorId]) ??
        Object.values(CURATOR_THINKING_LINES).flat();
    const loadingLine = thinkingLines[loadingLineIndex % thinkingLines.length];

    return {
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
        loadingMessage: loadingLine,
        status,
        error,
        contextGroups: CONTEXT_GROUPS,
        contextToggles: CONTEXT_TOGGLES,
        resultsRef,
        thinkingLines,
        refinePreset,
        setRefinePreset,
        sessions,
        openHistory,
        closeHistory,
        historyOpen,
        loadSessionFromHistory,
        startNewFromHistory,
        lineupPrimary,
        lineupAlternatives,
        toggleLock,
        toggleExplain,
        handleSwap,
        swapTarget,
        moodDrift,
        setMoodDrift,
    };
}

export default useCuratorSession;
