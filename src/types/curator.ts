import { AiRecommendedMovie } from './discoverAi';
import { CuratorId } from './discoverAi';

export interface CuratorSelection {
    label: string;
    category: string;
}

export interface CuratorContextOption {
    id: string;
    label: string;
    description?: string;
    category: string;
}

export interface CuratorContextGroup {
    id: string;
    title: string;
    description: string;
    options: CuratorContextOption[];
}

export interface CuratorToggle {
    id: string;
    label: string;
    description: string;
    category: string;
}

export interface CuratorSummary {
    id: string;
    name: string;
    emoji: string;
}

export interface CuratorRecommendationResponse {
    curator: CuratorSummary;
    primary: AiRecommendedMovie | null;
    alternatives: AiRecommendedMovie[];
    curator_note?: string;
    replacement?: AiRecommendedMovie | null;
    replacementRole?: 'primary' | 'alternative';
}

export type RefineMode = 'more_dark' | 'more_fun' | 'more_cozy' | 'more_weird' | 'more_action';

export type RefineStrategy = 'blend' | 'override';

export type RatingMode = 'strict' | 'soft' | 'ignore';

export type RefinePolicy = {
    mode: RefineMode;
    label: string;
    strategy: RefineStrategy;
    intensity: 'low' | 'medium' | 'high';
    toneRules: string[];
    hardAvoid: string[];
    allowedGenres?: string[];
    avoidGenres?: string[];
    ratingMode: RatingMode;
    minRating?: number;
    maxYearWindowBias?: 'newer' | 'balanced';
};

export interface CuratorSession {
    id: string;
    createdAt: number;
    curatorId: CuratorId;
    selectedBadges: CuratorSelection[];
    context?: Record<string, unknown>;
    refinePreset?: RefineMode;
    result: CuratorRecommendationResponse;
}
