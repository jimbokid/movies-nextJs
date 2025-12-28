export interface TonightPickResponse {
    dateKey: string;
    movieId: number;
    rerollAvailable: boolean;
    resetAt: string;
}

export interface TonightPickRecord {
    dateKey: string;
    movieId: number;
    rerolled: boolean;
    createdAt: string;
    previousMovieId?: number;
}

export interface TonightWhyResponse {
    intentLine: string;
    whyText: string;
    source?: 'ai' | 'fallback';
}

export interface TonightMovie {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string | null;
    runtime?: number | null;
    genres?: { id: number; name: string }[];
    vote_average?: number | null;
}
