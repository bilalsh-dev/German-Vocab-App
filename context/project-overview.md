# Wortbox

## Overview
Wortbox is a personal spaced-repetition vocabulary trainer. Users build decks of cards (a prompt and its meaning), study them in review sessions driven by a configurable spaced-repetition algorithm, and the app schedules each card to resurface exactly when the user is about to forget it. The scheduling logic is a first-class, swappable component the user owns and tunes — the algorithm is the product, not a hidden detail.

## Goals
1. Let users create and manage vocabulary decks and cards.
2. Drive study sessions with a spaced-repetition scheduler that resurfaces cards at the right interval.
3. Make the scheduling algorithm transparent, configurable, and swappable.
4. Persist all cards and study progress locally so sessions survive restarts.
5. Show the user how the algorithm is treating each card (interval previews, due forecast).
6. (Optional) Let AI draft cards and example sentences from a word or topic.

## Core User Flow
1. User opens the app; saved decks and progress load.
2. User selects or creates a deck.
3. User adds cards (prompt + meaning), optionally with AI assistance.
4. User starts a review session; the app surfaces all due cards.
5. App shows a card prompt; user recalls, then flips to reveal the answer.
6. User self-grades recall (Again / Hard / Good / Easy).
7. The scheduler computes the next interval and due date for that card.
8. "Again" cards re-circulate within the session; graded-correct cards are scheduled forward.
9. Session ends when no due cards remain; progress is persisted.
10. User reviews deck stats and the upcoming-due forecast.

## Features

### Decks and Cards
- Create, rename, and delete decks.
- Add, edit, and delete cards (prompt / answer, plus optional notes and tags).
- Card model carries scheduling state: interval, repetition count, ease factor, due date.
- Bulk import and export of cards (CSV or JSON).

### Spaced-Repetition Engine
- A single pure scheduler function: given a card and a grade, it returns the card's next scheduling state.
- Default algorithm is an SM-2 variant with four grades (Again / Hard / Good / Easy).
- The algorithm is swappable — Leitner, SM-2, FSRS, or a custom scheme — without touching the UI or storage layers.
- Tunable parameters: ease floor, first-step intervals, and per-grade interval multipliers.

### Review Sessions
- Builds a queue of all due cards at session start.
- Flip-to-reveal interaction, with keyboard shortcuts (space to flip, 1–4 to grade).
- Each grade button previews the interval it would schedule, so the algorithm's effect is visible.
- "Again" cards re-circulate in the same session until recalled correctly.
- End-of-session summary (cards reviewed, lapses).

### Progress and Forecast
- Per-deck counts: due, new, and total.
- A forecast of how many cards become due over the coming days and weeks.
- An interval curve for a card, so the user can see how their algorithm spaces it over time.

### AI Card Assistance (Optional)
- Generate a definition, translation, or example sentence for a single word.
- Generate a small starter deck from a topic or a block of pasted text.
- AI output is inserted as editable draft cards the user reviews before saving.

### Persistence
- All decks, cards, and scheduling state are stored on-device (browser/local storage for v1).
- Last-write-wins on each mutation; data survives app restarts.
- Reset / clear-all option.

## Scope

### In Scope
- Deck and card create, edit, and delete
- Spaced-repetition scheduling with a swappable, tunable algorithm
- Review sessions with self-grading and interval previews
- Local persistence of cards and study progress
- Per-deck stats and an upcoming-due forecast
- Card import and export
- AI-assisted card generation (optional / stretch)

### Out Of Scope
- User accounts, sign-in, and cloud sync
- Real-time collaboration or shared decks
- Social features (leaderboards, friends, public deck sharing)
- Audio recording, speech recognition, and pronunciation scoring
- Mobile-native applications (web / PWA only for v1)
- Billing and subscriptions

## Success Criteria
1. A user can create a deck and add cards to it.
2. A review session surfaces exactly the cards that are due.
3. Grading a card schedules it forward using the configured algorithm.
4. Swapping the scheduler function changes scheduling behavior with no other code changes.
5. All decks, cards, and progress persist across app restarts.
6. The user can view per-deck stats and an upcoming-due forecast.