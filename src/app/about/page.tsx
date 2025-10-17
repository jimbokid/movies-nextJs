import Link from "next/link";

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
                JavaScript (ES6+), TypeScript, React.js (Hooks, Context API, Router), Next.js, Redux / Redux Toolkit, Styled-components, Material UI (v4–v5), Tailwind, SCSS, PostCSS, PWA, Service Workers, GraphQL (Apollo), REST (Axios, React Query), Storybook, Webpack, Jest, Git Flow, Azure DevOps CI/CD, Magento (Headless / PWA Studio), Adobe AEM, Figma, Adobe XD.
            </p>

            {/* Experience */}
            <div className="bg-neutral-800 rounded-xl shadow-lg p-6 max-w-3xl text-left text-gray-200 mb-6">
                <ul className="list-disc list-inside space-y-2">
                    <li>10+ years in frontend development, 4 years as Lead Frontend Developer in a European product</li>
                    <li>Certificates: Microsoft Exam 480 & Next.js Fundamentals</li>
                    <li>Available for freelance / gig-contract collaboration</li>
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
                © {new Date().getFullYear()} Yuriy Kovalchuk — Open for work
            </p>
        </div>
    );
}
