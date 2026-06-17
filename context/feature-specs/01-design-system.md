Read `AGENTS.md` before starting.

# Feature 01 — Design System & UI Primitives

We're adding the design system: the color/typography tokens and the shadcn/ui primitive components everything else builds on.

## Design Tokens

Define all tokens from `ui-context.md` in `globals.css` as CSS custom properties, mapped to Tailwind via `@theme inline`:

- **Theme:** `--base`, `--surface`, `--surface-raised`, `--surface-border`, `--copy-primary`, `--copy-muted`, `--brand`, `--accent`, `--accent-dim`.
- **State:** `--state-error`, `--state-success`, `--state-warning`.
- **Gender:** `--gender-masc` (blue), `--gender-fem` (red), `--gender-neuter` (green).

Use the exact dark-mode hex values in `ui-context.md`. Provide light-mode values under `prefers-color-scheme: light` against the same variable names. Every token must be reachable as a Tailwind utility (`bg-base`, `text-copy-primary`, `text-gender-masc`, etc.).

## Vowel-Length Mark Styling

Add the CSS needed to render vowel-length marks (used later by the card renderer):
- Long vowel → underline beneath the vowel.
- Short vowel → a dot beneath the vowel.
- Implement with `text-decoration` / a positioned pseudo-element dot so marks scale with font size and inherit color. No images.

## shadcn/ui

Install and configure `shadcn/ui`. Add these components:
- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea
- Badge
- Select
- Tooltip

Do not modify the generated `components/ui/*` files after installation.

## Utilities

- Install `lucide-react`.
- Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

## Constraints

- No hardcoded hex values or raw Tailwind color classes (`zinc-*`) anywhere except the token definitions in `globals.css`.
- Components must reference tokens through their Tailwind utility names.

### Check when done
- All shadcn components import without errors.
- `cn()` works properly.
- All tokens (theme, state, gender) resolve as Tailwind utilities in both light and dark mode.
- A quick manual check shows the three gender colors and a long/short vowel mark rendering correctly.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
