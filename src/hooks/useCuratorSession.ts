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
import { CuratorPersona, CuratorId } from '@/types/discoverAi';
import { readLocalStorage, writeLocalStorage } from '@/utils/storage';

const AI_CURATOR_ENDPOINT = '/api/ai-curator';
const SESSION_STORAGE_KEY = 'cineview.curator.sessions.v1';
const PREVIOUS_TITLES_CAP = 20;
type SessionStatus = 'idle' | 'loading' | 'ready' | 'error';

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
    const [sessions, setSessions] = useState<CuratorSession[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingLineIndex, setLoadingLineIndex] = useState(0);
    const [status, setStatus] = useState<SessionStatus>('idle');
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

    const cancelInFlight = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
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
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message ?? 'Unable to start curator session.');
                }

                const data: CuratorRecommendationResponse = await response.json();
                setResult(data);
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
            buildPreviousTitles,
            canStartSession,
            contextSelections,
            curatedSelections,
            refinePreset,
            resetCuratorResults,
            selectedCurator,
            toggleSelections,
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

    const openHistory = () => setHistoryOpen(true);
    const closeHistory = () => setHistoryOpen(false);

    const loadSessionFromHistory = (sessionId: string) => {
        const session = sessions.find(item => item.id === sessionId);
        if (!session) return;
        setSelectedCuratorId(session.curatorId);
        setRefinePreset(session.refinePreset);
        setResult(session.result);
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
    };
}

export default useCuratorSession;
