const requiredEnvVars = {
    movieOfTheNightApiKey: 'MOVIE_OF_THE_NIGHT_API_KEY',
    movieOfTheNightBaseUrl: 'MOVIE_OF_THE_NIGHT_BASE_URL',
    openaiApiKey: 'OPENAI_API_KEY',
} as const;

function readEnv(key: keyof typeof requiredEnvVars) {
    const envName = requiredEnvVars[key];
    const value = process.env[envName];

    if (!value || !value.trim()) {
        throw new Error(`Missing required environment variable: ${envName}`);
    }

    return value;
}

export const serverEnv = {
    movieOfTheNightApiKey: readEnv('movieOfTheNightApiKey'),
    movieOfTheNightBaseUrl: readEnv('movieOfTheNightBaseUrl'),
    openaiApiKey: readEnv('openaiApiKey'),
};
