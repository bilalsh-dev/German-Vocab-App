# Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component or route.
- Respect the system boundaries defined in `architecture-context.md`.

## TypeScript

- Strict mode is required throughout the project.
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts.

## Next.js

- Default to React Server Components for static shell pieces.
- Add `"use client"` for anything interactive or stateful — most of this app is client-side because it is offline-capable and reads/writes IndexedDB.
- The only server code is the optional AI proxy route (`app/api/ai`); keep it thin and single-purpose.
- Route handlers do no long-lived work and hold no durable state.

## Styling

- Use CSS custom property tokens defined in `globals.css` — no raw Tailwind color classes like `zinc-*` or hardcoded hex values.
- Reference tokens through their Tailwind utility names: `bg-base`, `text-copy-primary`, `border-surface-border`, `text-brand`, etc.
- Maintain the border radius scale: `rounded-xl` for small elements, `rounded-2xl` for cards, `rounded-3xl` for modals.
- Gender color comes from the `--gender-*` tokens via a helper in `lib/content`; never hardcode which color maps to which word or gender in a component.
- Color is never the only signal for gender — always render it alongside the article (`der`/`die`/`das`).

## Internationalization

- All user-facing UI strings come from locale files (`messages/en.json`, `messages/de.json`) via `next-intl` — no hardcoded interface text.
- Card content (German words, English prompts, examples) is data from IndexedDB, not i18n keys. Do not put vocabulary in locale files.
- Persist the selected UI language in the `settings` store; read it on load.

## Content Model

- The Card Data Model in `architecture-context.md` is the single contract. Storage, the editor, the renderer, the starter deck, and AI drafting all use the same types from `lib/content`.
- Part-of-speech-specific data (`noun`/`verb`/`adjective`) is present only for the matching part of speech.
- Presentation hints (gender color, gender-by-ending/group hints, vowel marks) are **derived** from card data by pure helpers in `lib/content` — never stored as styling and never recomputed ad hoc in components.

## API Routes

- The only route is the optional AI proxy (`app/api/ai`).
- Validate and parse request input before any logic runs.
- Never expose the AI provider key to the client — it stays server-side.
- Return consistent, predictable response shapes; keep the handler thin.

## Data and Storage

- IndexedDB (via Dexie) is the single source of truth in v1 — no server database.
- All persistence goes through `lib/db`; components and the scheduler never touch IndexedDB directly.
- Scheduling state lives on the card record and is written by the caller, not recomputed in the UI.
- Persistence is last-write-wins per card; every grade writes the updated card before the session advances.
- Exports are generated on demand client-side; nothing is persisted server-side.

## File Organization

- `lib/scheduler` — the pure spaced-repetition engine; no I/O, no React.
- `lib/db` — Dexie setup, IndexedDB schema, and data-access helpers.
- `lib/io` — import/export (CSV/JSON) and the client-side AI request helper.
- `lib/utils.ts` — shared utilities (e.g. the `cn()` class-merge helper).
- `components/` — UI composition only; no business logic.
- `app/api/ai` — the single server route (AI card drafting).
- Name files after the responsibility they contain, not the technology.