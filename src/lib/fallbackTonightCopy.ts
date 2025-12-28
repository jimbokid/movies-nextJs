const INTENT_LINE_VARIATIONS = [
    'A quiet choice that lands harder than it looks.',
    'Something atmospheric, not loud — but not empty.',
    'A calm pick with more feeling than flash.',
    'A grounded watch that settles in instead of racing.',
];

const WHY_TEXT_VARIATIONS = [
    "It's paced like a late-night thought, letting scenes breathe without hurrying you. The calm makes the sharper moments land quietly.",
    'The film trusts silence and mood over big twists, so you can just sink in. It leaves space for your own read on the characters.',
    'It keeps the tension human-sized and lets the texture do the work. You feel the stakes without the volume being cranked.',
    'Nothing screams for attention; it invites you to notice the smaller beats. By the end, it feels more like time spent than time used up.',
];

function hashString(input: string) {
    return input.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
}

export function buildFallbackCopy(seed: string) {
    const hash = Math.abs(hashString(seed));
    const intentLine = INTENT_LINE_VARIATIONS[hash % INTENT_LINE_VARIATIONS.length];
    const whyText = WHY_TEXT_VARIATIONS[hash % WHY_TEXT_VARIATIONS.length];
    return { intentLine, whyText };
}
