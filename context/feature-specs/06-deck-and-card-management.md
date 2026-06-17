Read `AGENTS.md` before starting.

# Feature 06 — Deck & Card Management

We're adding deck CRUD and the structured card editor. Depends on Features 04 (model/storage) and 05 (rendering, for live preview).

## Decks

- Deck list (home, `/`): responsive grid of deck cards showing name and due / new / total counts, plus a "create deck" action.
- Create, rename, and delete decks. A deck maps to a topic (Familie, Büro, Leben, …).
- Deleting a deck prompts for confirmation and removes its cards.

## Card Editor

- A dialog or slide-over with structured fields matching the Card Data Model:
  - English (front), German (back), part of speech.
  - Vowel marks: a control to mark vowels long/short on the German word.
  - POS-specific fields: noun (gender, plural), verb (Präsens/Präteritum/Perfekt + auxiliary), adjective (opposites, synonyms).
  - Related words, 3–4 example sentences (verb examples tagged by form), topic, tags, notes.
- **Live preview** of the rendered back (Feature 05) updates as fields change.
- Gender-ending / group hints surface automatically (from Feature 04 helpers) to assist entry.
- Add, edit, delete cards; filter a deck's cards by tag or topic.

## Constraints

- All writes go through `lib/db` helpers.
- Validate POS-specific fields before save (a noun needs gender + plural; a verb needs all three forms).
- UI labels via i18n; vocabulary is data.

### Check when done
- A user can create a deck, add a noun/verb/adjective card with full fields, edit, and delete.
- Live preview matches the saved card's rendering.
- Validation blocks incomplete POS data.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
