Read `AGENTS.md` before starting.

# Feature 05 — Card Rendering

We're building the components that render a card's prompt and reveal from the Card Data Model. Depends on Feature 01 (tokens/vowel styling) and Feature 04 (model + helpers). See **Card Anatomy** in `ui-context.md`.

## Direction-aware sides

- The renderer takes a `promptSide: "english" | "german"` (resolved from the study direction by Feature 07; default `english`).
- `components/card/card-prompt.tsx`: renders the headword of the prompt language, centered and large, minimal chrome. When the prompt side is German, it uses the German rendering (gender color + vowel marks); when English, plain text.
- `components/card/card-reveal.tsx`: renders the other language plus the full German block below.
- The **full German rendering always appears on the German side**, whether that side is the prompt or the reveal — keep the German block in one reusable component so it is shared by both sides.

## German block

- A reusable `components/card/german-detail.tsx` composes the blocks below from the card data.
- **Headword:** the German word, colored by gender via `genderColorToken` (Feature 04), with vowel-length marks rendered from `vowelMarks`.
- **Vowel marks:** `components/card/german-word.tsx` wraps marked vowels (long → underline, short → under-dot) using the Feature 01 styling. Never hand-author marks per card.
- **Noun block:** article + plural; gender-ending / gender-group hint as a small note (`text-copy-muted`).
- **Verb block:** Präsens / Präteritum / Perfekt in a compact form table; auxiliary shown with Perfekt.
- **Adjective block:** opposites and synonyms as `Badge` chips.
- **Related words:** chips (nominalizations, derived, compounds).
- **Examples:** 3–4 sentences, German with English subtext; verb examples labeled by form.

## Constraints

- Gender color always accompanies the article — color is never the only signal.
- All visual hints derive from card data via `lib/content` helpers; no ad-hoc logic in components.
- Tokens only; strings that are UI chrome (labels like "Plural", "Examples") come from i18n.

### Check when done
- A noun, a verb, and an adjective card each render correctly for both `promptSide` values.
- The full German block renders identically whether German is the prompt or the reveal.
- Gender renders blue/red/green for masc/fem/neuter; ending/group hints appear when applicable.
- Long and short vowel marks render under the correct vowels and scale with font size.
- Component tests cover one card per part of speech.
- `pnpm test`, `pnpm run lint`, and `pnpm run build` pass.
