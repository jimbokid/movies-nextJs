'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/search?kind=movie', label: 'Search' },
    { href: '/about', label: 'About' },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="fixed z-50 w-full bg-gray-950/50 backdrop-blur border-b border-neutral-800 h-18">
            <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
                {/* Logo - Left */}
                <Link
                    href="/"
                    className="justify-self-start text-xl font-semibold transition-colors text-white hover:text-yellow-400"
                >
                    <span className="hidden sm:inline">CineView</span>
                </Link>


                {/* Center CTA - Discover AI */}
                <div className="justify-self-center">
                    <motion.div
                        initial={{ backgroundPosition: '0% 50%' }}
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{
                            duration: 6,
                            ease: 'linear',
                            repeat: Infinity,
                        }}
                        className="inline-flex rounded-full p-[2px]"
                        style={{
                            backgroundImage:
                                'linear-gradient(90deg, rgba(168,85,247,0.7), rgba(99,102,241,0.7), rgba(236,72,153,0.7))',
                            backgroundSize: '300% 300%',
                        }}
                    >
                        <Link
                            href="/discover-ai"
                            className="inline-flex items-center gap-2 rounded-full bg-gray-950/80 px-4 py-2 text-xs sm:text-sm font-semibold text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:bg-gray-900 transition-colors"
                        >
                            <span className="text-base sm:text-lg">✨</span>
                            <span className="text-nowrap">Discover with AI</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Right nav - Desktop + Mobile */}
                <div className="justify-self-end flex items-center gap-3">
                    {/* Desktop nav */}
                    <nav className="hidden sm:flex items-center gap-6 text-gray-300 text-sm">
                        {navItems.map(item => {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="hover:text-white transition-colors"
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(prev => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/70 text-neutral-100 hover:border-purple-400/70 hover:text-white transition sm:hidden"
                        aria-label="Toggle navigation menu"
                    >
                        <motion.span
                            initial={false}
                            animate={isOpen ? 'open' : 'closed'}
                            className="relative flex flex-col items-center justify-center h-4 w-4"
                        >
                            <motion.span
                                variants={{
                                    closed: { rotate: 0, y: -3 },
                                    open: { rotate: 45, y: 0 },
                                }}
                                transition={{ duration: 0.18 }}
                                className="absolute h-0.5 w-4 bg-current rounded-full"
                            />
                            <motion.span
                                variants={{
                                    closed: { opacity: 1 },
                                    open: { opacity: 0 },
                                }}
                                transition={{ duration: 0.12 }}
                                className="absolute h-0.5 w-4 bg-current rounded-full"
                            />
                            <motion.span
                                variants={{
                                    closed: { rotate: 0, y: 3 },
                                    open: { rotate: -45, y: 0 },
                                }}
                                transition={{ duration: 0.18 }}
                                className="absolute h-0.5 w-4 bg-current rounded-full"
                            />
                        </motion.span>
                    </button>
                </div>
            </div>

            {/* Mobile dropdown nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="
                sm:hidden
                absolute left-0 top-full w-full
                z-50
                border-t border-neutral-800
                bg-gray-950/95 backdrop-blur-xl
            "
                    >
                        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-2 text-sm text-gray-200">
                            {navItems.map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between rounded-xl border border-transparent px-2 py-2 hover:border-purple-400/50 hover:bg-purple-500/10 transition"
                                >
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            {/* AI CTA */}
                            <Link
                                href="/discover-ai"
                                onClick={() => setIsOpen(false)}
                                className="mt-1 flex items-center justify-between rounded-xl border border-purple-400/60 bg-purple-500/15 px-2 py-2 text-purple-100 font-semibold hover:bg-purple-500/25 transition"
                            >
                                <span>✨ Discover with AI</span>
                                <span className="text-[10px] uppercase tracking-[0.18em] bg-purple-400/20 px-2 py-0.5 rounded-full">
                                    New
                                </span>
                            </Link>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
