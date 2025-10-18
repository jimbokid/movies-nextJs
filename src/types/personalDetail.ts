import { MovieItem } from './dashboard';

export interface PersonalData {
    name: string;
    profile_path: string;
    birthday: string;
    place_of_birth: string;
    biography: string;
}

export interface MoviesListItem extends MovieItem {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    character: string;
    credit_id: string;
    order: number;
}

export interface PersonalDetailPayload {
    data: PersonalData;
    movies: Array<MoviesListItem>;
}
