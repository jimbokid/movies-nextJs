import { NextResponse } from 'next/server';
import { buildTonightPick } from '@/lib/tonightGenerator';
import { getKyivDateKey, getKyivResetIso, isValidDateKey } from '@/lib/tonightTime';
import { getTonightPick, saveTonightPick } from '@/lib/tonightStore';
import { TonightPickResponse } from '@/types/tonight';

function toResponseBody(record: {
    dateKey: string;
    movieId: number;
    intentLine: string;
    whyText?: string;
    rerolled: boolean;
    resetAt: string;
    source?: 'llm' | 'fallback';
    resolution?: 'tmdbId' | 'search' | 'fallback';
}): TonightPickResponse {
    const { resetAt, ...rest } = record;
    return {
        ...rest,
        rerollAvailable: !record.rerolled,
        resetAt,
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get('date');
    const dateKey = isValidDateKey(requestedDate) ? requestedDate : getKyivDateKey();
    const resetAt = getKyivResetIso();

    try {
        let record = await getTonightPick(dateKey);

        if (!record) {
            const generated = await buildTonightPick(dateKey);
            record = {
                dateKey,
                movieId: generated.movieId,
                intentLine: generated.intentLine,
                whyText: generated.whyText,
                rerolled: false,
                createdAt: new Date().toISOString(),
                seedContext: generated.seedContext,
                source: generated.source,
                resolution: generated.resolution,
                llmModel: generated.llmModel,
                rawLLMResponse: generated.rawLLMResponse,
                validationFailed: generated.validationFailed,
            };
            await saveTonightPick(record);
        }

        return NextResponse.json(
            toResponseBody({
                ...record,
                resetAt,
            }),
        );
    } catch (error) {
        console.error('Failed to fetch tonight pick', error);
        return NextResponse.json(
            { message: 'Unable to fetch tonight pick. Please try again shortly.' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
