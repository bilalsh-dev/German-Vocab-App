Read `AGENTS.md` before starting.

# Feature 09 — Import / Export & German A1 Starter Deck

We're adding bulk import/export and shipping a curated German A1 starter deck. Depends on Feature 04 (model/storage).

## Import / Export (`lib/io`)

- Export a deck (or all decks) to JSON and CSV, generated on demand and downloaded. Nothing is sent to a server.
- Import JSON/CSV back into IndexedDB through `lib/db` helpers.
- JSON round-trips the full Card Data Model. CSV covers the core fields with a documented column mapping (rich fields like `vowelMarks`/`examples` JSON-encoded in a cell).
- Validate imported rows against the model before writing; report rejected rows.

## A1 Starter Deck

- A curated deck shipped as static JSON in `public/starter-decks`, fully populated against the Card Data Model: gender, vowel marks, plural/conjugations, related words, opposites/synonyms, topics, tags, and 3–4 examples per card.
- Organized by topic (Familie, Büro, Leben, …).
- On import, cards are copied into IndexedDB as real, editable, user-owned cards using the identical schema.
- Content scope follows the owner's A1 source (e.g. Netzwerk A1) — confirm the word list / chapters before authoring (see `progress-tracker.md` open question). Build the importer and schema first; author/expand content incrementally.

## Constraints

- Imported starter cards are indistinguishable from user-created cards after import.
- All vocabulary lives in the deck data, never in i18n locale files.

### Check when done
- A deck exports to JSON and CSV and re-imports without data loss (JSON round-trip).
- The A1 starter deck imports as editable cards and is immediately studyable.
- Invalid import rows are rejected with a clear report.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
