const MARKETING_PHRASES = [
    'must-watch',
    'masterpiece',
    'critically acclaimed',
    'you will love',
    "you'll love",
    'perfect for everyone',
    'guaranteed',
    'unmissable',
    'must see',
    'blockbuster',
];

const SPOILER_TERMS = [
    'dies',
    'death',
    'killer is',
    'murderer is',
    'ending',
    'twist is',
    'identity',
    'revealed as',
];

function removeEmojis(text: string) {
    return text.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
}

function cleanMarketing(text: string) {
    let result = text;
    MARKETING_PHRASES.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        result = result.replace(regex, '').trim();
    });
    return result;
}

function removeSpoilers(text: string) {
    let result = text;
    SPOILER_TERMS.forEach(term => {
        const regex = new RegExp(term, 'gi');
        result = result.replace(regex, '').trim();
    });
    return result;
}

function ensureSentenceCount(text: string, maxSentences: number) {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    return sentences.slice(0, maxSentences).join(' ').trim();
}

function ensureEndingPunctuation(text: string) {
    if (!text) return text;
    const trimmed = text.trim();
    const lastChar = trimmed[trimmed.length - 1];
    if (['.', '!', '?'].includes(lastChar)) return trimmed;
    return `${trimmed}.`;
}

export function sanitizeTonightCopy(text: string, maxLength: number, maxSentences?: number) {
    const withoutEmoji = removeEmojis(text);
    const noMarketing = cleanMarketing(withoutEmoji);
    const noSpoilers = removeSpoilers(noMarketing);
    const sentenceLimited =
        typeof maxSentences === 'number' ? ensureSentenceCount(noSpoilers, maxSentences) : noSpoilers;
    const trimmed = sentenceLimited.slice(0, maxLength).trim();
    return ensureEndingPunctuation(trimmed);
}

export function containsSpoilerTerms(text: string) {
    return SPOILER_TERMS.some(term => text.toLowerCase().includes(term.toLowerCase()));
}
