import axios from 'axios';
import { API_PATH, API_TOKEN, LANGUAGE } from '@/constants/appConstants';
import { reverse, sortBy } from 'lodash';
import { MoviesListItem, PersonalDetailPayload } from '@/types/personalDetail';

const createUrl = (id: string, path: string = '') => `${API_PATH}person/${id}${path}`;

export const getPersonalDetail = async (id: string): Promise<PersonalDetailPayload> => {
    const [detail, movies] = await Promise.all([
        axios.get(createUrl(id), {
            params: { api_key: API_TOKEN, language: LANGUAGE },
        }),
        axios.get(createUrl(id, '/movie_credits'), {
            params: { api_key: API_TOKEN, language: LANGUAGE },
        }),
    ]);

    const sortedMovies: Array<MoviesListItem> = reverse(sortBy(movies.data.cast, 'popularity'));

    return {
        data: detail.data,
        movies: sortedMovies,
    };
};
