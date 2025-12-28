interface TonightFallbackPoolItem {
    tmdbId: number;
    tags?: string[];
}

export const TONIGHT_FALLBACK_POOL: TonightFallbackPoolItem[] = [
    { tmdbId: 13, tags: ['cozy', 'nostalgic'] }, // Forrest Gump
    { tmdbId: 603, tags: ['kinetic', 'neo-noir'] }, // The Matrix
    { tmdbId: 278, tags: ['hopeful', 'quiet'] }, // The Shawshank Redemption
    { tmdbId: 550, tags: ['dark'] }, // Fight Club
    { tmdbId: 120, tags: ['epic', 'historical'] }, // LOTR: The Fellowship of the Ring
    { tmdbId: 680, tags: ['crime', 'moody'] }, // Pulp Fiction
    { tmdbId: 578, tags: ['sci-fi', 'grounded'] }, // Jaws
    { tmdbId: 155, tags: ['dark', 'hero'] }, // The Dark Knight
    { tmdbId: 424, tags: ['slow', 'reflective'] }, // Schindler's List
    { tmdbId: 807, tags: ['dark', 'thriller'] }, // Se7en
    { tmdbId: 1124, tags: ['warm', 'family'] }, // The Lion King
    { tmdbId: 637, tags: ['quiet', 'character'] }, // Life Is Beautiful
    { tmdbId: 756999, tags: ['quiet', 'reflective'] }, // The Banshees of Inisherin
    { tmdbId: 194, tags: ['period', 'music'] }, // Amadeus
    { tmdbId: 11324, tags: ['late-night', 'indie'] }, // Eternal Sunshine of the Spotless Mind
    { tmdbId: 27205, tags: ['moody', 'sci-fi'] }, // Inception
    { tmdbId: 335787, tags: ['tense'] }, // Uncut Gems
    { tmdbId: 693134, tags: ['epic', 'atmospheric'] }, // Dune
    { tmdbId: 49026, tags: ['epic'] }, // The Dark Knight Rises
    { tmdbId: 359724, tags: ['punk', 'gritty'] }, // Green Room
    { tmdbId: 238, tags: ['slow', 'classic'] }, // The Godfather
    { tmdbId: 1891, tags: ['kinetic'] }, // The Empire Strikes Back
    { tmdbId: 925, tags: ['horror', 'scrappy'] }, // The Evil Dead
    { tmdbId: 103, tags: ['classic'] }, // Taxi Driver
    { tmdbId: 62, tags: ['thriller', 'austere'] }, // 2001: A Space Odyssey
    { tmdbId: 872, tags: ['crime'] }, // The Godfather Part II
    { tmdbId: 453, tags: ['quiet'] }, // A Beautiful Mind
    { tmdbId: 68718, tags: ['kinetic', 'western'] }, // Django Unchained
    { tmdbId: 210577, tags: ['thriller'] }, // Gone Girl
    { tmdbId: 272, tags: ['noir', 'hero'] }, // Batman Begins
    { tmdbId: 4935, tags: ['slow', 'romance'] }, // Pan's Labyrinth
    { tmdbId: 140607, tags: ['epic'] }, // Star Wars: The Force Awakens
];
