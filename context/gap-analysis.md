# Gap Analysis — `prompt.md` vs. Built App

Compares the card-authoring philosophy in `prompt.md` against the shipped Wortbox app (roadmap features 01–10 complete). Each gap is written as a discrete key point that can later become a feature spec.

`prompt.md` is a **content-generation spec** — it describes how to author a *connected web* of frequency-ordered German vocabulary spanning A1→B1. The app is the **platform**. Most platform mechanics exist; the gaps are where the prompt's learning philosophy outruns the current data model, content volume, and UI.

Legend: **[Capability]** = code/feature work · **[Content]** = authoring/data work · **[Model]** = schema change.

---

## 1. Synonyms & opposites are not available on all parts of speech — **[Model]**
- **prompt.md:** "For every word include: 1. Synonyms 2. Opposites … 3. Word family". Its noun example carries a synonym (`das Gebäude`) and its verb example carries one (`tätig sein`).
- **App:** `synonyms` and `opposites` live only on `AdjectiveData`. Nouns and verbs have no synonym/opposite fields.
- **Feature seed:** lift `synonyms` / `opposites` to common card fields (or add them to `NounData`/`VerbData`), with editor, renderer, validation, CSV/JSON, and AI-prompt support.

## 2. Related vocabulary is not a navigable network — **[Capability]**
- **prompt.md:** the central goal is "a web of associations rather than isolated vocabulary" — words connect to synonyms, opposites, word families, and same-topic words.
- **App:** related words render as static text `Badge` chips in `german-detail.tsx`. They do not link to the actual cards for those words; there is no graph, no click-through, no "study this cluster."
- **Feature seed:** resolve related words / synonyms / opposites to real cards when present; make chips clickable (jump to card or offer to create it); optionally a topic/word-family graph view and "study this cluster" sessions.

## 3. No frequency or CEFR-level ordering — **[Model + Capability]**
- **prompt.md:** "Prioritize highest-frequency German words first … Goethe A1 … Netzwerk Neu A1," and cards are emitted "ordered by usefulness and frequency."
- **App:** cards have no `frequency`/`rank`/`level` field; decks and review queues are not frequency-ordered. New-card introduction order is not controllable.
- **Feature seed:** add a frequency/rank and CEFR level to the model; order new-card introduction by frequency; let stats and forecast reflect level.

## 4. A1-only — no A2 / B1 progression — **[Content + Capability]**
- **prompt.md:** "gradually expand from A1 → A2 → B1 while maintaining connections."
- **App:** A1 is the explicit v1 scope; A2+ is out of scope. No level metadata, no level-gated progression.
- **Feature seed:** introduce level tagging and a progression path so the deck can grow into A2/B1 while preserving cross-level connections (depends on #3).

## 5. Starter content is far below the prompt's topic coverage — **[Content]**
- **prompt.md:** seeds **17 topics** (Family, Home, Daily Routine, Food & Drinks, Shopping, School, University, Work, Travel, Transportation, Health, Clothing, Weather, Time & Dates, Hobbies, Technology, Communication), built in batches of 50.
- **App:** ships **2 starter decks** — Familie (~13 cards) and Büro (~12 cards) ≈ 25 cards total.
- **Feature seed:** author the remaining ~15 topic decks against the existing schema (additive — drop files into `public/starter-decks/` + manifest entry; `starter-content.test.ts` guards validity). This is the single biggest gap and is pure content work.

## 6. Topic decks are not structured as "common nouns / verbs / adjectives / expressions" — **[Content + Capability]**
- **prompt.md:** each topic should deliver "Most common nouns, Most common verbs, Most common adjectives, Topic-specific expressions, Related vocabulary."
- **App:** topic is a single string per card; there is no notion of a balanced topic composition or "expressions" grouping beyond `partOfSpeech` + tags.
- **Feature seed:** a topic-coverage view/report (counts by POS per topic, gaps highlighted) to guide authoring; possibly a curated per-topic ordering.

## 7. Two example sentences are not explicitly modeled as Kurz / Lang — **[Model, minor]**
- **prompt.md:** every card has a short ("Kurz") and a long ("Lang") example, distinctly labeled.
- **App:** `examples` is a flat 3–4 item list (`de`/`en`/optional `verbForm`); there is no Kurz/Lang role. (This may be an intentional simplification — the app exceeds the count but loses the length distinction.)
- **Feature seed (optional):** add an optional `length: "kurz" | "lang"` role to `ExampleSentence` if the short/long pedagogy matters; otherwise document the deviation.

## 8. No Anki-compatible export — **[Capability, minor]**
- **prompt.md:** output is explicitly "Anki-ready table" with a fixed 16-column layout.
- **App:** import/export is Wortbox JSON + a 12-column Wortbox CSV. There is no Anki `.apkg` or Anki-column CSV export.
- **Feature seed (optional):** an Anki-compatible export profile, if interop with Anki is desired. Low priority given the app is the study surface.

---

## What already satisfies `prompt.md` (no gap)
- English-front recall with switchable direction (English / German / Mix). ✓
- Per-POS card structure: noun (article, plural, gender, gender hints), verb (Präsens/Präteritum/Perfekt + auxiliary), adjective (opposites/synonyms). ✓
- Gender shown by color (masc=blue, fem=red, neuter=green) + article. ✓
- Vowel-length marks (long underline / short under-dot). ✓
- Word family / nominalizations via `related` words. ✓ (rendering is static — see #2)
- 3–4 examples per card; verb examples cover all three forms. ✓
- Topic + cross-cutting tags. ✓
- AI drafting of fully-structured cards from a word or topic. ✓

---

## Suggested priority
1. **#5 Starter content expansion** — highest learner value, pure content, schema already supports it.
2. **#1 Synonyms/opposites on all POS** + **#2 navigable connections** — together deliver the prompt's core "connected web" philosophy.
3. **#3 Frequency/level ordering** — unlocks correct introduction order and is a prerequisite for **#4 A2/B1**.
4. **#6 / #7 / #8** — refinements once the above land.
