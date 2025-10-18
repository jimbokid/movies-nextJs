import { MovieItem } from '@/types/dashboard';

export interface Person {
    id: string;
    profile_path: string;
    name: string;
    character: string;
}

export interface VideoItem {
    id: string;
    key: string;
    name: string;
    site: string;
    size: number;
}

export interface GenreItem {
    id: string;
    name: string;
}

export interface KeywordItem {
    id: number;
    name: string;
}

export type Genres = Array<GenreItem>;

export interface MovieDetail {
    title: string;
    original_name: string;
    genres: Genres;
    vote_average: number;
    release_date: string;
    first_air_date: string;
    overview: string;
    backdrop_path: string;
}

export interface MovieDetailPayload {
    data: MovieDetail;
    credits: {
        cast: Array<Person>;
        crew: [];
    };
    similar: {
        results: Array<MovieItem>;
    };
    videos: {
        results: Array<VideoItem>;
    };
    images: {
        backdrops: [];
        id: number | null;
        logos: [];
        posters: [];
    };
    genreList: {
        [id: string]: string;
    };
    keywords: Array<KeywordItem>;
}
