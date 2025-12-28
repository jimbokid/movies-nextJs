interface FallbackTonightPick {
    movieId: number;
    intentLine: string;
    whyText: string;
    title: string;
}

export const FALLBACK_TONIGHT_PICKS: FallbackTonightPick[] = [
    {
        movieId: 603,
        title: 'The Matrix',
        intentLine: 'A late-night jolt into a cool, neon fever dream.',
        whyText:
            'The pacing starts measured and grows hypnotic, letting you sink into its rhythm. The ideas linger after the credits, inviting a quiet debrief. It balances spectacle with a thoughtful undercurrent instead of noisy hype.',
    },
    {
        movieId: 756999,
        title: 'The Banshees of Inisherin',
        intentLine: 'A windswept quiet tale that sits gently with you.',
        whyText:
            'The film moves at a calm, deliberate pace, giving every look and silence room to breathe. It pairs wry humor with a gentle sadness that never forces itself. By the end, it leaves you reflective rather than rattled.',
    },
    {
        movieId: 335787,
        title: 'Uncut Gems',
        intentLine: 'A pressure-cooker story that still feels strangely human.',
        whyText:
            'Even as the stakes tighten, the film keeps its focus on flawed people and their small choices. It’s tense but not flashy, letting the soundscape and close shots do the heavy lifting. You end up invested in the mess rather than exhausted by it.',
    },
    {
        movieId: 359724,
        title: 'Green Room',
        intentLine: 'A stripped-down thriller with punk grit and focus.',
        whyText:
            'It keeps the stakes intimate and immediate, never relying on cheap jump scares. The runtime is lean, so every beat counts without lingering. The mood stays grounded, letting you feel the room without overwhelming noise.',
    },
    {
        movieId: 238,
        title: 'The Godfather',
        intentLine: 'A slow-burning classic that rewards patient watching.',
        whyText:
            'The story unfolds with unhurried confidence, letting you settle into each room and conversation. It favors atmosphere and character over spectacle. By the end, it feels like time well spent rather than a sprint.',
    },
    {
        movieId: 925,
        title: 'The Evil Dead',
        intentLine: 'A DIY cabin nightmare with playful scrappiness.',
        whyText:
            'It’s short, scrappy, and inventive, trading gloss for raw energy. The scares come from mood and practical tricks rather than cheap shocks. There’s a handmade charm that keeps it fun even when things get wild.',
    },
];
