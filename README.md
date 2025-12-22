# 🎬 Movie Explorer — Demo Project

A modern **Next.js 14** demo project showcasing server-side rendered movie pages, lazy-loaded lists, and clean, responsive UI built with **Tailwind CSS**.  
This project demonstrates a professional production-ready setup combining **performance**, **code clarity**, and **developer experience**.

---

## 🚀 Tech Stack

**Frontend:**
- ⚛️ React (Hooks, Context API)
- 🔥 Next.js 14 (App Router)
- 💨 Tailwind CSS
- 🌀 TypeScript
- ⚙️ Axios (API requests)
- 🌙 SSR + CSR hybrid rendering
- 🧩 Dynamic routes for movie details

**Tooling & Build:**
- ESLint / Prettier setup
- Modern project structure
- Reusable components & helpers

---

## ⚡️ Features

- **Server-Side Rendered (SSR)** movie detail pages
- **Lazy-loaded** movie lists with infinite scroll
- **Clean, responsive** UI with Tailwind
- **Reusable components** for easy scalability
- **Static "About" page** with personal information and contact links

---

## 🌐 Live Demo

> 👨🏻‍💻 [Live Demo Application](https://movies-next-js-tau.vercel.app/)

---

## 🧠 About the Author

**Yurii Kovalchuk** — Frontend Developer  
🔹 10+ years in frontend, 4 years as **Lead Frontend Developer** in a European product company  
🔹 Certificates: *Microsoft Exam 480* & *Next.js Fundamentals*  
🔹 Open for new collaborations and gig contracts

📎 [GitHub](https://github.com/jimbokid)  
💼 [LinkedIn](https://www.linkedin.com/in/kovalchukyuriy/)

---

## ⚙️ Tech Highlights

JavaScript (ES6+), TypeScript, React.js (Hooks, Context API, Router), Next.js, Redux / Redux Toolkit, Styled-components, Material UI (v4–v5), Tailwind, SCSS, PostCSS, PWA, Service Workers, GraphQL (Apollo), REST (Axios, React Query), Storybook, Webpack, Jest, Git Flow, Azure DevOps CI/CD, Magento (Headless / PWA Studio), Adobe AEM, Figma, Adobe XD.

---

## 🧩 Getting Started

```bash
# 1. Clone repository
git clone https://github.com/jimbokid/movies-nextJs.git

# 2. Navigate to project folder
cd movies-nextJs

# 3. Install dependencies
npm install

# 4. Run development server
npm run dev
```

## 🔐 Environment variables for streaming availability

To enable the **Where to watch** integration powered by Movie of the Night, copy `.env.local.example` to `.env.local` and set:

- `MOVIE_OF_THE_NIGHT_API_KEY` – your API token from Movie of the Night.
- `MOVIE_OF_THE_NIGHT_BASE_URL` – endpoint that returns availability by TMDB movie id and country (defaults to the hosted API if omitted).

Links surfaced in the UI are gated by a provider allowlist located at `src/features/watch/watchLinkAllowlist.ts` to prevent unsafe redirects.
