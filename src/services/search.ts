import axios from "axios";
import {
    API_PATH,
    API_TOKEN,
    LANGUAGE,
    REGION,
    INCLUDE_ADULT,
} from "@/constants/appConstants";
import { DashboardPayload } from "@/types/dashboard";

export const Search = {
    fetchByGenre: (genreId: string, page = 1): Promise<DashboardPayload> =>
        axios
            .get(`${API_PATH}discover/movie`, {
                params: {
                    api_key: API_TOKEN,
                    language: LANGUAGE,
                    region: REGION,
                    include_adult: INCLUDE_ADULT,
                    page,
                    with_genres: genreId,
                    sort_by: "popularity.desc",
                },
            })
            .then(res => res.data),

    fetchByKeyword: (keywordId: string, page = 1): Promise<DashboardPayload> =>
        axios
            .get(`${API_PATH}discover/movie`, {
                params: {
                    api_key: API_TOKEN,
                    language: LANGUAGE,
                    region: REGION,
                    include_adult: INCLUDE_ADULT,
                    page,
                    with_keywords: keywordId,
                    sort_by: "popularity.desc",
                },
            })
            .then(res => res.data),
};
