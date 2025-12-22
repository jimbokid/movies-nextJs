import { useState } from 'react';
import { track } from '@/utils/analytics';

interface PaywallModalProps {
    open: boolean;
    onClose: () => void;
}

export default function PaywallModal({ open, onClose }: PaywallModalProps) {
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleCheckout = async () => {
        setLoading(true);
        track('paywall_cta_clicked', { source: 'refine' });
        try {
            const res = await fetch('/api/billing/checkout', { method: 'POST' });
            const data = await res.json();
            if (data?.url) {
                window.location.href = data.url as string;
                return;
            }
        } catch {
            // noop
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-gray-900 to-black p-6 shadow-2xl">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-purple-200">
                        Curator Pro
                    </p>
                    <h3 className="text-2xl font-semibold text-white">Unlock Refine</h3>
                    <p className="text-sm text-gray-300">
                        Go deeper with mood & perspective control. Checkout is handled securely by
                        Paddle.
                    </p>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-gray-100">
                    <li className="flex items-start gap-2">
                        <span>✨</span>
                        <span>Unlimited Refine</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span>🎛️</span>
                        <span>Full control over tone</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span>🎬</span>
                        <span>Built for movie nights</span>
                    </li>
                </ul>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-white">
                    <span className="text-lg font-semibold">$4/month</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-purple-100">
                        cancel anytime
                    </span>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full rounded-full bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-purple-400 disabled:opacity-60"
                    >
                        {loading ? 'Redirecting…' : 'Unlock with Paddle'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-purple-300/50"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}
