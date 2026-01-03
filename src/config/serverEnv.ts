import 'server-only';

type EnvKey = 'MOVIE_OF_THE_NIGHT_API_KEY' | 'MOVIE_OF_THE_NIGHT_BASE_URL';

function getEnvValue(name: EnvKey): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export const movieOfTheNightApiKey = getEnvValue('MOVIE_OF_THE_NIGHT_API_KEY');
export const movieOfTheNightBaseUrl = getEnvValue('MOVIE_OF_THE_NIGHT_BASE_URL');
