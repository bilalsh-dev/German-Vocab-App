# Architecture Context

## Stack
| Layer            | Technology                 | Role                                                                 |
| ---------------- | -------------------------- | ------------------------------------------------------------------- |
| Framework        | Next.js 16 + TypeScript    | App shell with a thin server boundary (AI proxy only)               |
| UI               | Tailwind + shadcn/ui       | Component composition and styling                                   |
| i18n             | `next-intl`                | English/German UI localization via locale message files             |
| Client state     | Zustand (or React context) | Active deck, review-session queue, transient UI state, UI language  |
| Local storage    | IndexedDB via Dexie        | On-device persistence: decks, cards, scheduling state, review log, settings |
| Scheduler        | `ts-fsrs` (FSRS) behind a pure TS interface | Spaced-repetition algorithm in one place behind a stable interface; FSRS via `ts-fsrs` for v1, other schemes swappable; no I/O, no React |
| AI (optional)    | Anthropic API via route handler | Server-side proxy that drafts structured cards; keeps the API key off the client |

There is no auth and no server database in v1. The only server code is the optional AI proxy.

## System Boundaries
- `app` — Pages and client components. Most of the app is client-side because it is interactive and offline-capable.
- `app/api/ai` — The only server code: a route handler that proxies AI card-drafting requests. No database, no long-lived work, no app state.
- `lib/scheduler` — The pure spaced-repetition engine. The single place the algorithm lives: a thin wrapper over `ts-fsrs` behind one stable interface, so other schemes (SM-2, Leitner) are interchangeable without touching anything else.
- `lib/db` — Dexie setup, IndexedDB schema, and data-access helpers for decks, cards, the review log, and settings.
- `lib/content` — Card content-model types and the pure helpers that derive presentation hints (gender color, gender-by-ending hints, gender-by-group hints) from a card. No I/O, no React.
- `lib/io` — Import/export (CSV/JSON) and the client-side AI request helper.
- `components` — UI surfaces: app shell (nav/footer/content), deck list, review screen, card editor, card renderer, stats/forecast, dialogs.
- `messages` — i18n locale files (`en.json`, `de.json`) consumed by `next-intl`.
- `public/starter-decks` — The curated German A1 starter deck shipped as static JSON.

## Card Data Model
A card is a single record whose fields depend on `partOfSpeech`. Types live in `lib/content`. The shape below is the contract every layer (storage, editor, renderer, starter deck, AI drafting) agrees on.

```ts
type Gender = "masculine" | "feminine" | "neuter";
type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "phrase" | "other";
type VowelLength = "long" | "short";          // long → underline, short → under-dot

// Marks pronunciation length on a vowel at a character index in the German headword.
interface VowelMark {
  index: number;        // character offset into the German word
  length: VowelLength;
}

interface ExampleSentence {
  de: string;           // German sentence
  en: string;           // English translation
  verbForm?: "praesens" | "praeteritum" | "perfekt"; // which form this exercises (verbs)
}

interface RelatedWord {
  german: string;
  english?: string;
  relation: "nominalization" | "derived" | "compound" | "related";
}

interface NounData {
  gender: Gender;
  plural: string;                 // e.g. "die Kinder"
  genderEndingHint?: string;      // e.g. "-heit/-keit/-schaft → feminine"
  genderGroupHint?: string;       // e.g. "weather words are masculine"
}

interface VerbData {
  praesens: string;               // present (note irregular stem changes)
  praeteritum: string;            // simple past (P2)
  perfekt: string;                // auxiliary + participle, e.g. "hat gegessen"
  auxiliary: "haben" | "sein";
}

interface AdjectiveData {
  opposites?: string[];           // antonyms
  synonyms?: string[];
  comparative?: string;           // only if irregular / A1-relevant
  superlative?: string;
}

interface Card {
  id: string;
  deckId: string;
  partOfSpeech: PartOfSpeech;

  english: string;                // FRONT — the prompt
  german: string;                 // BACK — the headword
  vowelMarks: VowelMark[];        // pronunciation length annotations

  noun?: NounData;                // present iff partOfSpeech === "noun"
  verb?: VerbData;                // present iff partOfSpeech === "verb"
  adjective?: AdjectiveData;      // present iff partOfSpeech === "adjective"

  related: RelatedWord[];
  examples: ExampleSentence[];    // 3–4; verbs cover all three forms

  topic: string;                  // one topic (Familie, Büro, Leben, …)
  tags: string[];                 // cross-cutting
  notes?: string;

  scheduling: SchedulingState;    // algorithm-specific, see below
  createdAt: number;
  updatedAt: number;
}
```

Presentation rules (gender color, which hint to show) are **derived** from this data by pure helpers in `lib/content`; they are never stored as styling. See `ui-context.md` for the color/typography conventions.

## Storage Model
- **IndexedDB (Dexie)**: the single source of truth in v1. No server database.
- Object stores: `decks`, `cards`, `reviewLog`, and `settings` (algorithm parameters, UI language, and study direction).
- A card references its deck by `deckId`; cards are indexed by `deckId`, `topic`, and `scheduling.due`.
- Scheduling state lives **on the card record** and depends on the active algorithm (FSRS: `difficulty`, `stability`, `due`; SM-2: `interval`, `repetition`, `easiness`, `due`). The UI never recomputes it independently.
- `reviewLog` records each graded review, which feeds stats and the due-date forecast.
- Exports are generated on demand and downloaded; nothing is persisted server-side.
- Because storage is per-browser, data is per-device. The Growth Path resolves this.

## Internationalization
- `next-intl` provides UI localization. Locale message files live in `messages/en.json` and `messages/de.json`.
- Components read strings through i18n hooks/keys; **no UI string is hardcoded**.
- The selected UI language is persisted in the `settings` store so it survives restarts.
- i18n covers **interface chrome only**. Card content (German vocabulary and its English prompts) is data in IndexedDB, not translation keys.

## Scheduling and Session Model
This is the core domain model of the app.

### Scheduling
- Input: a card's current state and a grade (`again` | `hard` | `good` | `easy`).
- Execution: a synchronous, pure function in `lib/scheduler`. No side effects, no network, no React.
- Output: the card's next scheduling state. The caller derives the due date and writes the updated card to IndexedDB.

### Algorithm choice
- **v1 default: FSRS via `ts-fsrs`.** FSRS is the modern standard (Anki's default since 2023) and reaches the same retention with ~20–30% fewer reviews than SM-2. `ts-fsrs` is TypeScript-native and browser-safe, which fits the local-first client.
- **What we own:** the `lib/scheduler` interface and the tunable parameters (request retention, maximum interval, FSRS weights) — not the algorithm's math. Scheduling stays first-class and tunable without hand-writing a scheduler.
- **Interval previews:** `ts-fsrs`'s `repeat()` returns the resulting state for all four grades at once, mapping directly onto the per-button previews in the review UI.
- **Swappable:** SM-2 or Leitner can replace FSRS behind the same `lib/scheduler` interface with no change to storage, UI, or the session loop. Only the algorithm-specific fields on the card differ.

### Review session
- Input: all cards in the active deck with `scheduling.due <= now`.
- Execution: a client-side queue. `again`-graded cards re-circulate within the session; correctly graded cards leave the queue.
- Output: the updated card record is persisted before advancing to the next card.

### Study direction
- A user setting (`studyDirection: "english-front" | "german-front" | "mix"`, default `english-front`) stored in the `settings` store.
- This is a **presentation choice only**: it decides which side of a card is the prompt. `mix` randomizes the prompt side per card at review time.
- Scheduling is unchanged by direction — each card has a single `scheduling` state and one due date regardless of which side is shown (shared schedule). Direction never creates a second review item.
- The full German rendering (gender color, vowel marks, forms) always appears on the German side, whether that side is the prompt or the reveal.

## Starter Decks
- The curated German A1 deck is static JSON in `public/starter-decks`, fully populated against the Card Data Model (gender, vowel marks, forms, examples, topics).
- On import, its cards are copied into IndexedDB as real, editable cards using the identical schema as user-created cards.
- Decks are resolved by deck ID at import time; they require no separate persistent record before import.

## AI Card Drafting (Optional)
- Input: a single word, or a topic the user picks.
- Execution: the client calls `app/api/ai`, which calls the model provider and returns **draft cards already shaped to the Card Data Model**. The provider key never reaches the browser.
- Output: editable draft cards shown in the editor. They are written to IndexedDB only after the user confirms — never auto-saved.

## Invariants
1. The scheduler is pure: no storage, network, or React inside it. The same card and grade always produce the same next state.
2. Scheduling state lives on the card record; the UI reads it and never recomputes it independently.
3. Every card carries both languages; presentation hints (gender color, vowel marks) are derived from card data, never stored as styling.
4. Study direction is presentation-only: it selects the prompt side but never changes a card's scheduling. A card always has exactly one scheduling state and one due date (shared schedule).
4. Part-of-speech-specific data is only present for the matching part of speech (a noun has `noun`, a verb has `verb`, etc.).
5. UI strings come from locale files; no hardcoded interface text. Card content is data, not i18n keys.
6. The AI provider key never reaches the client — all model calls pass through the server route.
7. Server routes do no long-lived work and hold no durable state; the client's IndexedDB is the source of truth.
8. Imported starter-deck cards use the same card schema as user-created cards.
9. Persistence is last-write-wins per card; every grade writes the updated card before the session advances.
10. The card record stores whatever scheduling state the active algorithm needs; switching algorithms changes only those fields, never the rest of the schema.

---

## Appendix: Growth Path (accounts + multi-device sync)
Everything above is intentionally local-first. If you later want your progress on more than one device, the following are added — and this is where a heavier server stack legitimately reappears:
- **Auth** (Clerk or Auth.js) for user identity and route protection.
- **Server database** (Prisma + PostgreSQL) mirroring the IndexedDB schema; each record gains a `userId`.
- **Sync layer**: IndexedDB becomes a local cache, reconciled against the server. Last-write-wins per record is the simplest reconciliation; per-field CRDTs are the conflict-free upgrade if multiple devices edit offline.
- The AI route already lives server-side, so it is unaffected.

Keep v1 local-first until multi-device is a real need — adding this earlier buys complexity you cannot yet use.
