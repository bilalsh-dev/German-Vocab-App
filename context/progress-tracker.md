# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Feature 01 — Design system & UI primitives (`context/feature-specs/01-design-system.md`)

## Current Goal
- Install and configure shadcn/ui, add the base primitives, create `lib/utils.ts` with `cn()`, and define the dark-theme color tokens in `globals.css` per `ui-context.md`.

## Completed
- Project scaffolded: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4, pnpm. (commit `01a595e`)
- Vitest + React Testing Library configured (`vitest.config.ts`, `vitest.setup.ts`); `test` / `test:watch` / `test:coverage` scripts.
- Boilerplate cleaned: `globals.css` stripped to `@import "tailwindcss";`, all `public/*.svg` removed, minimal `app/page.tsx` rendering the app name ("Wortbox").

## In Progress
- None.

## Next Up
1. Feature 01 — design system (current phase).
2. `lib/db` — Dexie schema for `decks`, `cards`, `reviewLog`, `settings`.
3. `lib/scheduler` — pure SM-2 variant behind the stable scheduler interface.
4. Deck list (home) and card editor.
5. Review session loop with interval previews.
6. Stats & upcoming-due forecast.

## Open Questions
- Color tokens are documented in `ui-context.md` but not yet written to `globals.css`; Feature 01 implements them. Light-mode values still need to be finalized.

## Architecture Decisions
- v1 is local-first: IndexedDB (Dexie) is the single source of truth; no server DB, no auth. (`architecture-context.md`)
- Default scheduler is a hand-rolled SM-2 variant, swappable to `ts-fsrs` behind one interface.
- The only server code is the optional AI proxy route (`app/api/ai`).

## Session Notes
- 2026-06-17: Reviewed and completed the context folder — removed residual references to the source starter template, fixed the broken color table, and realigned `code-standards.md` storage/API/file-org rules to the local-first architecture.
- 2026-06-17: Named the project **Wortbox** across package, app metadata, page, and context docs.
