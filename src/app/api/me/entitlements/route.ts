import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Entitlements } from '@/types/entitlements';

const PRO_COOKIE = 'cineview_pro_status';
const USER_COOKIE = 'cineview_user';

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(USER_COOKIE)?.value;

    if (!userId) {
        return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const proStatusCookie = cookieStore.get(PRO_COOKIE)?.value as Entitlements['pro_status'];
    const entitlements: Entitlements = {
        isPro: proStatusCookie === 'pro',
        pro_status: proStatusCookie ?? 'free',
        pro_until: null,
    };

    return NextResponse.json(entitlements);
}
