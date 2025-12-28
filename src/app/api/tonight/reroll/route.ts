import { NextResponse } from 'next/server';
import { buildTonightPick } from '@/lib/tonightGenerator';
import { getKyivDateKey, getKyivResetIso, isValidDateKey } from '@/lib/tonightTime';
import { getTonightPick, saveTonightPick } from '@/lib/tonightStore';
import { TonightPickResponse } from '@/types/tonight';

interface RerollBody {
    dateKey?: string;
}

function toResponseBody(record: {
    dateKey: string;
    movieId: number;
    intentLine: string;
    whyText?: string;
    rerolled: boolean;
    resetAt: string;
}): TonightPickResponse {
    const { resetAt, ...rest } = record;
    return {
        ...rest,
        rerollAvailable: !record.rerolled,
        resetAt,
    };
}

export async function POST(request: Request) {
    const body = ((await request.json().catch(() => null)) ?? {}) as RerollBody;
    const dateKey = isValidDateKey(body.dateKey) ? body.dateKey : getKyivDateKey();
    const resetAt = getKyivResetIso();

    try {
        const existing = await getTonightPick(dateKey);

        if (existing?.rerolled) {
            return NextResponse.json(
                toResponseBody({
                    ...existing,
                    resetAt,
                }),
            );
        }

        const generated = await buildTonightPick(dateKey, existing?.movieId);

        const record = {
            dateKey,
            movieId: generated.movieId,
            intentLine: generated.intentLine,
            whyText: generated.whyText,
            rerolled: true,
            previousMovieId: existing?.movieId,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
            seedContext: generated.seedContext,
        };

        await saveTonightPick(record);

        return NextResponse.json(
            toResponseBody({
                ...record,
                resetAt,
            }),
        );
    } catch (error) {
        console.error('Failed to reroll tonight pick', error);
        return NextResponse.json(
            { message: 'Unable to reroll tonight pick. Please try again soon.' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
