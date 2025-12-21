export type MoodRuleKey =
    | 'fun'
    | 'comfort'
    | 'cozy'
    | 'light'
    | 'chill'
    | 'uplifting'
    | 'spooky'
    | 'dark';

export type MoodRule = {
    includeGenres: string[];
    excludeGenres: string[];
    excludeKeywords: string[];
    toneHint: string;
    /** If true, this rule “wins” and can ignore previous mood restrictions */
    override?: boolean;
};

export const MOOD_RULES: Record<MoodRuleKey, MoodRule> = {
    fun: {
        includeGenres: ['Comedy', 'Adventure', 'Action Comedy', 'RomCom'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Tragedy'],
        excludeKeywords: ['kidnapping', 'serial killer', 'abuse', 'trauma', 'grief', 'torture'],
        toneHint:
            'Fun means light, energetic, funny, crowd-pleasing. Avoid bleak, tense, or heavy stories.',
    },

    comfort: {
        includeGenres: ['Comedy', 'Family', 'Feel-good', 'Slice of Life', 'RomCom'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Disturbing Drama'],
        excludeKeywords: [
            'revenge',
            'violence',
            'death',
            'terminal illness',
            'addiction',
            'abduction',
        ],
        toneHint:
            'Comfort means cozy, warm, low-stress, reassuring. Avoid emotionally devastating plots.',
    },

    cozy: {
        includeGenres: ['Comedy', 'Family', 'Feel-good', 'Slice of Life', 'RomCom'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Disturbing Drama'],
        excludeKeywords: [
            'revenge',
            'violence',
            'death',
            'terminal illness',
            'addiction',
            'abduction',
        ],
        toneHint:
            'Cozy should feel gentle, uplifting, and safe—steer clear of grim or stressful themes.',
    },

    light: {
        includeGenres: ['Comedy', 'Adventure', 'RomCom', 'Family'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Disturbing Drama'],
        excludeKeywords: ['kidnapping', 'serial killer', 'abuse', 'trauma', 'grief', 'torture'],
        toneHint:
            'Light should feel breezy and easy to watch. Avoid tense, bleak, or oppressive material.',
    },

    chill: {
        includeGenres: ['Comedy', 'Adventure', 'RomCom', 'Family'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Disturbing Drama'],
        excludeKeywords: ['kidnapping', 'serial killer', 'abuse', 'trauma', 'grief', 'torture'],
        toneHint:
            'Chill should feel easygoing and relaxed. Avoid stressful thrillers or heavy dramas.',
    },

    uplifting: {
        includeGenres: ['Comedy', 'Family', 'Feel-good', 'RomCom'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Disturbing Drama'],
        excludeKeywords: ['kidnapping', 'serial killer', 'abuse', 'trauma', 'grief', 'torture'],
        toneHint:
            'Uplifting means positive, hopeful, inspiring. Avoid bleak, tragic, or traumatizing plots.',
    },

    // NEW: “spooky” = horror allowed but not extreme
    spooky: {
        includeGenres: ['Horror', 'Thriller', 'Mystery', 'Supernatural', 'Psychological Thriller'],
        excludeGenres: ['War', 'Tragedy'], // keep or remove as you like
        excludeKeywords: ['rape', 'child abuse'], // optional: your “hard no” list
        toneHint: 'Spooky means eerie, tense, creepy, supernatural vibes. Horror is welcome.',
    },

    // NEW: “dark” = user explicitly wants it; ignore previous “safe” filters
    dark: {
        includeGenres: ['Horror', 'Thriller', 'Crime', 'Psychological Thriller', 'Mystery'],
        excludeGenres: [], // intentionally empty
        excludeKeywords: [], // intentionally empty (or keep only your absolute red-lines)
        toneHint:
            'Dark means genuinely intense, bleak, disturbing, and uncompromising. Don’t sanitize it.',
        override: true,
    },
};

const MOOD_ALIASES: Array<[key: MoodRuleKey, patterns: RegExp[]]> = [
    ['dark', [/dark/i, /more\s*dark/i, /disturb/i, /bleak/i]],
    ['spooky', [/spooky/i, /horror/i, /scary/i, /creepy/i]],
    ['fun', [/fun/i, /party/i, /laugh/i]],
    ['comfort', [/comfort/i, /comforting/i]],
    ['cozy', [/cozy/i]],
    ['light', [/light/i, /easy/i]],
    ['chill', [/chill/i, /relax/i]],
    ['uplifting', [/uplifting/i, /hope/i, /inspiring/i]],
];

export function getActiveMoodRules(selectedLabels: string[]): MoodRule[] {
    const rules: MoodRule[] = [];
    const seen = new Set<MoodRuleKey>();

    for (const label of selectedLabels) {
        for (const [key, patterns] of MOOD_ALIASES) {
            if (seen.has(key)) continue;
            if (patterns.some(r => r.test(label))) {
                rules.push(MOOD_RULES[key]);
                seen.add(key);
            }
        }
    }

    // If user picked something that is an override mood (e.g. dark),
    // return ONLY that rule (so it doesn’t get blocked by cozy/fun excludes).
    const overrideRule = rules.find(r => r.override);
    if (overrideRule) return [overrideRule];

    return rules;
}
