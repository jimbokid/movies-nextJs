import { AiRecommendedMovie } from './discoverAi';

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
}
