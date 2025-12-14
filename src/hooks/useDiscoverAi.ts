'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LOADING_MESSAGES } from '@/constants/appConstants';
import { AiCuratorResponse, AiRecommendedMovie, CuratorId, MoodBadge } from '@/types/discoverAi';
import { moodBadges, sampleBadges } from '@/data/moodBadges';
import { CURATORS, DEFAULT_CURATOR_ID } from '@/data/curators';
import { groupBadgesByCategory } from '@/utils/moodBadges';
import { DiscoverMode } from '@/app/discover-ai/ModeSwitch';

const BADGE_MIN = 14;
const BADGE_MAX = 20;
const AI_RECOMMEND_ENDPOINT = '/api/ai-recommend';
const SELECTION_LIMIT = 3;

export function useDiscoverAi() {
    const [availableBadges, setAvailableBadges] = useState<MoodBadge[]>([]);
    const [selected, setSelected] = useState<MoodBadge[]>([]);
    const [recommendations, setRecommendations] = useState<AiRecommendedMovie[]>([]);
    const [curation, setCuration] = useState<AiCuratorResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [round, setRound] = useState(0);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const [didSearch, setDidSearch] = useState(false);
    const [mode, setMode] = useState<DiscoverMode>('random');
    const [curatorId, setCuratorId] = useState<CuratorId>(DEFAULT_CURATOR_ID);

    useEffect(() => {
        setSelected([]);
        setHint(null);
    }, [mode]);

    useEffect(() => {
        setCuration(null);
        setRecommendations([]);
        setDidSearch(false);
        setError(null);
    }, [curatorId]);

    useEffect(() => {
        if (!loading) {
            setLoadingMessageIndex(0);
            return;
        }

        const intervalId = setInterval(() => {
            setLoadingMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);

        return () => clearInterval(intervalId);
    }, [loading]);

    const randomCount = useCallback(
        () => Math.floor(Math.random() * (BADGE_MAX - BADGE_MIN + 1)) + BADGE_MIN,
        [],
    );

    const shuffleBadges = useCallback(() => {
        const count = randomCount();
        setAvailableBadges(sampleBadges(count));
        setSelected([]);
        setRecommendations([]);
        setCuration(null);
        setError(null);
        setHint(null);
        setDidSearch(false);
        setRound(prev => prev + 1);
    }, [randomCount]);

    useEffect(() => {
        shuffleBadges();
    }, [shuffleBadges]);

    const groupedBadges = useMemo(() => groupBadgesByCategory(moodBadges), []);

    const randomBadges = useMemo(() => {
        const withSelections = [...availableBadges];

        selected.forEach(sel => {
            if (!withSelections.some(item => item.id === sel.id)) {
                withSelections.unshift(sel);
            }
        });

        return withSelections;
    }, [availableBadges, selected]);

    const hasResults = useMemo(
        () => Boolean(curation?.primary || (curation?.alternatives?.length ?? 0) > 0),
        [curation],
    );

    useEffect(() => {
        if (hasResults && !loading) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 200);
        }
    }, [hasResults, loading]);

    const selectionLimit = SELECTION_LIMIT;
    const canRecommend = selected.length > 0 && selected.length <= selectionLimit;

    const handleToggleBadge = (badge: MoodBadge) => {
        if (loading) return;

        const isSelected = selected.some(item => item.id === badge.id);

        if (isSelected) {
            setSelected(prev => prev.filter(item => item.id !== badge.id));
            setHint(null);
            return;
        }

        if (selected.length >= selectionLimit) {
            setHint(`You can only pick ${selectionLimit} moods for this mode.`);
            return;
        }

        setSelected(prev => [...prev, badge]);
        setHint(null);
    };

    const handleRecommend = async () => {
        if (!canRecommend) return;

        setDidSearch(true);

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(AI_RECOMMEND_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    curatorId,
                    selected: selected.map(item => ({
                        label: item.label,
                        category: item.category,
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message ?? 'Unable to fetch recommendations.');
            }

            const data: AiCuratorResponse = await response.json();
            const normalized = {
                ...data,
                alternatives: data.alternatives ?? [],
                curator: data.curator ?? {
                    id: curatorId,
                    name: CURATORS.find(cur => cur.id === curatorId)?.name ?? curatorId,
                },
            } satisfies AiCuratorResponse;

            setCuration(normalized);
            setRecommendations(
                [normalized.primary, ...normalized.alternatives].filter(Boolean) as AiRecommendedMovie[],
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const loadingMessage = LOADING_MESSAGES[loadingMessageIndex];

    return {
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
    };
}

export default useDiscoverAi;
