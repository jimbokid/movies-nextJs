import { NextResponse } from 'next/server';
import { buildTonightPick } from '@/lib/tonightGenerator';
import { getKyivDateKey, getKyivResetIso, isValidDateKey } from '@/lib/tonightTime';
import { getTonightPick, saveTonightPick } from '@/lib/tonightStore';
import { TonightPickResponse } from '@/types/tonight';

interface RerollBody {
    dateKey?: string;
}

export async function POST(request: Request) {
    const body = ((await request.json().catch(() => null)) ?? {}) as RerollBody;
    const dateKey = isValidDateKey(body.dateKey) ? body.dateKey : getKyivDateKey();
    const resetAt = getKyivResetIso();

    try {
        const existing = await getTonightPick(dateKey);

        if (existing?.rerolled) {
            const response: TonightPickResponse = {
                dateKey: existing.dateKey,
                movieId: existing.movieId,
                rerollAvailable: false,
                resetAt,
            };
            return NextResponse.json(response);
        }

        const generated = await buildTonightPick(dateKey, existing?.movieId);

        const record = {
            dateKey,
            movieId: generated.movieId,
            rerolled: true,
            previousMovieId: existing?.movieId,
            createdAt: existing?.createdAt ?? new Date().toISOString(),
        };

        await saveTonightPick(record);

        const response: TonightPickResponse = {
            dateKey: record.dateKey,
            movieId: record.movieId,
            rerollAvailable: false,
            resetAt,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to reroll tonight pick', error);
        return NextResponse.json(
            { message: 'Unable to reroll tonight pick. Please try again soon.' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
