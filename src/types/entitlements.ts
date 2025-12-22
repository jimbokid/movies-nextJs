export type ProStatus = 'free' | 'pro' | 'past_due' | 'canceled';

export interface Entitlements {
    isPro: boolean;
    pro_status: ProStatus;
    pro_until?: string | null;
}
