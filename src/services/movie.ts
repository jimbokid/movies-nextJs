import axios from "axios";
import {
    API_PATH,
    API_TOKEN,
    LANGUAGE,
} from "@/constants/appConstants";
import {genreGroup} from "@/utils/movieDetailHelpers";
import {MovieDetailPayload} from "@/types/movie";

export const MovieDetail = {
    async getMovieDetail(id: string, type: string): Promise<MovieDetailPayload> {
        try {
            const urls = [
                `${API_PATH}${type}/${id}`,
                `${API_PATH}${type}/${id}/similar`,
                `${API_PATH}${type}/${id}/credits`,
                `${API_PATH}${type}/${id}/images`,
                `${API_PATH}genre/movie/list`,
                `${API_PATH}${type}/${id}/videos`,
                `${API_PATH}${type}/${id}/keywords`,
            ];

            const requests = urls.map((url) =>
                axios.get(url, {
                    params: {
                        api_key: API_TOKEN,
                        language: LANGUAGE,
                    },
                })
            );

            const [
                movie,
                similar,
                credits,
                images,
                genre,
                videos,
                keywords,
            ] = await axios.all(requests);

            const genreList: { [id: string]: string } = genreGroup(genre.data.genres);

            return {
                data: movie.data,
                similar: similar.data,
                credits: credits.data,
                images: images.data,
                genreList,
                videos: videos.data,
                keywords: keywords.data.keywords,
            };
        } catch (error) {
            console.error("Failed to fetch detail details:", error);
            throw new Error("Movie detail fetch failed");
        }
    },
};
