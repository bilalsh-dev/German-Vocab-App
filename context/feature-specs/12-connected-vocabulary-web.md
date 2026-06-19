Read `AGENTS.md` before starting.

# Feature 12 — Connected Vocabulary Web

`prompt.md`'s central thesis is "a web of associations rather than isolated vocabulary": every word connects to synonyms, opposites, word families, and related vocabulary. Two gaps block this today — synonyms/opposites exist only on adjectives, and related words render as inert text. This feature makes connections first-class and navigable. Depends on Feature 04 (model), 05 (rendering), 06 (editor).

## Part A — Synonyms & opposites on every part of speech (`lib/content`)

- `prompt.md` lists synonyms and opposites as required for **every** word (noun example `das Gebäude`, verb example `tätig sein`), but `synonyms`/`opposites` live only on `AdjectiveData`.
- Lift `synonyms?: string[]` and `opposites?: string[]` to **common** `Card` fields (available regardless of `partOfSpeech`); keep `AdjectiveData.comparative`/`superlative` POS-specific.
- Thread the change through every layer that agrees on the model: validation (`lib/content/validation.ts`), the draft form (`card-draft.ts` + the editor `card-editor-dialog`), the renderer (`german-detail.tsx` — render synonyms/opposites as chips for all POS, not just adjectives), CSV/JSON I/O (`lib/io`), the AI `emit_cards` schema + system prompt, and the starter content.
- Migration: existing cards (and Dexie data) with adjective-nested synonyms/opposites must keep rendering — provide a read fallback (or a one-time Dexie migration) so no authored data is lost.

## Part B — Navigable connections (`components`)

- Related words, synonyms, and opposites are plain strings/`RelatedWord`s today; they don't link to the cards they name.
- Resolve each connection string against existing cards (match on `german` headword, scoped to the deck then library-wide). When a match exists, render the chip as a **link** that navigates to / previews that card. When none exists, offer a "create card" affordance (prefill the editor / AI draft) so the web can be grown.
- Add a lightweight way to **study a cluster**: from a card, start a focused session over its connected cards (reuses the existing review-session queue; no scheduling change).

## Constraints

- Connections are derived from card data at render time, never stored as resolved IDs (keeps the model portable and import/export unchanged in shape). If a resolution cache is added, it must be rebuildable from card content.
- Scheduling is untouched — "study a cluster" reuses the shared schedule; it never creates a second review item.
- No connection data lives in i18n files; vocabulary stays card data.
- Synonym/opposite chips reuse the existing `Badge` styling and gender-color conventions.

### Check when done
- A noun or verb card can carry synonyms and opposites, shown as chips on the reveal, editable in the editor, and round-tripped through CSV/JSON and AI drafting.
- Pre-existing adjective synonyms/opposites still render after the model change (migration verified).
- A related/synonym/opposite chip that names an existing card links to it; one that doesn't offers to create it.
- A cluster session studies a card's connected cards without altering any due date.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
