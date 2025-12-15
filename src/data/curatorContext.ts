import { CuratorContextGroup, CuratorToggle } from '@/types/curator';

export const CONTEXT_GROUPS: CuratorContextGroup[] = [
    {
        id: 'mood-intention',
        title: 'Mood intention',
        description: 'Pick the emotional lane so your curator knows where to steer the vibe.',
        options: [
            { id: 'emotional', label: 'Emotional', description: 'I want to feel something real.', category: 'mood_intention' },
            { id: 'fun', label: 'Fun', description: 'Keep it playful and high-energy.', category: 'mood_intention' },
            {
                id: 'challenging',
                label: 'Challenging',
                description: 'Give me layered, thought-provoking stories.',
                category: 'mood_intention',
            },
            {
                id: 'comfort',
                label: 'Comfort',
                description: 'Cozy, rewatchable, and low-stress.',
                category: 'mood_intention',
            },
        ],
    },
    {
        id: 'time-preference',
        title: 'Time preference',
        description: 'How much runway do you have tonight?',
        options: [
            { id: 'short', label: 'Quick watch', description: 'Tidy runtimes under 110 minutes.', category: 'time_preference' },
            { id: 'any', label: 'Any length', description: 'I will go wherever the story needs.', category: 'time_preference' },
            {
                id: 'long',
                label: 'Epic',
                description: 'Give me a cinematic meal—longer runtimes welcome.',
                category: 'time_preference',
            },
        ],
    },
];

export const CONTEXT_TOGGLES: CuratorToggle[] = [
    {
        id: 'surprise-me',
        label: 'Surprise me',
        description: 'Loosen the guardrails and allow bolder swings.',
        category: 'session_modifier',
    },
    {
        id: 'avoid-mainstream',
        label: 'Avoid mainstream',
        description: 'Prefer underseen, non-obvious picks.',
        category: 'session_modifier',
    },
    {
        id: 'one-risk',
        label: 'One risky pick',
        description: 'Allow at least one divisive or formally bold choice.',
        category: 'session_modifier',
    },
];
