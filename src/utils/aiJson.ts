export function sanitizeJson(content: string): string {
    const withoutFences = content
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    const firstBrace = withoutFences.indexOf('{');
    const lastBrace = withoutFences.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return withoutFences.slice(firstBrace, lastBrace + 1).trim();
    }

    return withoutFences;
}

export function safeExtractJsonObject(content: string): unknown {
    const sanitized = sanitizeJson(content);
    try {
        return JSON.parse(sanitized);
    } catch (error) {
        console.error('safeExtractJsonObject parse error', error);
        return null;
    }
}
