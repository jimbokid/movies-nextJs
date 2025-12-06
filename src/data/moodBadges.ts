import { MoodBadge } from '@/types/discoverAi';

export const moodBadges: MoodBadge[] = [
    // Genres (unchanged, all relevant)
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

    // 👉 Added relevant genres
    { id: 'biopic', label: 'Biopic', category: 'genre' },
    { id: 'war', label: 'War', category: 'genre' },
    { id: 'family', label: 'Family', category: 'genre' },
    { id: 'noir', label: 'Noir', category: 'genre' },
    { id: 'post-apocalyptic', label: 'Post-apocalyptic', category: 'genre' },

    // Vibes (all relevant, adding more “emotional style” ones)
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

    // 👉 Added relevant vibes
    { id: 'feel-good-vibe', label: 'Feel-good', category: 'vibe' },
    { id: 'cozy-rainy', label: 'Rainy day vibe', category: 'vibe' },
    { id: 'emotional', label: 'Emotional', category: 'vibe' },
    { id: 'mysterious', label: 'Mysterious atmosphere', category: 'vibe' },
    { id: 'tense-atmosphere', label: 'Tense atmosphere', category: 'vibe' },
    { id: 'romantic-warm', label: 'Warm & romantic', category: 'vibe' },
    { id: 'bleak', label: 'Bleak', category: 'vibe' },

    // Aesthetics (replacing overly technical terms with *vibes people understand*)
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

    // 👉 Simplified + more relevant aesthetics
    { id: 'rainy-neon', label: 'Rainy neon streets', category: 'aesthetic' },
    { id: 'foggy', label: 'Foggy & soft', category: 'aesthetic' },
    { id: 'urban-night', label: 'Urban night lights', category: 'aesthetic' },
    { id: 'vintage', label: 'Vintage look', category: 'aesthetic' },
    { id: 'sun-drenched', label: 'Sun-drenched', category: 'aesthetic' },
    { id: 'muted-colors', label: 'Muted colors', category: 'aesthetic' },

    // Themes (story concepts — SUPER relevant)
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

    // 👉 Added relevant themes
    { id: 'friendship', label: 'Friendship', category: 'theme' },
    { id: 'identity', label: 'Identity', category: 'theme' },
    { id: 'grief', label: 'Grief', category: 'theme' },
    { id: 'dystopia', label: 'Dystopia', category: 'theme' },
    { id: 'class-struggle', label: 'Class struggle', category: 'theme' },
    { id: 'romantic-drama', label: 'Romantic drama', category: 'theme' },
    { id: 'family-bonds', label: 'Family bonds', category: 'theme' },

    // Emotions (these are perfect — adding more useful ones)
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

    // 👉 Added emotional tags humans actually use
    { id: 'romantic', label: 'Romantic', category: 'emotion' },
    { id: 'sad', label: 'Sad', category: 'emotion' },
    { id: 'heartwarming', label: 'Heartwarming', category: 'emotion' },
    { id: 'funny', label: 'Funny', category: 'emotion' },
    { id: 'weird', label: 'Weird', category: 'emotion' },
    { id: 'tragic', label: 'Tragic', category: 'emotion' },
    { id: 'thrilling', label: 'Thrilling', category: 'emotion' },
];



export const BADGE_TITLE_COLORS: Record<string, string> = {
    genre: 'text-blue-400',
    vibe: 'text-purple-400',
    aesthetic: 'text-pink-400',
    theme: 'text-green-400',
    emotion: 'text-amber-400',
}

export const BADGE_COLORS: Record<string, string> = {
    genre: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-400/40 text-blue-100 hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]',
    vibe: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-400/40 text-purple-100 hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]',
    aesthetic:
        'bg-gradient-to-r from-pink-500/20 to-pink-600/20 border-pink-400/40 text-pink-100 hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]',
    theme: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-400/40 text-green-100 hover:shadow-[0_0_20px_rgba(34,197,94,0.35)]',
    emotion:
        'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-400/40 text-amber-100 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)]',
};

export const DEFAULT_BADGE_COLOR =
    'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border-purple-300 text-purple-50 shadow-[0_10px_40px_rgba(168,85,247,0.25)]';

export const DEFAULT_BADGE_TITLE_COLOR = 'text-gray-400';

export function sampleBadges(count: number): MoodBadge[] {
    const shuffled = [...moodBadges].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, moodBadges.length));
}
