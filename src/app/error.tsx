'use client';

import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950 px-4 pt-18 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
            </div>
            <div className="relative max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <p className="text-5xl">🎬</p>
                <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    The reel jammed while loading this page. It is usually temporary — give it
                    another spin.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="cursor-pointer rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_12px_40px_rgba(124,58,237,0.4)]"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-gray-100 transition hover:border-purple-300/60 hover:bg-purple-500/10"
                    >
                        Back to home
                    </Link>
                </div>
                {error.digest && (
                    <p className="mt-4 text-[11px] text-gray-500">Error ref: {error.digest}</p>
                )}
            </div>
        </main>
    );
}
