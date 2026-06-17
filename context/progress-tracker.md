# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase
- Spec-driven setup complete. Implementation begins at Feature 01.

## Current Goal
- Feature 01 — Design system & UI primitives (`context/feature-specs/01-design-system.md`): shadcn/ui, `lib/utils.ts` `cn()`, and the full token set in `globals.css` (theme + gender + state colors, vowel-mark styling).

## Completed
- Project scaffolded: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4, pnpm. (commit `01a595e`)
- Vitest + React Testing Library configured; `test` / `test:watch` / `test:coverage` scripts.
- Boilerplate cleaned: `globals.css` stripped to `@import "tailwindcss";`, all `public/*.svg` removed, minimal `app/page.tsx` rendering the app name.
- Project named **Wortbox**. (commit `38fe462`)
- Context docs rewritten to capture the full problem: German A1, English-front cards, the Card Content Model (gender colors, vowel-length marks, verb forms, related words, opposites/synonyms, topics/tags, examples), and bilingual (EN/DE) UI.

## Feature Roadmap (`context/feature-specs/`)
1. `01-design-system.md` — shadcn/ui, `cn()`, design tokens (theme + gender + state), vowel-mark styling.
2. `02-app-shell.md` — top nav, content area, footer; responsive single-window layout.
3. `03-i18n.md` — `next-intl`, `en`/`de` locale files, language switcher, persisted language.
4. `04-card-data-model.md` — `lib/content` types + `lib/db` Dexie stores for cards/decks/reviewLog/settings.
5. `05-card-rendering.md` — front/back renderer: gender color, vowel marks, POS blocks, examples.
6. `06-deck-and-card-management.md` — deck CRUD, structured card editor with live preview, tags/topics.
7. `07-review-session.md` — `lib/scheduler` (FSRS via `ts-fsrs`), due queue, flip/grade, interval previews.
8. `08-stats-and-forecast.md` — per-deck counts, due forecast, per-card interval curve.
9. `09-import-export-and-a1-starter-deck.md` — CSV/JSON I/O + curated A1 starter deck.
10. `10-ai-card-drafting.md` — optional `app/api/ai` proxy producing model-shaped draft cards.

## In Progress
- None.

## Next Up
- Implement Feature 01, then proceed through the roadmap in order.

## Open Questions
- Light-mode values for all tokens (theme + gender) need finalizing during Feature 01.
- Exact A1 word list / source for the starter deck (Feature 09) — needs the learner's coursebook scope (e.g. Netzwerk A1 chapters).
- i18n library is specced as `next-intl`; confirm before install in Feature 03 if a different one is preferred.

## Architecture Decisions
- v1 is local-first: IndexedDB (Dexie) is the single source of truth; no server DB, no auth. (`architecture-context.md`)
- Cards carry both languages; presentation hints are derived from card data, never stored as styling.
- Study direction (English-front default / German-front / Mix) is a presentation setting over a **single shared schedule** — it flips the prompt side but never changes a card's due date or creates a second review item. Stored in `settings`.
- Gender color mapping: masculine → blue, feminine → red, neuter → green.
- Vowel length: long → underline, short → under-dot (Netzwerk convention).
- UI is bilingual (EN/DE) via `next-intl`; card content is data, not i18n keys.
- Default scheduler is **FSRS via `ts-fsrs`** (chosen after comparing npm options — the clear standard, ~64k weekly downloads, TS-native, browser-safe) behind one stable `lib/scheduler` interface; SM-2/Leitner remain swappable. We own the interface and parameters, not the algorithm math. `ts-fsrs` is added as a dependency in Feature 07.
- The only server code is the optional AI proxy route (`app/api/ai`).

## Session Notes
- 2026-06-17: Reviewed and completed the context folder — removed residual references to the source starter template, fixed the broken color table, realigned `code-standards.md` to the local-first architecture.
- 2026-06-17: Named the project **Wortbox** across package, app metadata, page, and context docs.
- 2026-06-17: Captured the full German A1 problem statement in the context docs and produced the feature-spec roadmap (01–10).
- 2026-06-17: Added switchable study direction (English-front default / German-front / Mix) as a presentation setting over a shared schedule; threaded through overview, architecture, UI, and specs 04/05/07.
- 2026-06-17: Compared spaced-repetition npm packages and chose **FSRS via `ts-fsrs`** as the v1 algorithm (instead of hand-rolling SM-2); updated overview, architecture, and specs 04/07.
