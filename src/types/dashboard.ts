export interface MovieItem {
    profile_path: string;
    title: string;
    vote_average: number;
    name: string;
    original_name: string;
    poster_path: string;
    character: string;
    id: number;
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
