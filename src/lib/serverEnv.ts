import 'server-only';

const required = (value: string | undefined, name: string) => {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

export const serverEnv = {
    movieOfTheNightApiKey: required(
        process.env.MOVIE_OF_THE_NIGHT_API_KEY,
        'MOVIE_OF_THE_NIGHT_API_KEY',
    ),
    movieOfTheNightBaseUrl: required(
        process.env.MOVIE_OF_THE_NIGHT_BASE_URL,
        'MOVIE_OF_THE_NIGHT_BASE_URL',
    ),
};
