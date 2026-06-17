Read `AGENTS.md` before starting.

# Feature 08 — Stats & Forecast

We're adding progress visibility. Depends on Features 04 (storage, `reviewLog`) and 07 (sessions generate the log).

## Stats (`/stats`)

- **Per-deck counts:** due, new, and total cards.
- **Upcoming-due forecast:** how many cards become due over the coming days and weeks (bar/curve), computed from `scheduling.due` across cards.
- **Per-card interval curve:** for a selected card, show how the active algorithm spaces it over successive correct grades (derived by calling the pure scheduler repeatedly — no persistence).

## Constraints

- All reads via `lib/db` helpers; forecasts are computed client-side.
- Charts use tokens for color; keep dependencies light (a small chart lib or hand-rolled SVG).
- Labels via i18n.

### Check when done
- Per-deck counts match the data.
- The forecast reflects actual due dates and updates after a review session.
- The interval curve is generated purely from the scheduler.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
