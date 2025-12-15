export type BadgeCategory = 'genre' | 'vibe' | 'aesthetic' | 'theme' | 'emotion';

export type CuratorId = 'director' | 'regular-guy' | 'indie-nerd' | 'film-student';

export type TasteBand = 'popcorn' | 'auteur' | 'indie' | 'film_school';

export interface CuratorPersona {
    id: CuratorId;
    name: string;
    emoji: string;
    tone: string;
    promptStyle: string;
    description: string;
    tasteBand: TasteBand;
    allowedGenres?: string[];
    avoidGenres?: string[];
    examplesGood: string[];
    examplesAvoid: string[];
    personaBias?: string;
    minYear: number;
    maxYear?: number;
}

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
    reason?: string;
    poster_path?: string;
    release_year?: number;
    overview?: string;
    vote_average?: number;
    genre_ids?: number[];
    popularity?: number;
}

export interface AiRecommendResponse {
    movies: AiRecommendedMovie[];
}
