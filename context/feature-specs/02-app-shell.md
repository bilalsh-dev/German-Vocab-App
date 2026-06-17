Read `AGENTS.md` before starting.

# Feature 02 — App Shell

We're adding the persistent layout: top nav, content area, and footer. This is the frame every screen renders inside. Depends on Feature 01 (tokens + primitives).

## Layout

A single-window, responsive layout (not a multi-pane editor):

- **Top nav** (`components/shell/top-nav.tsx`): app name/logo on the left; primary navigation (Decks, Study, Stats); the language switcher on the right. Sticky, dark background (`bg-surface`), bottom border (`border-surface-border`).
- **Content area**: a centered column (`max-w-*`) that flexes to fill space between nav and footer. It renders the active route's screen.
- **Footer** (`components/shell/footer.tsx`): slim, muted (`text-copy-muted`); app meta and secondary links. Pinned to the bottom.

Wire it in `app/layout.tsx`: body is `min-h-full flex flex-col`; the content wrapper is `flex-1`.

## Navigation

- Use the Next.js App Router. Routes: `/` (decks), `/study/[deckId]` (review session), `/stats` (stats & forecast).
- Nav items reflect the active route.
- The language switcher is wired in Feature 03; in this feature, render a placeholder slot for it.

## Constraints

- All strings shown here are placeholders until Feature 03; structure the markup so they are trivially swappable to i18n keys.
- Tokens only — no hardcoded colors.

### Check when done
- Nav, content, and footer render on every route; footer stays at the bottom on short pages.
- Layout is responsive (nav collapses sensibly on narrow viewports).
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
