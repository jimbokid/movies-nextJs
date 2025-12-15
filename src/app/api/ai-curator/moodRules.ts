export type MoodRuleKey = 'fun' | 'comfort' | 'cozy' | 'light' | 'chill' | 'uplifting';

export type MoodRule = {
    includeGenres: string[];
    excludeGenres: string[];
    excludeKeywords: string[];
    toneHint: string;
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
        excludeKeywords: ['revenge', 'violence', 'death', 'terminal illness', 'addiction', 'abduction'],
        toneHint:
            'Comfort means cozy, warm, low-stress, reassuring. Avoid emotionally devastating plots.',
    },
    cozy: {
        includeGenres: ['Comedy', 'Family', 'Feel-good', 'Slice of Life', 'RomCom'],
        excludeGenres: ['Crime', 'Thriller', 'Horror', 'War', 'Disturbing Drama'],
        excludeKeywords: ['revenge', 'violence', 'death', 'terminal illness', 'addiction', 'abduction'],
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
};

export function getActiveMoodRules(selectedLabels: string[]): MoodRule[] {
    const normalizedLabels = selectedLabels.map(label => label.toLowerCase());
    const rules: MoodRule[] = [];
    const seen = new Set<MoodRuleKey>();

    (Object.keys(MOOD_RULES) as MoodRuleKey[]).forEach(key => {
        const matches = normalizedLabels.some(label => label.includes(key));
        if (matches && !seen.has(key)) {
            rules.push(MOOD_RULES[key]);
            seen.add(key);
        }
    });

    return rules;
}
