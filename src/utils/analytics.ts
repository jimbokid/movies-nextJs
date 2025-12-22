type AnalyticsEvent =
    | 'paywall_shown'
    | 'paywall_cta_clicked'
    | 'checkout_session_created'
    | 'payment_success'
    | 'refine_blocked_pro_required'
    | 'refine_success';

export function track(event: AnalyticsEvent, payload?: Record<string, unknown>) {
    // Simple client-side stub for future analytics piping. Safe for SSR/CSR.
    if (process.env.NODE_ENV === 'development') {
        console.log(`[analytics] ${event}`, payload ?? {});
    }
}
