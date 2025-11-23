import Link from 'next/link';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-gray-950/50 backdrop-blur border-b border-neutral-800">
            <div
                className="max-w-6xl mx-auto px-4 py-3
        grid grid-cols-3 items-center"
            >
                {/* Logo - Left */}
                <Link
                    href="/"
                    className="justify-self-start text-xl font-semibold text-white hover:text-yellow-400 transition-colors"
                >
                    CineView
                </Link>

                {/* Search - Center */}
                <nav className="justify-self-center flex items-center gap-2">
                    <Link
                        href="/search?kind=movie"
                        className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-4 py-2 text-sm text-white transition"
                    >
                        🔎 Search
                        <kbd className="ml-1 hidden md:inline-flex items-center rounded bg-black/40 px-1.5 py-0.5 text-[10px] text-neutral-300 border border-neutral-700">
                            /
                        </kbd>
                    </Link>

                    <Link
                        href="/search?kind=movie"
                        className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
                    >
                        🔎
                    </Link>
                </nav>

                {/* Right links */}
                <nav className="justify-self-end flex items-center gap-6 text-gray-300 text-sm">
                    <Link href="/about" className="hover:text-white transition-colors">
                        About
                    </Link>
                </nav>
            </div>
        </header>
    );
}
