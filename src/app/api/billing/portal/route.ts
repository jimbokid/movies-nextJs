import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const USER_COOKIE = 'cineview_user';

export async function POST() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(USER_COOKIE)?.value;

    if (!userId) {
        return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    return NextResponse.json({ url: `${appUrl}/billing/success?portal=1` });
}
