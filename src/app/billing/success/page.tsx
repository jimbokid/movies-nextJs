'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function BillingSuccessPage() {
    useEffect(() => {
        document.cookie = `cineview_pro_status=pro; path=/; max-age=${60 * 60 * 24 * 30}`;
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 px-4 py-16 text-white">
            <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center shadow-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Success</p>
                <h1 className="text-3xl font-semibold">Curator Pro activated</h1>
                <p className="text-sm text-gray-200">
                    You can now refine as much as you like. Head back to Curator to try it out.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/curator"
                        className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                        Return to Curator
                    </Link>
                    <Link
                        href="/"
                        className="w-full rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:border-emerald-300/60"
                    >
                        Go home
                    </Link>
                </div>
            </div>
        </div>
    );
}
