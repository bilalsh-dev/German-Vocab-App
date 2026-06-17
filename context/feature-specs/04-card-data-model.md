Read `AGENTS.md` before starting.

# Feature 04 — Card Data Model & Storage

We're implementing the Card Data Model and the IndexedDB persistence layer. This is the contract every later feature depends on. Read the **Card Data Model** and **Storage Model** sections of `architecture-context.md` first — implement them exactly.

## Types (`lib/content`)

Implement the model from `architecture-context.md` as TypeScript types:
- `Gender`, `PartOfSpeech`, `VowelLength`, `VowelMark`, `ExampleSentence`, `RelatedWord`.
- `NounData`, `VerbData`, `AdjectiveData`.
- `Card` (English front, German back, `vowelMarks`, POS-specific data, `related`, `examples`, `topic`, `tags`, `scheduling`, timestamps).
- `Deck` and `ReviewLogEntry` types.
- `SchedulingState` as a discriminated union; the FSRS variant (`difficulty`, `stability`, `due`, plus FSRS card state) is v1, with SM-2/Leitner variants addable behind the same union.

## Derivation Helpers (`lib/content`)

Pure functions, no I/O, no React:
- `genderColorToken(card)` → which `--gender-*` token applies (or none).
- `genderEndingHint(german)` → optional hint from suffix rules (`-heit/-keit/-schaft/-ung/-tion` → feminine; `-chen/-lein` → neuter; `-er`/`-ling` → masculine; …).
- `genderGroupHint(card)` → optional hint for fixed-gender groups (weather, seasons, months, days → masculine; …).
- Validation: assert POS-specific data matches `partOfSpeech`.

## Storage (`lib/db`)

- Dexie database with stores: `decks`, `cards`, `reviewLog`, `settings`.
- Indexes: cards by `deckId`, `topic`, and `scheduling.due`.
- Data-access helpers (create/read/update/delete) for each store. Components and the scheduler never touch Dexie directly — only through these helpers.
- `settings` holds algorithm parameters, the UI language, and the study direction (`english-front` | `german-front` | `mix`, default `english-front`).

## Constraints

- POS-specific data is present only for the matching part of speech.
- Scheduling state lives on the card; helpers derive presentation but never persist styling.

### Check when done
- Types compile; a card can be created, read, updated, and deleted via `lib/db`.
- Derivation helpers are unit-tested (gender color, ending/group hints, validation) — these are pure and must have tests.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
