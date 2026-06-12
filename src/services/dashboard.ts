import axios from 'axios';
import { DashboardPayload } from '@/types/dashboard';
import {
    API_PATH,
    API_TOKEN,
    INCLUDE_ADULT,
    LANGUAGE,
    REGION
} from '@/constants/appConstants';

const MIN_VOTE_AVERAGE = 6;

export const Dashboard = {
    getDashboard: (page: number): Promise<DashboardPayload> =>
        axios
            .get(`${API_PATH}discover/movie`, {
                params: {
                    api_key: API_TOKEN,
                    language: LANGUAGE,
                    region: REGION,
                    sort_by: 'popularity.desc',
                    include_adult: INCLUDE_ADULT,
                    with_original_language: 'en',
                    'vote_average.gte': MIN_VOTE_AVERAGE,
                    page
                },
            })
            .then(res => res.data),
};
