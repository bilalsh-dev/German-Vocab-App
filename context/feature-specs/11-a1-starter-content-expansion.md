Read `AGENTS.md` before starting.

# Feature 11 — A1 Starter Content Expansion

We're expanding the curated German A1 starter content from the current 2 decks (Familie, Büro ≈ 25 cards) to full topic coverage. This is **content authoring**, not new mechanism — the Feature 09 importer, schema, manifest, and `starter-content.test.ts` guard already exist; expansion is additive (new file in `public/starter-decks/` + a manifest entry). Depends on Feature 09.

## Goal

Author topic decks covering the `prompt.md` topic set, each fully populated against the Card Data Model, so a new learner can import a broad A1 deck and study immediately.

## Topics

Author one deck per topic, following `prompt.md`'s starter topics:

Familie · Home · Daily Routine · Food & Drinks · Shopping · School · University · Work · Travel · Transportation · Health · Clothing · Weather · Time & Dates · Hobbies · Technology · Communication

(Familie and Büro already exist — extend/keep them; author the remainder.)

## Per-deck composition

Each topic deck should follow the `prompt.md` recipe so a topic is learnable as a unit, not a word list:

- Most common **nouns**, **verbs**, and **adjectives** for the topic.
- Topic-specific **expressions** (model as `partOfSpeech: "phrase"`).
- **Related vocabulary** linking within the topic and to words already authored in earlier decks (maximize cross-deck connections).

## Authoring rules (per card)

Every card must satisfy the existing model and validation:

- `english` front, bare `german` headword (no article — gender renders the article), `vowelMarks` indexing the bare headword.
- **Nouns:** gender, plural, and a gender ending/group hint where one applies.
- **Verbs:** Präsens, Präteritum, Perfekt + correct auxiliary; the 3–4 examples collectively exercise all three forms.
- **Adjectives:** opposites and synonyms where they aid learning.
- `related` words (nominalizations, derived, compounds, related) — prefer words that exist as other cards.
- `topic` set to the deck's topic; cross-cutting `tags` (e.g. `A1`, part of speech).
- 3–4 natural example sentences (German + English).

## Content sourcing

- Prioritize highest-frequency / Goethe A1 / Netzwerk Neu A1 vocabulary; avoid rare or literary words.
- Confirm the word list / chapter scope with the owner before authoring each topic (see `progress-tracker.md` open question).
- Author in batches; each new batch should maximize connections to previously authored vocabulary.

## Constraints

- No new mechanism, schema, or dependency — content files only, validated by `starter-content.test.ts`.
- All vocabulary lives in the deck JSON, never in i18n locale files.
- Each starter file is a one-entry portable export (`{format:"wortbox",version:1,decks:[…]}`); add an `index.json` manifest entry (`{id,file,name,description,cardCount}`) per deck.
- Imported cards remain indistinguishable from user-created cards.

### Check when done
- Each new topic deck appears in the starter-deck picker and imports as editable, immediately studyable cards.
- Every authored card passes `starter-content.test.ts` (re-validated against the model).
- `cardCount` in `index.json` matches the actual card count per file.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
