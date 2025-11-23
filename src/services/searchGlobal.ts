import axios from "axios";
import {
    API_PATH,
    API_TOKEN,
    LANGUAGE,
    REGION,
    INCLUDE_ADULT,
} from "@/constants/appConstants";
import { DashboardPayload } from "@/types/dashboard";

export type SearchKind = "movie" | "tv" | "person";

export type PeoplePayload = {
    page: number;
    total_pages: number;
    total_results: number;
    results: Array<{
        id: number;
        name: string;
        profile_path: string | null;
        popularity: number;
        known_for_department?: string;
        known_for?: Array<{
            id: number;
            title?: string;
            name?: string;
            poster_path?: string | null;
            media_type?: "movie" | "tv";
        }>;
    }>;
};

export const searchGlobal = {
    searchMovie: (query: string, page = 1): Promise<DashboardPayload> =>
        axios
            .get(`${API_PATH}search/movie`, {
                params: {
                    api_key: API_TOKEN,
                    language: LANGUAGE,
                    region: REGION,
                    include_adult: INCLUDE_ADULT,
                    page,
                    query,
                },
            })
            .then((r) => r.data),

    searchTv: (query: string, page = 1): Promise<DashboardPayload> =>
        axios
            .get(`${API_PATH}search/tv`, {
                params: {
                    api_key: API_TOKEN,
                    language: LANGUAGE,
                    page,
                    query,
                },
            })
            .then((r) => r.data),

    searchPerson: (query: string, page = 1): Promise<PeoplePayload> =>
        axios
            .get(`${API_PATH}search/person`, {
                params: {
                    api_key: API_TOKEN,
                    language: LANGUAGE,
                    page,
                    query,
                },
            })
            .then((r) => r.data),
};
