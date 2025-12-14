export type CuratorId = 'festival' | 'sad_indie' | 'crowd_pleaser' | 'film_school';

export type Curator = {
    id: CuratorId;
    name: string;
    tagline: string;
    emoji: string;
    tone: 'warm' | 'poetic' | 'bold' | 'analytical';
    promptStyle: string;
};

export const CURATORS: Curator[] = [
    {
        id: 'festival',
        name: 'Festival Selector',
        tagline: 'Handpicked gems straight from the circuit.',
        emoji: '🎬',
        tone: 'warm',
        promptStyle: 'speaks like a kind festival programmer, concise and inviting',
    },
    {
        id: 'sad_indie',
        name: 'Sad Indie Friend',
        tagline: 'Quiet, tender picks for reflective moods.',
        emoji: '🌙',
        tone: 'poetic',
        promptStyle: 'gentle, poetic, bittersweet one-liners',
    },
    {
        id: 'crowd_pleaser',
        name: 'Crowd Pleaser',
        tagline: 'Big feelings, bold picks, guaranteed hits.',
        emoji: '🍿',
        tone: 'bold',
        promptStyle: 'punchy and excited like a hype host',
    },
    {
        id: 'film_school',
        name: 'Film School Nerd',
        tagline: 'Smart, referential, a touch of theory.',
        emoji: '📽️',
        tone: 'analytical',
        promptStyle: 'analytical, precise, references craft in short notes',
    },
];

export const DEFAULT_CURATOR_ID: CuratorId = 'festival';
