'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CURATOR_PERSONAS } from '@/data/curators';
import { CONTEXT_GROUPS, CONTEXT_TOGGLES } from '@/data/curatorContext';
import {
    CuratorContextOption,
    CuratorRecommendationResponse,
    CuratorSelection,
} from '@/types/curator';
import { LOADING_MESSAGES } from '@/constants/appConstants';

const AI_CURATOR_ENDPOINT = '/api/ai-curator';

const THINKING_MESSAGES = [
    ...LOADING_MESSAGES,
    'Arguing with my inner critic about pacing...',
    'Surfacing titles your friends forgot to mention...',
    'Balancing surprise with cinematic intention...',
    'Chasing a pick that feels tailor-made for tonight...',
];

export type CuratorStep = 1 | 2 | 3 | 4;

type ContextSelectionState = Record<string, CuratorContextOption | null>;
type ToggleSelectionState = Record<string, boolean>;

const buildDefaultContext = (): ContextSelectionState =>
    Object.fromEntries(CONTEXT_GROUPS.map(group => [group.id, null]));

const buildDefaultToggles = (): ToggleSelectionState =>
    Object.fromEntries(CONTEXT_TOGGLES.map(toggle => [toggle.id, false]));

export function useCuratorSession() {
    const [step, setStep] = useState<CuratorStep>(1);
    const [selectedCuratorId, setSelectedCuratorId] = useState<string | null>(null);
    const [contextSelections, setContextSelections] = useState<ContextSelectionState>(() =>
        buildDefaultContext(),
    );
    const [toggleSelections, setToggleSelections] = useState<ToggleSelectionState>(() =>
        buildDefaultToggles(),
    );
    const [result, setResult] = useState<CuratorRecommendationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [previousTitles, setPreviousTitles] = useState<string[]>([]);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!loading) return undefined;

        const interval = setInterval(() => {
            setLoadingMessageIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (!result || loading) return;

        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
    }, [result, loading]);

    const selectedCurator = useMemo(
        () => CURATOR_PERSONAS.find(curator => curator.id === selectedCuratorId) ?? null,
        [selectedCuratorId],
    );

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
    const canProceedToSummary = Object.values(contextSelections).every(Boolean);
    const canStartSession = canProceedToSummary && curatedSelections.length > 0;

    const handleSelectCurator = (curatorId: string) => {
        setSelectedCuratorId(curatorId);
        setError(null);
        if (step === 1) {
            setStep(2);
        }
    };

    const handleSelectContext = (groupId: string, option: CuratorContextOption) => {
        setContextSelections(prev => ({ ...prev, [groupId]: option }));
        setResult(null);
        setError(null);
    };

    const handleToggle = (toggleId: string) => {
        setToggleSelections(prev => ({ ...prev, [toggleId]: !prev[toggleId] }));
        setResult(null);
        setError(null);
    };

    const resetContext = useCallback(() => {
        setContextSelections(buildDefaultContext());
        setToggleSelections(buildDefaultToggles());
        setResult(null);
        setError(null);
        setStep(2);
    }, []);

    const cancelInFlight = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
    };

    const startSession = useCallback(async () => {
        if (!selectedCurator || !canStartSession) return;

        cancelInFlight();
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            setLoading(true);
            setError(null);
            setResult(null);
            setStep(4);

            const response = await fetch(AI_CURATOR_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    curatorId: selectedCurator.id,
                    selected: curatedSelections,
                    previousTitles,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? 'Unable to start curator session.');
            }

            const data: CuratorRecommendationResponse = await response.json();
            setResult(data);
            setPreviousTitles(prev => {
                const next: string[] = [...prev];
                const append = (title?: string | null) => {
                    if (title && !next.includes(title)) next.push(title);
                };
                append(data.primary?.title ?? null);
                data.alternatives.forEach(item => append(item.title));
                return next.slice(-20);
            });
        } catch (err) {
            if ((err as Error).name === 'AbortError') return;
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }, [canStartSession, curatedSelections, previousTitles, selectedCurator]);

    const goBackToCurator = () => {
        cancelInFlight();
        setStep(1);
        setResult(null);
    };

    const goToSummary = () => {
        if (canProceedToSummary) {
            setStep(3);
        }
    };

    const goToContext = () => {
        if (canProceedToContext) {
            setStep(2);
        }
    };

    const thinkingMessage = THINKING_MESSAGES[loadingMessageIndex % THINKING_MESSAGES.length];

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
        canProceedToContext,
        canProceedToSummary,
        canStartSession,
        result,
        loading,
        loadingMessage: thinkingMessage,
        error,
        contextGroups: CONTEXT_GROUPS,
        contextToggles: CONTEXT_TOGGLES,
        resultsRef,
    };
}

export default useCuratorSession;
