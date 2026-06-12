export interface MovieItem {
    profile_path: string;
    title: string;
    vote_average: number;
    name: string;
    original_name: string;
    poster_path: string;
    character: string;
    id: number;
    backdrop_path?: string | null;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
}

export interface DashboardPayload {
    results: Array<MovieItem>;
    page: number;
    total_pages: number;
    total_results: number;
}

export interface DashboardState {
    popular: {
        results: Array<MovieItem>;
    };
    page: number;
    total_pages: number;
    total_results: number;
    isLoading: boolean;
}
