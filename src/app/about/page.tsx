import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';

export default function AboutPage() {
    const year = new Date().getFullYear();

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title="About CineView"
                subtitle="CineView is a calm, cinematic companion crafted by Yurii Kovalchuk."
            />

            <div className="page-shell space-y-6">
                <section className="card-surface p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                        <p className="text-caption uppercase tracking-[0.2em] text-[var(--accent-2)]">
                            Profile
                        </p>
                        <h2 className="text-headline">Yurii Kovalchuk</h2>
                        <p className="text-caption">
                            Senior Frontend Engineer · React &amp; Next.js · Product-minded
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-headline">Tech Highlights</h3>
                        <p className="text-body text-[var(--text-muted)]">
                            JavaScript (ES6+), TypeScript, React.js, Next.js, Redux Toolkit, Styled
                            Components, Tailwind, GraphQL/Apollo, REST with React Query, Storybook,
                            PWAs, Service Workers, Webpack, Jest, CI/CD, Figma.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-headline">Experience &amp; Focus</h3>
                        <ul className="list-disc list-inside space-y-2 text-body text-[var(--text-muted)]">
                            <li>React developer since 2017 focused on polished product UX.</li>
                            <li>Built scalable eCommerce, CMS, and PWA platforms with headless stacks.</li>
                            <li>Comfortable with component systems, performance tuning, and accessibility.</li>
                            <li>Collaborates closely with design and content teams to ship intentional UI.</li>
                            <li>Speaker and competition finalist (Ukrainian Dev Challenge IX &amp; XI).</li>
                        </ul>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['React / Next.js', 'TypeScript', 'UI systems', 'Performance', 'PWAs', 'Design collaboration'].map(
                            tag => (
                                <Badge key={tag} variant="muted">
                                    {tag}
                                </Badge>
                            ),
                        )}
                    </div>
                </section>

                <div className="flex flex-wrap gap-3">
                    <Link
                        href="https://github.com/jimbokid/jimbokid"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)]"
                    >
                        GitHub ↗
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/kovalchukyuriy/"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)]"
                    >
                        LinkedIn ↗
                    </Link>
                    <Link
                        href="https://buymeacoffee.com/jimbokid"
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition hover:brightness-110"
                    >
                        BuyMeACoffee ☕️
                    </Link>
                </div>

                <p className="text-caption">© {year} Yurii Kovalchuk — Open for work</p>
            </div>
        </div>
    );
}
