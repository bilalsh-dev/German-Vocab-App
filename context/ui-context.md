# UI Context

## Theme

Support both light and dark mode; dark is the primary design target. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid violet/cyan accents for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values and no raw Tailwind color classes like `zinc-*`.

### Color Tokens (dark)

| Role               | CSS Variable           | Hex / Value |
| ------------------ | ---------------------- | ----------- |
| Page background    | `--base`               | `#0a0a0b`   |
| Surface (panels)   | `--surface`            | `#16161a`   |
| Raised surface     | `--surface-raised`     | `#1f1f25`   |
| Surface border     | `--surface-border`     | `#26262c`   |
| Primary copy       | `--copy-primary`       | `#ededf0`   |
| Muted copy         | `--copy-muted`         | `#9a9aa5`   |
| Brand              | `--brand`              | `#7c5cff`   |
| Accent             | `--accent`             | `#22d3ee`   |
| Accent (dim)       | `--accent-dim`         | `#123842`   |
| Error              | `--state-error`        | `#f87171`   |
| Success            | `--state-success`      | `#34d399`   |
| Warning            | `--state-warning`      | `#fbbf24`   |

### Gender Tokens (grammar coloring)

Noun gender is communicated by **color**, consistently everywhere a German noun appears (card back, editor preview, lists). These are first-class tokens, tuned for contrast in both themes.

| Gender    | Article | CSS Variable        | Hex (dark) |
| --------- | ------- | ------------------- | ---------- |
| Masculine | der     | `--gender-masc`     | `#60a5fa` (blue)  |
| Feminine  | die     | `--gender-fem`      | `#f87171` (red)   |
| Neuter    | das     | `--gender-neuter`   | `#4ade80` (green) |

- Mapping: masculine → blue, feminine → red, neuter → green.
- Color is **derived** from the card's gender by a helper in `lib/content`; components never hardcode which color goes with which word.
- Color is an aid, not the only signal — always pair the color with the article (`der`/`die`/`das`) for accessibility.

Each variable is mapped in `@theme inline` to a `--color-*` token so it is reachable through standard Tailwind utility names: `bg-base`, `bg-surface`, `bg-surface-raised`, `border-surface-border`, `text-copy-primary`, `text-copy-muted`, `text-brand`, `bg-accent-dim`, `text-accent`, `text-gender-masc`, `text-gender-fem`, `text-gender-neuter`, `text-state-error`, etc. Light-mode values are defined under a `prefers-color-scheme: light` block against the same variable names.

## Vowel-Length Marks

Pronunciation length is shown typographically on the German word, following the *Netzwerk* coursebook convention:

- **Long vowel (`lang`) → underline** beneath the vowel.
- **Short vowel (`kurz`) → a dot** beneath the vowel.

Implementation notes:
- Driven by the card's `vowelMarks` (character index + length); a dedicated renderer wraps the marked vowels — never manual markup per card.
- Use `text-decoration` / a small positioned dot rather than images, so it scales with font size and respects theme color.
- Marks use `--copy-primary` (or the gender color when the headword is colored), never a separate hardcoded color.

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` in `app/layout.tsx` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## App Shell

A single-window layout, not a multi-pane editor:

- **Top nav:** app name/logo, deck/topic navigation, and the **language switcher** (EN / DE). Dark background, bottom border, sticky.
- **Content area:** a single centered column (`max-w-*`) that flexes to fill the viewport between nav and footer; it hosts the current screen (deck list, review session, stats, editor).
- **Footer:** slim, muted; secondary links and app meta. Stays at the bottom (`min-h-full flex flex-col` body, content `flex-1`).

## Card Anatomy

The card has a **prompt side** and a **reveal side**, assigned by the active study direction (English-front by default; German-front; or Mix, which randomizes per card). The full German rendering always appears on the German side, whichever side that is.

- **Prompt:** the headword of the prompt language, centered, large, minimal chrome. (English plain text in English-front; the German headword with gender color + vowel marks in German-front.)
- **Reveal:** the other language plus, on the German side, the full rendering — the German headword with gender color + vowel-length marks at the top, then part-of-speech-specific blocks:
  - Noun: article + plural; gender-ending / gender-group hint as a small note.
  - Verb: Präsens / Präteritum / Perfekt in a compact form table; nominalizations under related words.
  - Adjective: opposites and synonyms as chips.
  - All: related words as chips, then 3–4 example sentences (German with English subtext; verb examples labeled by form).

## Layout Patterns

- **Deck list (home):** responsive grid of deck cards (`rounded-2xl`) showing name and due / new / total counts, plus a "create deck" action.
- **Review session:** centered, distraction-free single card; flip-to-reveal; a row of grade buttons (Again / Hard / Good / Easy) each previewing its interval; a slim progress indicator. A **study-direction control** (English-front / German-front / Mix) sits in the session header; it changes the prompt side, not scheduling.
- **Card editor:** dialog or slide-over (`rounded-3xl`, backdrop blur) with structured fields per the Card Data Model; live preview of the rendered back (gender color, vowel marks).
- **Stats & forecast:** panel with per-deck counts, an upcoming-due forecast, and a per-card interval curve.
- **Modals and dialogs:** centered overlay, `rounded-3xl`, dark background with backdrop blur.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.
