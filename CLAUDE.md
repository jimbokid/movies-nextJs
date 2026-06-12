# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build (Turbopack)
- `npm start` — serve production build
- `npm run lint` — ESLint

There is no test framework configured in this project.

## What this is

"CineView" — a movie discovery app (Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4) backed by the TMDB API, with AI-powered recommendation features that call OpenAI from Next.js API routes. Deployed on Vercel.

Path alias: `@/*` → `src/*`.

## Architecture

### Two data paths to TMDB

1. **Client-side browsing** (dashboard, search, detail, person pages): client hooks in `src/hooks/` use TanStack React Query (`useQuery`/`useInfiniteQuery`) and call service objects in `src/services/`, which hit TMDB directly with axios. These use the hardcoded `API_TOKEN`/`API_PATH` from `src/constants/appConstants.ts`.
2. **Server-side AI routes** (`src/app/api/ai-recommend/`, `src/app/api/ai-curator/`): use `TMDB_API_KEY` and other `TMDB_*` env vars (with fallbacks), not the constants file.

Detail pages (`src/app/detail/[type]/[id]/`, `src/app/person/[id]/`) are server components that fetch TMDB data during render and in `generateMetadata`; list/browse pages are client components.

React Query defaults (in `src/providers/ReactQueryProvider.tsx`): 5-minute `staleTime`, `refetchOnMount: false` — deliberate, so back-navigation doesn't refetch lists.

### AI features

Two separate flows, both `force-dynamic` API routes that prompt OpenAI (model from `OPENAI_MODEL` env, defaults set in the route files) and then resolve the suggested titles against TMDB search to attach posters/IDs:

- **Discover AI** (`/discover-ai` page → `useDiscoverAi` hook → `POST /api/ai-recommend`): user picks mood badges (defined in `src/data/moodBadges.ts`), gets a list of recommendations.
- **Curator** (`/curator` page → `useCuratorSession` hook → `POST /api/ai-curator`): a multi-step persona-driven flow. Personas live in `src/data/curators.ts`, context-question options in `src/data/curatorContext.ts`, refine policies/thinking lines in `src/constants/curatorThinking.ts`, and server-side mood rules in `src/app/api/ai-curator/moodRules.ts`. The route supports full runs plus swap/refine modes (`swap_primary`, `swap_alternative`, locked/rejected titles, mood drift). Sessions persist to localStorage (key `cineview.curator.sessions.v1`) via `src/utils/storage.ts` helpers, which are SSR-safe.

Both routes return graceful fallbacks when `OPENAI_API_KEY` is missing rather than erroring — keep that behavior when modifying them.

### Environment

`.env` (not committed) provides `OPENAI_API_KEY`, `OPENAI_MODEL`, `TMDB_API_KEY`, `TMDB_API_PATH`, `TMDB_LANGUAGE`, `TMDB_REGION`, `TMDB_INCLUDE_ADULT`. Only the AI API routes read env vars; client code does not.

## Conventions

- 4-space indentation, single quotes (Prettier is a dev dependency; match existing formatting).
- Types live in `src/types/`, one file per domain (movie, search, curator, discoverAi, dashboard, personalDetail); services return typed payloads from these files.
- Client components are marked `'use client'` explicitly; pages that need interactivity typically split into a thin `page.tsx` plus a `*Client.tsx` component (e.g. `src/app/curator/`, `src/app/search/`).
