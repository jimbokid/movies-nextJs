export type BadgeCategory = 'genre' | 'vibe' | 'aesthetic' | 'theme' | 'emotion';

export type CuratorId = 'festival' | 'sad_indie' | 'crowd_pleaser' | 'film_school';

export type CuratorTone = 'warm' | 'poetic' | 'bold' | 'analytical';

export type CuratorPersona = {
    id: CuratorId;
    name: string;
    emoji: string;
    tagline: string;
    tone: CuratorTone;
    promptStyle: string;
};

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
}

export interface AiRecommendResponse {
    movies: AiRecommendedMovie[];
}

export type AiCuratorResponse = {
    curator: { id: CuratorId; name: string; emoji?: string | undefined };
    curator_note: string;
    primary: AiRecommendedMovie | null;
    alternatives: AiRecommendedMovie[];
};
