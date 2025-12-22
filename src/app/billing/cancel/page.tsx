'use client';

import Link from 'next/link';

export default function BillingCancelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 px-4 py-16 text-white">
            <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-200">No worries</p>
                <h1 className="text-3xl font-semibold">Checkout canceled</h1>
                <p className="text-sm text-gray-200">
                    You can keep exploring and come back to unlock Refine anytime.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/curator"
                        className="w-full rounded-full bg-purple-500 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-400"
                    >
                        Return to Curator
                    </Link>
                    <Link
                        href="/"
                        className="w-full rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:border-purple-300/60"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
