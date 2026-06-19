Read `AGENTS.md` before starting.

# Feature 13 — Frequency & CEFR Level

`prompt.md` requires cards be prioritized "highest-frequency first … Goethe A1 / Netzwerk Neu A1" and emitted "ordered by usefulness and frequency," and to "expand from A1 → A2 → B1." The model has no frequency or level field, so new-card introduction order is arbitrary and there is no level metadata. This feature adds both and orders study by them. Depends on Feature 04 (model), 06 (editor), 07 (review queue), 08 (stats). Prerequisite for any A2/B1 expansion.

## Model (`lib/content`)

- Add optional fields to `Card`:
  - `frequency?: number` — a frequency rank (lower = more common) or band; document the convention chosen.
  - `level?: CefrLevel` — `"A1" | "A2" | "B1"` (extensible); distinct from cross-cutting `tags`.
- Both optional and additive — existing cards and imports without them stay valid (no migration required).
- Thread through validation, the draft/editor, CSV/JSON I/O, the AI `emit_cards` schema, and starter content (author with `level: "A1"` and a frequency rank).

## Introduction order (`lib/scheduler` queue / `components/study`)

- New (never-studied) cards enter a review session ordered by `frequency` (most common first), then a stable fallback. Due-card scheduling is unchanged — this only orders **new** cards, never reschedules.
- Keep it presentation-level: ordering reads card data; it does not write scheduling state.

## Surfacing (`components/stats`, filters)

- Show level and (optionally) a frequency band in stats / per-deck counts.
- Allow filtering a deck's cards by level alongside the existing topic/tag filters (`card-filter.ts`).

## Constraints

- New fields are optional and additive; nothing about existing storage, scheduling, or export shape changes for cards that lack them.
- Frequency ordering affects only the order new cards are introduced — it never changes a card's due date or scheduling state.
- Level is card data, not an i18n key; level labels in the UI come from locale files.

### Check when done
- A card can carry `frequency` and `level`, editable in the editor and round-tripped through CSV/JSON and AI drafting.
- In a session, new cards are introduced most-common-first; due-card scheduling is unaffected.
- A deck can be filtered by level; stats reflect level.
- Cards without the new fields remain valid and behave as before.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
