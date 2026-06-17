Read `AGENTS.md` before starting.

# Feature 10 — AI Card Drafting (Optional / Stretch)

We're adding optional AI assistance that drafts fully-structured cards. This is the only server code in the app. Read **AI Card Drafting** and the invariants in `architecture-context.md`. Depends on Features 04 (model) and 06 (editor).

## Server Route (`app/api/ai`)

- A single thin route handler that proxies a drafting request to the Anthropic API.
- The provider API key is read server-side only and **never reaches the client**.
- Validate and parse input before calling the model; return a predictable shape.
- No long-lived work, no durable state.
- Use the latest appropriate Claude model (see the `claude-api` reference / skill before implementing).

## Drafting Behavior

- Input: a single word (English or German), or a topic.
- The model returns **draft cards already shaped to the Card Data Model**: English/German, gender + plural for nouns, all three forms for verbs, opposites/synonyms for adjectives, related words, vowel marks, and 3–4 examples.
- Output is shown as **editable draft cards in the editor** (Feature 06). Nothing is written to IndexedDB until the user confirms — never auto-saved.

## Client Helper (`lib/io`)

- The client-side helper that calls `app/api/ai` and maps the response into the editor's draft state.

## Constraints

- Treat model output as untrusted: validate against the model before it becomes editable cards.
- Drafts are always reviewed by the user before save.

### Check when done
- A word/topic produces editable, model-shaped draft cards.
- The API key never appears in client code or network payloads to the browser.
- Nothing persists until the user confirms.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
