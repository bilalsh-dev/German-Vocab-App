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

Each variable is mapped in `@theme inline` to a `--color-*` token so it is reachable through standard Tailwind utility names: `bg-base`, `bg-surface`, `bg-surface-raised`, `border-surface-border`, `text-copy-primary`, `text-copy-muted`, `text-brand`, `bg-accent-dim`, `text-accent`, `text-state-error`, etc. Light-mode values are defined under a `prefers-color-scheme: light` block against the same variable names.

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

## Layout Patterns

The app is a focused, single-window study tool — not a multi-pane editor. Screens:

- **App shell:** top navbar (app name, deck switcher, links to study / stats) with a dark background and bottom border; a single centered content column below it.
- **Deck list (home):** a responsive grid of deck cards (`rounded-2xl`), each showing the deck name and due / new / total counts, plus a "create deck" action.
- **Review session:** a centered, distraction-free single-card layout. Flip-to-reveal card, a row of grade buttons (Again / Hard / Good / Easy) each previewing the interval it would schedule, and a slim session-progress indicator. Minimal surrounding chrome so the card is the focus.
- **Card editor:** a dialog or slide-over (`rounded-3xl`, backdrop blur) with prompt, answer, optional notes, and tags fields.
- **Stats & forecast:** a panel showing per-deck counts and an upcoming-due forecast (bar/curve) plus a per-card interval curve.
- **AI draft (optional):** a slide-over or dialog presenting editable draft cards the user confirms before they are saved.
- **Modals and dialogs:** centered overlay, `rounded-3xl`, dark background with backdrop blur.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.
