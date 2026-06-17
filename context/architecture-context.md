# Architecture Context

## Stack
| Layer            | Technology                 | Role                                                                 |
| ---------------- | -------------------------- | ------------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript    | App shell with a thin server boundary (AI proxy only)               |
| UI               | Tailwind + shadcn/ui       | Component composition and styling                                   |
| Client state     | Zustand (or React context) | Active deck, review-session queue, transient UI state               |
| Local storage    | IndexedDB via Dexie        | On-device persistence: decks, cards, scheduling state, review log   |
| Scheduler        | Pure TS module — hand-rolled SM-2, swappable to `ts-fsrs` | Spaced-repetition algorithm behind a stable interface; own SM-2 for v1, drop-in FSRS later; no I/O, no React |
| AI (optional)    | Anthropic API via route handler | Server-side proxy that drafts cards; keeps the API key off the client |

## System Boundaries
- `app` — Pages and client components. Most of the app is client-side because it is interactive and offline-capable.
- `app/api/ai` — The only server code: a route handler that proxies AI card-drafting requests. No database, no long-lived work, no app state.
- `lib/scheduler` — The pure spaced-repetition engine. The single place the algorithm lives, exposed behind one stable interface so a hand-rolled SM-2 and a library like `ts-fsrs` are interchangeable without touching anything else.
- `lib/db` — Dexie setup, IndexedDB schema, and data-access helpers for decks, cards, and the review log.
- `lib/io` — Import/export (CSV/JSON) and the client-side AI request helper.
- `components` — UI surfaces: deck list, review screen, card editor, stats/forecast, and dialogs.
- `public/starter-decks` — Bundled starter decks shipped with the app as static JSON.

## Storage Model
- **IndexedDB (Dexie)**: the single source of truth in v1. No server database.
- Object stores: `decks`, `cards`, `reviewLog`, and `settings` (algorithm parameters).
- A card references its deck by `deckId`.
- Scheduling state lives **on the card record** and depends on the active algorithm (SM-2: `interval`, `repetition`, `easiness`, `due`; FSRS: `difficulty`, `stability`, `due`). It is never recomputed independently by the UI.
- `reviewLog` records each graded review, which feeds stats and the due-date forecast.
- Exports are generated on demand and downloaded; nothing is persisted server-side.
- Because storage is per-browser, data is per-device. This is the tradeoff that the Growth Path resolves.

## Scheduling and Session Model
This is the core domain model of the app.

### Scheduling
- Input: a card's current state and a grade (`again` | `hard` | `good` | `easy`).
- Execution: a synchronous, pure function in `lib/scheduler`. No side effects, no network, no React.
- Output: the card's next scheduling state (field shape depends on the algorithm). The caller derives the due date and writes the updated card to IndexedDB.

### Algorithm choice
- **v1 default: a hand-rolled SM-2 variant.** It is written by hand on purpose — owning and tuning the logic is a goal of the project, and SM-2 is ~25 lines.
- **Drop-in upgrade: `ts-fsrs`.** FSRS is the modern standard (Anki's default since 2023) and reaches the same retention with 20–30% fewer reviews. Its `repeat()` returns the resulting state for all four grades at once, which maps directly onto the per-button interval previews in the review UI.
- The two are interchangeable because both sit behind the same `lib/scheduler` interface; swapping requires no change to storage, UI, or the session loop. Only the algorithm-specific fields on the card record differ.

### Review session
- Input: all cards in the active deck with `due <= now`.
- Execution: a client-side queue. `again`-graded cards re-circulate within the session; correctly graded cards leave the queue.
- Output: the updated card record is persisted before advancing to the next card.

## Starter Decks
- Prebuilt decks are static JSON stored in the codebase (`public/starter-decks`).
- On import, their cards are copied into IndexedDB as real, editable cards owned by the user.
- Imported cards use the identical schema as user-created cards.
- Decks are resolved by deck ID at import time; they require no separate persistent record before import.

## AI Card Drafting (Optional)
- Input: a single word, or a topic/block of text the user pastes.
- Execution: the client calls `app/api/ai`, which calls the model provider and returns draft cards. The provider key never reaches the browser.
- Output: editable draft cards shown in the editor. They are written to IndexedDB only after the user confirms — never auto-saved.

## Invariants
1. The scheduler is pure: no storage, network, or React inside it. The same card and grade always produce the same next state.
2. Scheduling state lives on the card record; the UI reads it and never recomputes it independently.
3. The AI provider key never reaches the client — all model calls pass through the server route.
4. Server routes do no long-lived work and hold no durable state; the client's IndexedDB is the source of truth.
5. Imported starter decks use the same card schema as user-created cards.
6. Persistence is last-write-wins per card; every grade writes the updated card before the session advances.
7. The card record stores whatever scheduling state the active algorithm needs; switching algorithms changes only those fields, never the rest of the schema.

---

## Appendix: Growth Path (accounts + multi-device sync)
Everything above is intentionally local-first. If you later want your progress on more than one device, the following are added — and this is where a heavier server stack legitimately reappears:
- **Auth** (Clerk or Auth.js) for user identity and route protection.
- **Server database** (Prisma + PostgreSQL) mirroring the IndexedDB schema; each record gains a `userId`.
- **Sync layer**: IndexedDB becomes a local cache, reconciled against the server. Last-write-wins per record is the simplest reconciliation; per-field CRDTs are the conflict-free upgrade if multiple devices edit offline.
- The AI route already lives server-side, so it is unaffected.

Keep v1 local-first until multi-device is a real need — adding this earlier buys complexity you cannot yet use.