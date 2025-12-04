import { MoodBadge } from '@/types/discoverAi';

export const moodBadges: MoodBadge[] = [
    // Genres
    { id: 'drama', label: 'Drama', category: 'genre' },
    { id: 'thriller', label: 'Thriller', category: 'genre' },
    { id: 'sci-fi', label: 'Sci-Fi', category: 'genre' },
    { id: 'crime', label: 'Crime', category: 'genre' },
    { id: 'mystery', label: 'Mystery', category: 'genre' },
    { id: 'romance', label: 'Romance', category: 'genre' },
    { id: 'horror', label: 'Horror', category: 'genre' },
    { id: 'animation', label: 'Animation', category: 'genre' },
    { id: 'documentary', label: 'Documentary', category: 'genre' },
    { id: 'fantasy', label: 'Fantasy', category: 'genre' },
    { id: 'adventure', label: 'Adventure', category: 'genre' },
    { id: 'comedy', label: 'Comedy', category: 'genre' },
    { id: 'musical', label: 'Musical', category: 'genre' },
    { id: 'western', label: 'Western', category: 'genre' },

    // Vibes
    { id: 'cozy', label: 'Cozy', category: 'vibe' },
    { id: 'dark-moody', label: 'Dark & Moody', category: 'vibe' },
    { id: 'slow-burn', label: 'Slow-burn', category: 'vibe' },
    { id: 'high-energy', label: 'High-energy', category: 'vibe' },
    { id: 'nostalgic', label: 'Nostalgic', category: 'vibe' },
    { id: 'gritty', label: 'Gritty', category: 'vibe' },
    { id: 'surreal', label: 'Surreal', category: 'vibe' },
    { id: 'whimsical', label: 'Whimsical', category: 'vibe' },
    { id: 'moody', label: 'Moody', category: 'vibe' },
    { id: 'offbeat', label: 'Offbeat', category: 'vibe' },
    { id: 'adrenaline', label: 'Adrenaline rush', category: 'vibe' },
    { id: 'contemplative', label: 'Contemplative', category: 'vibe' },

    // Visual aesthetics
    { id: 'neon-noir', label: 'Neon-noir', category: 'aesthetic' },
    { id: 'retro-80s', label: 'Retro 80s', category: 'aesthetic' },
    { id: 'analog-film', label: 'Analog film look', category: 'aesthetic' },
    { id: 'pastel', label: 'Pastel palette', category: 'aesthetic' },
    { id: 'high-contrast', label: 'High contrast', category: 'aesthetic' },
    { id: 'handheld', label: 'Handheld camera', category: 'aesthetic' },
    { id: 'monochrome', label: 'Monochrome', category: 'aesthetic' },
    { id: 'art-deco', label: 'Art deco', category: 'aesthetic' },
    { id: 'cyberpunk', label: 'Cyberpunk', category: 'aesthetic' },
    { id: 'warm-sunset', label: 'Golden hour', category: 'aesthetic' },
    { id: 'snowy', label: 'Snowy landscapes', category: 'aesthetic' },
    { id: 'minimalist', label: 'Minimalist framing', category: 'aesthetic' },
    { id: 'dreamlike', label: 'Dreamlike haze', category: 'aesthetic' },

    // Themes
    { id: 'coming-of-age', label: 'Coming-of-age', category: 'theme' },
    { id: 'revenge', label: 'Revenge', category: 'theme' },
    { id: 'heist', label: 'Heist', category: 'theme' },
    { id: 'survival', label: 'Survival', category: 'theme' },
    { id: 'found-family', label: 'Found family', category: 'theme' },
    { id: 'time-travel', label: 'Time travel', category: 'theme' },
    { id: 'psychological', label: 'Psychological', category: 'theme' },
    { id: 'political', label: 'Political intrigue', category: 'theme' },
    { id: 'redemption', label: 'Redemption arc', category: 'theme' },
    { id: 'underdog', label: 'Underdog sports', category: 'theme' },
    { id: 'road-trip', label: 'Road trip', category: 'theme' },
    { id: 'gothic', label: 'Gothic romance', category: 'theme' },
    { id: 'crime-saga', label: 'Crime saga', category: 'theme' },

    // Emotions
    { id: 'hopeful', label: 'Hopeful', category: 'emotion' },
    { id: 'melancholic', label: 'Melancholic', category: 'emotion' },
    { id: 'tense', label: 'Tense', category: 'emotion' },
    { id: 'uplifting', label: 'Uplifting', category: 'emotion' },
    { id: 'bittersweet', label: 'Bittersweet', category: 'emotion' },
    { id: 'heart-pounding', label: 'Heart-pounding', category: 'emotion' },
    { id: 'feel-good', label: 'Feel-good', category: 'emotion' },
    { id: 'eerie', label: 'Eerie', category: 'emotion' },
    { id: 'cathartic', label: 'Cathartic', category: 'emotion' },
    { id: 'inspiring', label: 'Inspiring', category: 'emotion' },
    { id: 'chilling', label: 'Chilling', category: 'emotion' },
];

export function sampleBadges(count: number): MoodBadge[] {
    const shuffled = [...moodBadges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, moodBadges.length));
}
