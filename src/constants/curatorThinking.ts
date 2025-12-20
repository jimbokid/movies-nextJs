import { CuratorId } from '@/types/discoverAi';

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
