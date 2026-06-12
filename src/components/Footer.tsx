import Link from 'next/link';

const footerLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/search?kind=movie', label: 'Search' },
    { href: '/discover-ai', label: 'Discover with AI' },
    { href: '/curator', label: 'Curator' },
    { href: '/about', label: 'About' },
];

export default function Footer() {
    return (
        <footer className="border-t border-neutral-800 bg-gray-950">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-tight text-white hover:text-purple-300 transition-colors"
                        >
                            Cine<span className="text-purple-400">View</span>
                        </Link>
                        <p className="max-w-xs text-sm text-neutral-400">
                            Discover movies, TV shows, and people — with a film mind, not just an
                            algorithm.
                        </p>
                    </div>

                    <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-300">
                        {footerLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:text-white transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-neutral-800/80 pt-5 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} CineView. Built by Yurii Kovalchuk.</p>
                    <a
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 hover:text-neutral-300 transition-colors"
                    >
                        <span className="rounded bg-gradient-to-r from-[#90cea1] to-[#01b4e4] px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-gray-950">
                            TMDB
                        </span>
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </a>
                </div>
            </div>
        </footer>
    );
}
