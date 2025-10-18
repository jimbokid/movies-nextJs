import moment from 'moment';

export const API_TOKEN: string = '52168c89eccc87a8da1bbb7cc5f6b0dd';
export const API_PATH: string = `https://api.themoviedb.org/3/`;
export const CURRENT_YEAR: string = moment().format('YYYY');
export const START_DATE_POPULAR = moment().subtract(1, 'months').startOf('month');
export const INCLUDE_ADULT: boolean = false;
export const LANGUAGE: string = 'en-US';
export const REGION: string = 'US';
export const IMAGE_URL: string = 'https://image.tmdb.org/t/p/w300_and_h450_bestv2/';
