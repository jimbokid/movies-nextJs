'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email) return;
        const fakeId = btoa(email);
        document.cookie = `cineview_user=${fakeId}; path=/; max-age=${60 * 60 * 24 * 30}`;
        router.push(next);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 px-4 py-16 text-white">
            <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-purple-200">Welcome</p>
                    <h1 className="text-3xl font-semibold">Sign in</h1>
                    <p className="text-sm text-gray-300">
                        Lightweight demo login to unlock Curator features.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="block space-y-2 text-sm">
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
                        />
                    </label>
                    <button
                        type="submit"
                        className="w-full rounded-full bg-purple-500 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-400"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
