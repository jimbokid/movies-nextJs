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
}

export type RefinePreset =
    | 'more_fun'
    | 'darker'
    | 'more_mainstream'
    | 'more_indie'
    | 'only_newer'
    | 'surprise';

export interface CuratorSession {
    id: string;
    createdAt: number;
    curatorId: CuratorId;
    selectedBadges: CuratorSelection[];
    context?: Record<string, unknown>;
    refinePreset?: RefinePreset;
    result: CuratorRecommendationResponse;
}
