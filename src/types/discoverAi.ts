export type BadgeCategory = 'genre' | 'vibe' | 'aesthetic' | 'theme' | 'emotion';

export interface MoodBadge {
    id: string;
    label: string;
    category: BadgeCategory;
}

export interface SelectedBadge {
    label: string;
    category: BadgeCategory;
}

export interface AiRecommendedMovie {
    title: string;
    tmdb_id?: number;
    reason: string;
    poster_path?: string;
    release_year?: number;
    overview?: string;
    vote_average?: number;
}

export interface AiRecommendResponse {
    movies: AiRecommendedMovie[];
}
