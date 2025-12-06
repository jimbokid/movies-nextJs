import Link from 'next/link';

export default function AboutPage() {
    const year = new Date().getFullYear();

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white overflow-hidden pt-18">
            {/* Soft background glows */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-500/25 blur-3xl" />
                <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/15 blur-[90px]" />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 py-16">
                {/* Top pill + title */}
                <div className="mb-8 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-purple-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_0_4px_rgba(168,85,247,0.35)]" />
                        Profile
                    </span>

                    <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                        <span className="bg-gradient-to-r from-purple-100 via-white to-purple-200 bg-clip-text text-transparent">
                            Yurii Kovalchuk
                        </span>
                    </h1>

                    <p className="mt-3 text-base sm:text-lg text-gray-300">
                        Senior Frontend Engineer · React &amp; Next.js enthusiast · Product-minded developer
                    </p>
                </div>

                {/* Main content card */}
                <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] p-6 sm:p-8 space-y-8">
                    {/* Tech stack */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold text-white">Tech Highlights</h2>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                            JavaScript (ES6+), TypeScript, React.js (Hooks, Context API, Router), Next.js,
                            Redux / Redux Toolkit, Styled-components, Material UI (v4–v5), Tailwind, SCSS,
                            PostCSS, PWA, Service Workers, GraphQL (Apollo), REST (Axios, React Query),
                            Storybook, Webpack, Jest, Git Flow, Azure DevOps CI/CD, Magento (Headless / PWA
                            Studio), Adobe AEM, Figma, Adobe XD.
                        </p>
                    </div>

                    {/* Experience bullets */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-semibold text-white">Experience &amp; Focus</h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-200">
                            <li>
                                React Developer since 2017, experienced with Hooks, Context API, useCallback,
                                Redux / Redux Toolkit, Styled-components, Storybook, React Router, Axios,
                                React Query, React Hook Form, Formik, React Native, WebSocket, and more.
                            </li>
                            <li>
                                Skilled in building scalable, high-performance applications, including complex
                                eCommerce and CMS solutions, headless architectures, and PWA platforms.
                            </li>
                            <li>
                                Strong expertise in JavaScript core concepts, TypeScript, and component-driven
                                development.
                            </li>
                            <li>
                                Proficient in Agile/SCRUM/Kanban workflows and committed to clean code, testing,
                                and maintainable architecture.
                            </li>
                            <li>
                                Experienced in collaborating with design, content, and leadership teams to
                                deliver polished, user-focused products.
                            </li>
                            <li>
                                Speaker at CoreCamp conference; finalist and winner of Ukrainian Dev Challenge
                                IX &amp; XI (Frontend, Pro Category).
                            </li>
                        </ul>
                    </div>

                    {/* Quick tags row */}
                    <div className="pt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
                        {[
                            'React / Next.js',
                            'TypeScript',
                            'UI/UX mindset',
                            'Performance',
                            'PWAs',
                            'Headless eCommerce',
                        ].map(tag => (
                            <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-gray-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Links */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="https://github.com/jimbokid/jimbokid"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition hover:border-purple-300/70 hover:bg-purple-500/15 hover:-translate-y-0.5"
                    >
                        GitHub
                        <span className="text-lg leading-none">↗</span>
                    </Link>
                    <Link
                        href="https://www.linkedin.com/in/kovalchukyuriy/"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition hover:border-amber-300/70 hover:bg-amber-500/15 hover:-translate-y-0.5"
                    >
                        LinkedIn
                        <span className="text-lg leading-none">↗</span>
                    </Link>
                </div>

                {/* Footer */}
                <p className="mt-10 text-center text-xs sm:text-sm text-gray-500">
                    © {year} Yurii Kovalchuk — Open for work
                </p>
            </div>
        </main>
    );
}
