import TopNav from './TopNav';
import React from 'react';

type AppShellProps = {
    children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <TopNav />
            <main className="pt-20">{children}</main>
            <footer className="border-t border-[var(--border)] mt-12">
                <div className="page-shell py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-caption">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        <span className="text-body font-semibold text-[var(--text)]">CineView</span>
                        <span aria-hidden>•</span>
                        <span>Quiet picks for every mood.</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-caption">
                        <a className="hover:text-[var(--text)] transition-colors" href="/about">
                            About
                        </a>
                        <a
                            className="hover:text-[var(--text)] transition-colors"
                            href="/discover-ai"
                        >
                            Discover AI
                        </a>
                        <a
                            className="hover:text-[var(--text)] transition-colors"
                            href="https://github.com/jimbokid"
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
