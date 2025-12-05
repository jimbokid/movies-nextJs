import moment from 'moment';

export const API_TOKEN: string = '52168c89eccc87a8da1bbb7cc5f6b0dd';
export const API_PATH: string = `https://api.themoviedb.org/3/`;
export const CURRENT_YEAR: string = moment().format('YYYY');
export const INCLUDE_ADULT: boolean = false;
export const LANGUAGE: string = 'en-US';
export const REGION: string = 'US';

export const LOADING_MESSAGES = [
    'Summoning cinematic picks...',
    'Dialing into the movie multiverse...',
    'Matching your moods with hidden gems...',
    'Dusting off forgotten film reels...',
    'Curating tonight’s double feature...',
];