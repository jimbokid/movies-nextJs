'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LOADING_MESSAGES } from '@/constants/appConstants';
import { AiRecommendResponse, AiRecommendedMovie, MoodBadge } from '@/types/discoverAi';
import {
    BADGE_COLORS,
    BADGE_TITLE_COLORS,
    DEFAULT_BADGE_COLOR,
    DEFAULT_BADGE_TITLE_COLOR,
    moodBadges,
    sampleBadges,
} from '@/data/moodBadges';
import { DiscoverMode } from './ModeSwitch';

const BADGE_MIN = 14;
const BADGE_MAX = 20;
const AI_RECOMMEND_ENDPOINT = '/api/ai-recommend';

export function useDiscoverAi() {
    const [availableBadges, setAvailableBadges] = useState<MoodBadge[]>([]);
    const [selected, setSelected] = useState<MoodBadge[]>([]);
    const [recommendations, setRecommendations] = useState<AiRecommendedMovie[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [round, setRound] = useState(0);
    const resultsRef = useRef<HTMLDivElement | null>(null);
    const [didSearch, setDidSearch] = useState(false);
    const [mode, setMode] = useState<DiscoverMode>('random');

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
        setError(null);
        setHint(null);
        setDidSearch(false);
        setRound(prev => prev + 1);
    }, [randomCount]);

    useEffect(() => {
        shuffleBadges();
    }, [shuffleBadges]);

    const groupedBadges = useMemo(() => {
        const groups = new Map<string, MoodBadge[]>();
        moodBadges.forEach(badge => {
            if (!groups.has(badge.category)) {
                groups.set(badge.category, []);
            }
            groups.get(badge.category)?.push(badge);
        });

        return Array.from(groups.entries());
    }, []);

    const randomBadges = useMemo(() => {
        const withSelections = [...availableBadges];

        selected.forEach(sel => {
            if (!withSelections.some(item => item.id === sel.id)) {
                withSelections.unshift(sel);
            }
        });

        return withSelections;
    }, [availableBadges, selected]);

    useEffect(() => {
        if (recommendations.length > 0 && !loading) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 200);
        }
    }, [recommendations, loading]);

    const selectionLimit = mode === 'all' ? 10 : 3;
    const canRecommend = mode === 'all' ? selected.length > 0 : selected.length === 3;

    const handleToggleBadge = (badge: MoodBadge) => {
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

            const data: AiRecommendResponse = await response.json();
            setRecommendations(data.movies ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const loadingMessage = LOADING_MESSAGES[loadingMessageIndex];

    return {
        BADGE_COLORS,
        BADGE_TITLE_COLORS,
        DEFAULT_BADGE_COLOR,
        DEFAULT_BADGE_TITLE_COLOR,
        mode,
        setMode,
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
        loading,
        loadingMessage,
        hint,
        error,
        didSearch,
        resultsRef,
    };
}

export default useDiscoverAi;
