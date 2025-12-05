import axios from 'axios';
import { DashboardPayload } from '@/types/dashboard';
import {
    API_PATH,
    API_TOKEN,
    CURRENT_YEAR,
    INCLUDE_ADULT,
    LANGUAGE,
    REGION
} from '@/constants/appConstants';

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
                    page,
                    primary_release_year: CURRENT_YEAR
                },
            })
            .then(res => res.data),
};
