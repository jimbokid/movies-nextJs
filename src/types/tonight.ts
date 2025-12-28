export interface TonightPickResponse {
    dateKey: string;
    movieId: number;
    intentLine: string;
    whyText?: string;
    rerollAvailable: boolean;
    resetAt: string;
    source?: 'llm' | 'fallback';
    resolution?: 'tmdbId' | 'search' | 'fallback';
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
    source?: 'llm' | 'fallback';
    resolution?: 'tmdbId' | 'search' | 'fallback';
    llmModel?: string;
    rawLLMResponse?: unknown;
    validationFailed?: boolean;
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
