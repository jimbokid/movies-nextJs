import { NextResponse } from 'next/server';
import { buildTonightPick } from '@/lib/tonightGenerator';
import { getKyivDateKey, getKyivResetIso, isValidDateKey } from '@/lib/tonightTime';
import { getTonightPick, saveTonightPick } from '@/lib/tonightStore';
import { TonightPickResponse } from '@/types/tonight';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get('date');
    const dateKey = isValidDateKey(requestedDate) ? requestedDate : getKyivDateKey();
    const resetAt = getKyivResetIso();

    try {
        const record =
            (await getTonightPick(dateKey)) ??
            (await (async () => {
                const generated = await buildTonightPick(dateKey);
                const newRecord = {
                    dateKey,
                    movieId: generated.movieId,
                    rerolled: false,
                    createdAt: new Date().toISOString(),
                };
                await saveTonightPick(newRecord);
                return newRecord;
            })());

        const response: TonightPickResponse = {
            dateKey: record.dateKey,
            movieId: record.movieId,
            rerollAvailable: !record.rerolled,
            resetAt,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Failed to fetch tonight pick', error);
        return NextResponse.json(
            { message: 'Unable to fetch tonight pick. Please try again shortly.' },
            { status: 500 },
        );
    }
}

export const dynamic = 'force-dynamic';
