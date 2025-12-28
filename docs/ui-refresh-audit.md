# CineView UI Refresh Audit

## Routes / Pages
- `/` (Trending dashboard)
- `/search` (global search with kind filter)
- `/detail/[type]/[id]` (movie/TV detail)
- `/person/[id]` (person detail)
- `/discover-ai` (mood-based AI discovery)
- `/curator` (AI curator flow)
- `/about` (profile page)

## Major Components Observed
- `Header` (global navigation)
- `MovieCard` / `PersonCard`
- Search controls: `SearchInput`, `SegmentedSwitch`
- Curator flow components (`CuratorClient`, `CuratorResults`, `CuratorSessionsDrawer`)
- Discover AI helpers (`Heading`, `ModeSwitch`, `LoadingOverlay`)
- Utility hooks (`useDashboard`, `useGlobalSearch`, `useCuratorSession`, `useDiscoverAi`)

## Visual Inconsistencies (Top 5)
1. **App shell drift:** different backgrounds and paddings per page (gradient glows vs solid backgrounds) causing inconsistent framing.
2. **Navigation style mismatch:** header gradient pill and CTA dominate while other pages use plain text links; no consistent active state.
3. **Typography variability:** headings range from text-2xl–5xl with mixed letter spacing; body text flips between gray shades and weights.
4. **Card spacing & hover:** movie/person cards vary in radius, shadows, and hover scale; lack of consistent focus states and layout stability.
5. **Loading/empty states:** spinners and skeletons differ per page; some pages show blank space or shifting layouts while loading.

