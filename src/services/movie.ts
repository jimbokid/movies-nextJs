import axios from 'axios';
import { API_PATH, API_TOKEN, LANGUAGE } from '@/constants/appConstants';
import { genreGroup } from '@/utils/movieDetailHelpers';
import { Genres, MovieDetailPayload } from '@/types/movie';

export const MovieDetail = {
    async getMovieDetail(id: string, type: string): Promise<MovieDetailPayload> {
        const get = <T>(path: string): Promise<T> =>
            axios
                .get(`${API_PATH}${path}`, {
                    params: {
                        api_key: API_TOKEN,
                        language: LANGUAGE,
                    },
                })
                .then(res => res.data);

        // Only the main movie request is fatal — secondary sections degrade to empty.
        const [movie, similar, credits, images, genre, videos, keywords] = await Promise.all([
            get<MovieDetailPayload['data']>(`${type}/${id}`).catch(error => {
                console.error('Failed to fetch movie detail:', error?.message ?? error);
                throw new Error('Movie detail fetch failed');
            }),
            get<MovieDetailPayload['similar']>(`${type}/${id}/similar`).catch(() => ({
                results: [],
            })),
            get<MovieDetailPayload['credits']>(`${type}/${id}/credits`).catch(() => ({
                cast: [],
                crew: [] as MovieDetailPayload['credits']['crew'],
            })),
            get<MovieDetailPayload['images']>(`${type}/${id}/images`).catch(() => ({
                backdrops: [] as MovieDetailPayload['images']['backdrops'],
                id: null,
                logos: [] as MovieDetailPayload['images']['logos'],
                posters: [] as MovieDetailPayload['images']['posters'],
            })),
            get<{ genres: Genres }>('genre/movie/list').catch(() => ({
                genres: [] as Genres,
            })),
            get<MovieDetailPayload['videos']>(`${type}/${id}/videos`).catch(() => ({
                results: [],
            })),
            get<{ keywords: MovieDetailPayload['keywords'] }>(`${type}/${id}/keywords`).catch(
                () => ({ keywords: [] }),
            ),
        ]);

        const genreList: { [id: string]: string } = genreGroup(genre.genres);

        return {
            data: movie,
            similar,
            credits,
            images,
            genreList,
            videos,
            keywords: keywords.keywords ?? [],
        };
    },
};
