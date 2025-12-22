import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { track } from '@/utils/analytics';

const USER_COOKIE = 'cineview_user';

export async function POST() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(USER_COOKIE)?.value;

    if (!userId) {
        return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/billing/success`;
    const cancelUrl = `${appUrl}/billing/cancel`;
    const paddleCheckoutBase = process.env.PADDLE_CHECKOUT_LINK;
    const paddlePriceId = process.env.PADDLE_PRICE_ID;

    track('checkout_session_created', { provider: 'paddle' });

    if (paddleCheckoutBase && paddlePriceId) {
        try {
            const checkoutUrl = new URL(paddleCheckoutBase);
            checkoutUrl.searchParams.set('price_id', paddlePriceId);
            checkoutUrl.searchParams.set('customer_id', userId);
            checkoutUrl.searchParams.set('success_url', successUrl);
            checkoutUrl.searchParams.set('cancel_url', cancelUrl);

            return NextResponse.json({
                url: checkoutUrl.toString(),
            });
        } catch {
            // fall through to mock flow
        }
    }

    // Fallback mock flow when Paddle vars are missing or invalid.
    return NextResponse.json({
        url: `${successUrl}?mock=1&provider=paddle`,
        cancelUrl,
    });
}
