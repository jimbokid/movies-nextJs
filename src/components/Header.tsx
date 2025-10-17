import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full bg-neutral-900/90 backdrop-blur border-b border-neutral-800">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo / Home link */}
                <Link href="/" className="text-xl font-semibold text-white hover:text-yellow-400 transition-colors">
                    🎬 MovieBase
                </Link>

                {/* Navigation links (optional) */}
                <nav className="flex items-center gap-6 text-gray-300 text-sm">
                    <Link href="/about" className="hover:text-white transition-colors">
                        About
                    </Link>
                </nav>
            </div>
        </header>
    );
}
