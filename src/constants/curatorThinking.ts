import { CuratorId } from '@/types/discoverAi';
import { RefineMode, RefinePolicy } from '@/types/curator';

export const CURATOR_THINKING_LINES: Record<CuratorId, string[]> = {
    director: [
        'Adjusting pacing to keep the tension unbroken...',
        'Hunting for a director with a clear signature...',
        'Balancing boldness with watchability...',
        'Sequencing your night so the payoff lands...',
    ],
    'regular-guy': [
        'Calling in something fast, loud, and rewatchable...',
        'Finding the perfect “trust me bro” pick...',
        'Dialing the fun up without the homework...',
        'Looking for a crowd-pleaser that actually slaps...',
    ],
    'indie-nerd': [
        'Skimming festival memories for something intimate...',
        'Balancing texture, tone, and underseen gems...',
        'Avoiding the obvious while keeping it accessible...',
        'Pairing emotional weight with a little surprise...',
    ],
    'film-student': [
        'Connecting influences across decades...',
        'Choosing a pick that teaches without preaching...',
        'Looking for craft, movement, and meaning...',
        'Curating a lineup with context baked in...',
    ],
};

export const REFINE_POLICIES: Record<RefineMode, RefinePolicy> = {
    more_dark: {
        mode: 'more_dark',
        label: 'More dark',
        strategy: 'override',
        intensity: 'high',

        toneRules: [
            // Tone + vibe
            'Bleak, disturbing, oppressive, dread-filled. Treat “dark” as a promise: no cozy, no levity, no wink-to-camera.',
            // What to prefer
            'Prioritize psychological horror, bleak thrillers, nihilistic/cosmic dread, grim crime, dystopian sci-fi, folk/body horror, neo-noir.',
            // What to reject
            'Reject anything that reads as “dark but fun”, “campy”, “spooky adventure”, or “stylish violence with a playful vibe”.',
            // Intensity permission
            'It’s okay if it’s polarizing, transgressive, or extreme — if the user asked for dark, don’t sanitize it.',
        ],

        hardAvoid: [
            // Family / kid-safe / feel-good
            'family-friendly',
            'kids',
            'Pixar',
            'Disney',
            'Lego',
            'animated kids movies',
            'feel-good',
            'heartwarming',
            'uplifting',

            // “Fun-dark” traps
            'horror comedy',
            'camp',
            'campy',
            'quirky',
            'wacky',
            'playful',
            'goofy',
            'teen',
            'high school',
            'coming-of-age',
            'nostalgic adventure',

            // Franchise-y comfort
            'superhero',
            'Marvel',
            'action comedy',
            'buddy comedy',
        ],

        // IMPORTANT: no "drama" here (too broad)
        allowedGenres: [
            'horror',
            'thriller',
            'crime',
            'sci-fi',
            'mystery',
            // optional extra knobs depending on your provider taxonomy:
            'neo-noir',
            'psychological thriller',
            'psychological horror',
            'folk horror',
            'body horror',
            'cosmic horror',
            'dystopian',
        ],

        avoidGenres: [
            'family',
            'animation',
            'adventure',
            'comedy',
            'romance',
            'music',
            'musical',
            'sport',
        ],

        ratingMode: 'ignore',
        maxYearWindowBias: 'balanced',
    },

    more_fun: {
        mode: 'more_fun',
        label: 'More fun',
        strategy: 'blend',
        intensity: 'medium',
        toneRules: [
            'Lean into playful, energetic, rewatchable crowd-pleasers.',
            'Prefer fast pacing, charm, and clean “good time” energy. Avoid bleak or oppressive tones.',
        ],
        hardAvoid: [
            'slow cinema',
            'experimental',
            'bleak',
            'nihilistic',
            'trauma-focused',
            'torture',
            'disturbing',
        ],
        allowedGenres: ['comedy', 'action', 'adventure', 'romcom'],
        avoidGenres: ['extreme horror', 'body horror', 'torture porn'],
        ratingMode: 'soft',
        minRating: 6.0,
        maxYearWindowBias: 'newer',
    },

    more_cozy: {
        mode: 'more_cozy',
        label: 'Cozy',
        strategy: 'blend',
        intensity: 'low',
        toneRules: [
            'Comforting, warm, safe, low-stakes.',
            'Prefer gentle humor, relationships, cozy settings. No disturbing cruelty or dread.',
        ],
        hardAvoid: [
            'bleak',
            'disturbing',
            'torture',
            'nihilistic',
            'serial killer',
            'home invasion',
            'rape',
            'extreme violence',
        ],
        allowedGenres: ['romance', 'dramedy', 'animation', 'slice of life', 'family'],
        avoidGenres: ['horror', 'thriller', 'crime'],
        ratingMode: 'soft',
        minRating: 6.3,
        maxYearWindowBias: 'newer',
    },

    more_weird: {
        mode: 'more_weird',
        label: 'Weird / offbeat',
        strategy: 'override',
        intensity: 'high',
        toneRules: [
            'Allow surreal, eccentric, genre-bending picks. Dream logic is welcome.',
            'It is okay to include polarizing cult titles, odd pacing, or unhinged concepts.',
            'Prefer original voice over formula.',
        ],
        hardAvoid: ['formulaic crowd-pleasers', 'overly familiar franchises', 'paint-by-numbers'],
        allowedGenres: ['horror', 'sci-fi', 'fantasy', 'arthouse', 'mystery', 'absurdist'],
        ratingMode: 'soft',
        minRating: 5.5,
        maxYearWindowBias: 'balanced',
    },

    more_action: {
        mode: 'more_action',
        label: 'More action',
        strategy: 'blend',
        intensity: 'medium',
        toneRules: [
            'Action-forward pacing and set pieces first.',
            'Prefer momentum: chases, fights, tactical tension. Avoid talky, slow character-first pacing.',
        ],
        hardAvoid: ['quiet character studies', 'minimalist drama', 'slow-burn (no payoff)'],
        allowedGenres: ['action', 'thriller', 'crime', 'sci-fi'],
        ratingMode: 'soft',
        minRating: 6.0,
        maxYearWindowBias: 'newer',
    },
};
