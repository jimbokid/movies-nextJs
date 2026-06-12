import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950 px-4 pt-18 text-white">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
            </div>
            <div className="relative max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <p className="bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
                    404
                </p>
                <h1 className="mt-3 text-2xl font-semibold">This scene was cut</h1>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    The page you are looking for does not exist or has moved to another reel.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_12px_40px_rgba(124,58,237,0.4)]"
                    >
                        Back to home
                    </Link>
                    <Link
                        href="/search?kind=movie"
                        className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-gray-100 transition hover:border-purple-300/60 hover:bg-purple-500/10"
                    >
                        Search movies
                    </Link>
                </div>
            </div>
        </main>
    );
}
