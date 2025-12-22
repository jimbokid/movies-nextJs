import { cookies } from 'next/headers';
import { Entitlements } from '@/types/entitlements';

const PRO_COOKIE = 'cineview_pro_status';
const USER_COOKIE = 'cineview_user';

export async function getEntitlementsFromCookies(): Promise<Entitlements | null> {
    const cookieStore = await cookies();
    const user = cookieStore.get(USER_COOKIE)?.value;
    if (!user) return null;

    const proStatusCookie = cookieStore.get(PRO_COOKIE)?.value as Entitlements['pro_status'];

    return {
        isPro: proStatusCookie === 'pro',
        pro_status: proStatusCookie ?? 'free',
        pro_until: null,
    };
}

export async function requirePro(): Promise<Entitlements> {
    const entitlements = (await getEntitlementsFromCookies()) ?? {
        isPro: false,
        pro_status: 'free',
        pro_until: null,
    };

    return entitlements;
}
