export interface TonightPickResponse {
    dateKey: string;
    movieId: number;
    intentLine: string;
    whyText?: string;
    rerollAvailable: boolean;
    resetAt: string;
}

export interface TonightPickRecord {
    dateKey: string;
    movieId: number;
    intentLine: string;
    whyText?: string;
    rerolled: boolean;
    createdAt: string;
    previousMovieId?: number;
    seedContext?: Record<string, unknown>;
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
