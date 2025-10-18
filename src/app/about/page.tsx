import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center text-center px-4 py-12 text-white">
            {/* Badge / Tagline */}
            <span className="bg-yellow-500 text-black font-semibold px-4 py-1 rounded-full uppercase tracking-wide text-sm mb-4">
                ⚡️ Tech Highlights
            </span>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
                Yurii Kovalchuk — Frontend Developer
            </h1>

            {/* Tech Highlights */}
            <p className="text-gray-300 max-w-3xl mb-6 leading-relaxed text-base sm:text-lg">
                JavaScript (ES6+), TypeScript, React.js (Hooks, Context API, Router), Next.js, Redux
                / Redux Toolkit, Styled-components, Material UI (v4–v5), Tailwind, SCSS, PostCSS,
                PWA, Service Workers, GraphQL (Apollo), REST (Axios, React Query), Storybook,
                Webpack, Jest, Git Flow, Azure DevOps CI/CD, Magento (Headless / PWA Studio), Adobe
                AEM, Figma, Adobe XD.
            </p>

            {/* Experience */}
            <div className="bg-neutral-800 rounded-xl shadow-lg p-6 max-w-3xl text-left text-gray-200 mb-6">
                <ul className="list-disc list-inside space-y-2">
                    <li>
                        React Developer since 2017, experienced with Hooks, Context API,
                        useCallback, Redux / Redux Toolkit, Styled-components, Storybook, React
                        Router, Axios, React Query, React Hook Form, Formik, React Native,
                        WebSocket, and more.
                    </li>
                    <li>
                        Skilled in building scalable, high-performance applications, including
                        complex eCommerce and CMS solutions, headless architectures, and PWA
                        platforms.
                    </li>
                    <li>
                        Strong expertise in JavaScript core concepts, TypeScript, and
                        component-driven development.
                    </li>
                    <li>
                        Proficient in Agile/SCRUM/Kanban workflows and committed to clean code,
                        testing, and maintainable architecture.
                    </li>
                    <li>
                        Experienced in working closely with design, content, and executive teams to
                        deliver polished, user-focused products.
                    </li>
                    <li>
                        Speaker at CoreCamp conference; finalist and winner of Ukrainian Dev
                        Challenge IX & XI (Frontend, Pro Category).
                    </li>
                </ul>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Link
                    href="https://github.com/jimbokid/jimbokid"
                    target="_blank"
                    className="bg-neutral-800 hover:bg-yellow-500 hover:text-black text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
                >
                    GitHub
                </Link>
                <Link
                    href="https://www.linkedin.com/in/kovalchukyuriy/"
                    target="_blank"
                    className="bg-neutral-800 hover:bg-yellow-500 hover:text-black text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
                >
                    LinkedIn
                </Link>
            </div>

            {/* Footer note */}
            <p className="text-gray-500 text-sm mt-12">
                © {new Date().getFullYear()} Yurii Kovalchuk — Open for work
            </p>
        </div>
    );
}
