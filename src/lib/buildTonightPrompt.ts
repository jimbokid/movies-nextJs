import { getKyivContext } from './tonightTime';

interface BuildTonightPromptOptions {
    dateKey: string;
    recentMoodSignals?: string[];
    rerollContext?: string;
}

export function buildTonightPrompt({
    dateKey,
    recentMoodSignals = [],
    rerollContext,
}: BuildTonightPromptOptions) {
    const context = getKyivContext();
    const moodsLine =
        recentMoodSignals.length > 0 ? `Recent mood hints: ${recentMoodSignals.join(', ')}` : '';
    const rerollLine = rerollContext ? `Reroll request: ${rerollContext}` : 'Reroll request: none.';

    return `Pick exactly one film for tonight. Keep it calm and cinematic, avoid hype or marketing. Avoid spoilers entirely. Avoid mega-blockbusters unless the vibe absolutely fits.

Return STRICT JSON ONLY:
{
  "tmdbId": <tmdb id if you know it>,
  "title": "<title if id unknown>",
  "year": <release year>,
  "intentLine": "<1 short sentence, max 110 chars>",
  "whyText": "<2-3 sentences, calm tone, max 320 chars>"
}

Constraints:
- One movie only
- Use intentLine to describe the viewing vibe, not plot
- whyText must stay spoiler-free, grounded, and calm
- Never say "as an AI"
- Do not include code fences or any extra text, ONLY the JSON object

Context:
- Kyiv date key: ${dateKey}
- Kyiv weekday: ${context.weekday}
- Kyiv time of day: ${context.timeOfDay}
- ${moodsLine || 'No mood hints provided.'}
- ${rerollLine}
`;
}
