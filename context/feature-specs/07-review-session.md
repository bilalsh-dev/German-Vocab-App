Read `AGENTS.md` before starting.

# Feature 07 — Review Session & Scheduler

We're adding the spaced-repetition scheduler and the review session loop. Read **Scheduling and Session Model** in `architecture-context.md` first. Depends on Features 04 (model/storage) and 05 (rendering).

## Scheduler (`lib/scheduler`)

- Wrap **`ts-fsrs`** (FSRS) behind a single pure interface: `(card, grade) → next SchedulingState`. No I/O, no network, no React in the wrapper.
- Add the dependency in this feature (not before): `pnpm add ts-fsrs`.
- Grades: `again | hard | good | easy` map to the FSRS ratings.
- Tunable parameters (request retention, maximum interval, FSRS weights) are read from `settings`. The interface is what we own, so SM-2/Leitner can swap in later with no change to storage, UI, or the session loop.
- Previews: use `ts-fsrs`'s `repeat()` to get the interval each of the four grades would schedule.

## Review Session (`/study/[deckId]`)

- Build a queue of all cards in the deck with `scheduling.due <= now`.
- Flip-to-reveal (Feature 05 renders prompt/reveal). The **prompt side** is resolved from the `studyDirection` setting (`english-front` → English prompt; `german-front` → German prompt; `mix` → random side per card) and passed to the renderer as `promptSide`.
- A study-direction control in the session header updates the setting (persisted via `lib/db` settings) and re-resolves the prompt side; it never alters scheduling.
- A row of grade buttons, each **previewing the interval** it would schedule.
- On grade: compute next state via the scheduler, derive the due date, **persist the updated card before advancing**, and append a `reviewLog` entry.
- `again`-graded cards re-circulate within the session; correctly graded cards leave the queue.
- Keyboard shortcuts: space to flip, 1–4 to grade.
- End-of-session summary (cards reviewed, lapses); session ends when the queue is empty.

## Constraints

- The scheduler wrapper must stay pure and be unit-tested across all four grades and edge cases (new card, lapse, learning vs review state).
- The UI never recomputes scheduling — it only reads card state and calls the scheduler.

### Check when done
- A session surfaces exactly the due cards and schedules them forward on grade.
- Changing study direction (English-front / German-front / Mix) flips the prompt side without changing any card's due date; Mix randomizes per card.
- Interval previews on the grade buttons match what grading actually applies.
- "Again" cards reappear in the same session; progress persists before each advance.
- Scheduler unit tests pass; `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
