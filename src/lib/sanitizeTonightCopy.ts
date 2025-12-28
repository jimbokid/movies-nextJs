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
    return text.replace(
        /([\u2700-\u27bf]|[\ud83c\udde6-\ud83c\uddff]{1,2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u23f3|\u231b|\u23e9|\u23ea|\u23eb|\u23ec|\u23f0|\u23f1|\u23f2|\u23f8|\u23f9|\u23fa|\u00a0)/g,
        '',
    );
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
