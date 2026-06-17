# Wortbox

## Overview
Wortbox is a personal spaced-repetition vocabulary trainer for learning German, starting at level A1. It is built for one learner (the app owner) and is local-first — no accounts, no cloud, no sign-in. Cards are organized into decks by topic, studied in review sessions driven by a configurable spaced-repetition scheduler, and resurfaced exactly when the learner is about to forget them.

The default mode is **English-front recall**: the front shows the English word, and the learner recalls the German word and all of its grammar. This trains the "I know the English, what's the German?" direction, which is the gap for an English speaker producing German. The learner can switch the study direction (see below) to German-front or a mix, but English-front is the default because production is the harder skill.

### Study Direction
A user setting controls which side of the card is the prompt:
- **English-front (default):** see English → recall the German word and grammar.
- **German-front:** see the German word → recall its English meaning.
- **Mix:** the prompt side is chosen at random per card during review.

Direction is a **presentation choice only** — it does not change scheduling. Each word has a single due date and progress; switching direction (or using Mix) changes which side is shown, not how the card is scheduled. The full German rendering (gender color, vowel marks, forms) always appears on the German side, whether that side is the prompt or the reveal.

The German back of a card is rich: it teaches gender, plural, vowel length, verb forms, opposites/synonyms, related words, and example sentences — everything an A1 learner needs to actually use the word, not just translate it.

## Goals
1. Let the learner study German A1 vocabulary, English-front by default, with a switchable study direction (English-front / German-front / Mix).
2. Teach each word's full grammar on the back: gender, plural, conjugations, vowel length, related words, opposites/synonyms, and examples.
3. Make grammar visible at a glance through consistent color and typographic conventions (gender colors, vowel-length marks).
4. Drive study with a spaced-repetition scheduler that resurfaces cards at the right interval and is transparent, configurable, and swappable.
5. Organize vocabulary by topic (Familie, Büro, Leben, …) with tags for cross-cutting grouping.
6. Localize the interface in both English and German (the learner can switch UI language).
7. Persist all decks, cards, and study progress on-device so sessions survive restarts.
8. Ship a curated German A1 starter deck the learner can study immediately.
9. (Optional) Let AI draft fully-structured cards from an English or German word.

## Core User Flow
1. Learner opens the app; saved decks and progress load from on-device storage.
2. Learner picks a topic deck (or imports the A1 starter deck).
3. Learner starts a review session; the app queues all due cards.
4. The card shows the **prompt side** for the active study direction (English by default; German if German-front; random if Mix); the learner recalls the other side, then flips.
5. The reveal shows the full German rendering — gender color, vowel-length marks, plural/conjugations, related words, opposites/synonyms, and examples — on the German side, plus the English meaning.
6. Learner self-grades recall (Again / Hard / Good / Easy); each button previews the interval it would schedule.
7. The scheduler computes the next interval and due date; "Again" cards re-circulate in the session.
8. Session ends when no due cards remain; progress is persisted.
9. Learner reviews per-deck stats and the upcoming-due forecast.

## Card Content Model
This is the heart of the product. Every card has an **English front** and a **German back**. The back's fields depend on the word's part of speech.

### All cards
- English prompt (front) and the German headword (back).
- **Vowel length marks:** every long vowel is marked (underline) and every short vowel is marked (under-dot), following the convention used in the *Netzwerk* coursebook, so the learner internalizes pronunciation length (`lang` vs `kurz`).
- **Topic** (one per card, e.g. Familie, Büro, Leben) and **tags** (many, cross-cutting).
- **3–4 example sentences** in German showing the word in natural use (with English translations). For verbs, the examples must collectively demonstrate all three taught verb forms.

### Nouns
- **Gender** — der (masculine) / die (feminine) / das (neuter) — shown via color, not just the article:
  - **Masculine → blue**
  - **Feminine → red**
  - **Neuter → green**
- **Plural form** (e.g. *das Kind → die Kinder*).
- **Gender-by-ending hints:** suffixes that reliably determine gender are surfaced as a note, e.g. *-heit, -keit, -schaft, -ung, -tion* → feminine; *-chen, -lein* → neuter; *-er* (agent), *-ling* → masculine. The hint explains *why* the gender is what it is.
- **Gender-by-group hints:** word groups that share a gender get a note, e.g. weather words are masculine (*der Regen, der Schnee, der Wind*); seasons, months, days are masculine; etc.

### Verbs
- **All taught forms:** infinitive, **Präsens** (present, incl. irregular stem changes), **Präteritum** (simple past / "P2"), and **Perfekt** (with the correct auxiliary *haben*/*sein* + participle).
- **Nominalization:** when a verb converts into a noun, it is listed in **related words** (e.g. *arbeiten → die Arbeit*, *essen → das Essen*).
- Example sentences exercise all three verb forms.

### Adjectives
- **Opposites (antonyms)** — e.g. *groß ↔ klein*.
- **Synonyms** for words where a near-synonym aids learning.
- Comparative/superlative noted where irregular (A1-relevant only).

### Related words (all parts of speech)
- Word-family links: nominalizations, derived adjectives, compounds, and obviously related vocabulary, so words are learned in clusters rather than isolation.

## Internationalization
- The interface is localized in **English and German** via translation (locale) files; the learner can switch the UI language.
- UI strings live in locale files only — never hardcoded in components.
- This is **UI localization**. It is distinct from the card content (the vocabulary data the learner is studying).

## Features

### Decks, Cards, and Topics
- Create, rename, and delete decks; decks map to topics (Familie, Büro, Leben, …).
- Add, edit, and delete cards using a structured editor with all model fields above.
- Tag cards for cross-cutting grouping; filter by tag or topic.
- Bulk import and export of cards (CSV or JSON).

### Spaced-Repetition Engine
- A single pure scheduler function: given a card and a grade, it returns the card's next scheduling state.
- Default algorithm is **FSRS** (via the `ts-fsrs` package) with four grades (Again / Hard / Good / Easy).
- Swappable — FSRS, SM-2, or Leitner — behind the interface without touching UI or storage.
- Tunable parameters: target retention, maximum interval, and the FSRS weights.

### Review Sessions
- Builds a queue of all due cards at session start.
- Flip-to-reveal interaction; the prompt side follows the active study direction (English-front / German-front / Mix); keyboard shortcuts (space to flip, 1–4 to grade).
- Each grade button previews the interval it would schedule.
- "Again" cards re-circulate until recalled correctly; end-of-session summary.

### Progress and Forecast
- Per-deck counts: due, new, total.
- Forecast of cards becoming due over coming days/weeks.
- Per-card interval curve.

### German A1 Starter Deck
- A curated A1 deck ships with the app as static data, fully populated with the card content model (gender colors, vowel marks, forms, examples, topics).
- On import, its cards become real, editable cards owned by the learner.

### AI Card Assistance (Optional)
- Generate a fully-structured card (gender, plural, forms, examples, related words) from a single word.
- Generate a small starter deck from a topic.
- AI output is inserted as editable draft cards reviewed before saving.

### Persistence
- All decks, cards, scheduling state, and the chosen UI language are stored on-device (IndexedDB) for v1.
- Last-write-wins per mutation; data survives restarts. Reset / clear-all option.

## Scope

### In Scope
- A1 vocabulary cards with the full content model, English-front by default
- Switchable study direction (English-front / German-front / Mix) as a presentation setting over a single shared schedule
- Gender color coding and vowel-length typographic marks
- Topic decks and cross-cutting tags
- Spaced-repetition scheduling (swappable, tunable)
- Review sessions with self-grading and interval previews
- Bilingual UI (English / German) via locale files
- Local persistence of cards and progress
- Per-deck stats and upcoming-due forecast
- Card import/export and a curated A1 starter deck
- AI-assisted card generation (optional / stretch)

### Out Of Scope
- User accounts, sign-in, and cloud sync (see Growth Path in `architecture-context.md`)
- Real-time collaboration or shared decks
- Social features (leaderboards, friends, public deck sharing)
- Audio recording, speech recognition, and pronunciation scoring
- Mobile-native applications (web / PWA only for v1)
- Levels beyond A1 in v1 (the model is built to extend to A2+ later)
- Billing and subscriptions

## Success Criteria
1. A learner can study a card (English-front by default) and flip to reveal the full German rendering — gender (by color), plural/conjugations, vowel-length marks, related words, opposites/synonyms — and 3–4 examples.
2. The study direction can be set to English-front, German-front, or Mix; it changes which side is the prompt without changing a card's due date or progress.
2. Noun gender renders blue/red/green for masculine/feminine/neuter, and ending/group gender hints appear when applicable.
3. Verb cards show Präsens, Präteritum, and Perfekt, and their examples use all three forms.
4. A review session surfaces exactly the due cards; grading schedules them forward via the configured algorithm.
5. The UI can be switched between English and German with no hardcoded strings remaining.
6. All decks, cards, progress, and language choice persist across restarts.
7. The curated German A1 starter deck imports as editable cards and is immediately studyable.
8. Swapping the scheduler function changes scheduling behavior with no other code changes.
