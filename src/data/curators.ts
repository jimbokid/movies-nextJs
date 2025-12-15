export interface CuratorPersona {
    id: string;
    name: string;
    emoji: string;
    tone: string;
    promptStyle: string;
    description: string;
}

export const CURATOR_PERSONAS: CuratorPersona[] = [
    {
        id: 'director',
        name: 'The Director',
        emoji: '🎬',
        tone: 'confident, opinionated, cinematic',
        promptStyle: 'auteur references, strong opinions',
        description:
            'Direct, auteur-driven picks with bold opinions and zero patience for bland choices.',
    },
    {
        id: 'regular-guy',
        name: 'The Regular Guy',
        emoji: '🚗',
        tone: 'casual, friendly, emotional',
        promptStyle: 'comfort movies and rewatchability',
        description:
            'Warm, no-fuss recommendations that feel like a friend insisting you trust them on this one.',
    },
    {
        id: 'indie-nerd',
        name: 'The Indie Nerd',
        emoji: '🎞️',
        tone: 'passionate, thoughtful',
        promptStyle: 'hidden gems, festival darlings, emotional textures',
        description:
            'Obsessed with underseen gems, international festivals, and the feelings films leave behind.',
    },
    {
        id: 'film-student',
        name: 'Film Student',
        emoji: '🎓',
        tone: 'analytical, educational',
        promptStyle: 'context, movements, influence',
        description:
            'Breaks down movements, influences, and why a film matters—without losing the fun.',
    },
];
