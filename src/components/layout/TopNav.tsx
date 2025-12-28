'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { buildCuratorUrl } from '@/lib/curatorLink';
import { cn } from '@/utils/cn';

const navItems = [
    { href: '/', label: 'Discover' },
    { href: '/search?kind=movie', label: 'Search' },
    { href: buildCuratorUrl({ from: 'header' }), label: 'Curator' },
    { href: '/discover-ai', label: 'Discover AI' },
    { href: '/about', label: 'About' },
];

function isActive(pathname: string, href: string) {
    const pathOnly = href.split('?')[0];
    if (pathOnly === '/') return pathname === '/';
    return pathname.startsWith(pathOnly);
}

export default function TopNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 z-40 w-full border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_85%,transparent)]/90 backdrop-blur-md">
            <div className="page-shell h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-lg font-semibold tracking-tight">
                        CineView
                    </Link>
                    <span className="hidden md:inline-flex h-7 items-center rounded-full border border-[var(--border)] px-3 text-xs text-[var(--text-muted)]">
                        Night mode
                    </span>
                </div>
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map(item => {
                        const active = isActive(pathname, item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'relative rounded-full px-4 py-2 text-sm transition-colors',
                                    active
                                        ? 'text-[var(--text)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                                )}
                                aria-current={active ? 'page' : undefined}
                            >
                                <span>{item.label}</span>
                                <span
                                    className={cn(
                                        'absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-[var(--accent)] transition-all',
                                        active ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
                                    )}
                                    aria-hidden
                                />
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] md:hidden"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-label="Toggle navigation"
                >
                    <span className="relative block h-5 w-5">
                        <span
                            className={cn(
                                'absolute left-0 h-[2px] w-full bg-current transition-transform',
                                open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-1',
                            )}
                        />
                        <span
                            className={cn(
                                'absolute left-0 h-[2px] w-full bg-current transition-opacity',
                                open ? 'opacity-0' : 'top-1/2 -translate-y-1/2 opacity-100',
                            )}
                        />
                        <span
                            className={cn(
                                'absolute left-0 h-[2px] w-full bg-current transition-transform',
                                open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-1',
                            )}
                        />
                    </span>
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]">
                    <div className="page-shell py-3 flex flex-col gap-1">
                        {navItems.map(item => {
                            const active = isActive(pathname, item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'rounded-xl px-3 py-2 text-sm transition-colors',
                                        active
                                            ? 'bg-[var(--surface-2)] text-[var(--text)]'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                                    )}
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </header>
    );
}
