# mus 312 visual conventions

## palette

White ground, black line, one accent. The accent marks what is live: highlights, hover state, active controls, and the element under discussion. Fixed reference marks stay in ink.

| variable | value | use |
|---|---|---|
| `--paper` | `#ffffff` | background |
| `--ink` | `#101010` | text, staff lines, primary strokes |
| `--rule` | `#cfcfcf` | secondary strokes, dividers |
| `--muted` | `#6a6a6a` | labels, captions, readouts |
| `--accent` | `#e2560d` | highlight, active state, the thing under discussion |
| `--accent-wash` | `rgba(226, 86, 13, 0.10)` | fills under the accent |
| `--accent-edge` | `rgba(226, 86, 13, 0.38)` | outlines on washed fills |

Colors are addressed through these variables. Component CSS carries no hex values.

## type

| variable | family | use |
|---|---|---|
| `--font-body` | IBM Plex Sans, 400 and 600 | prose, headings |
| `--font-data` | IBM Plex Mono, 400 and 500 | numbers, labels, controls, eyebrows |
| `--font-music` | Bravura | notation glyphs |

All three are self-hosted woff2 in `assets/fonts/`, under the SIL Open Font License. License files sit beside them. Pages that use notation credit Bravura and Plex in the footer.

Headings are lowercase and set in the body face at 600.

## notation

Bravura is a SMuFL font: one em equals four staff spaces. A staff with 12px spaces sets Bravura at 48px, and glyph origins land where the SMuFL specification puts them, so a notehead's origin is its left edge at the vertical center and a G clef's origin sits on the G line.

Scale degrees are a Plex Mono digit with the caret drawn as an SVG path above it, since neither Bravura nor Plex carries a combining caret that sets reliably over a numeral.

Codepoints in use: `U+E050` G clef, `U+E0A2` whole notehead, `U+E260` flat, `U+E261` natural, `U+E262` sharp, `U+E263` double sharp, `U+E264` double flat.

Key signatures are drawn from the accidental orders (F C G D A E B, B E A D G C F) at fixed staff positions, 13px apart, starting at x = 66. Notes start at x = 74 + 13 per accidental, spaced 48px apart, or 54px where any note in the figure takes an accidental.

A note's accidental is the difference between its pitch class and the natural pitch class of its letter, drawn whenever that differs from the key signature. Double sharps and double flats come out of this rule and are drawn. The difference is taken with a positive modulo so it lands in the range -2 to 2.

Scale degrees are measured against the major scale on the same tonic: a degree a semitone lower takes a flat, and a roman numeral takes the accidental of its root. Accidentals inside degree labels and numerals are drawn from Bravura, which maps U+266D and U+266F; neither Plex face does. A Bravura accidental sits centered on its staff line rather than on a text baseline, so it is raised by about 0.22em when set in text.

Staves stack at 170px per row. Row labels sit at the left, above the staff.

Staff geometry: spaces of 12px, bottom line E4 at y = 118, pitch positions at 6px per scale step. Ledger lines are drawn at even step positions beyond the staff.

## structure

Student-facing pages are hand-authored HTML linking `assets/style.css` with a `?v=N` query. Bump N whenever the stylesheet changes.

Pages are self-contained: no build step, no runtime dependency, no external request. SVG is written inline so the variables resolve. Page-specific CSS sits in a `<style>` block in the page and uses the variables above.

Interactive tools live in `tools/`. Each is one file.

## interaction

Every control is a real `button` with `aria-pressed` where it toggles. Hit targets are transparent shapes over the drawing rather than the drawn marks themselves.

Focus is visible: a 2px accent outline at 2px offset.

Prose above and below a panel pair takes `.full`. Prose inside a panel keeps the default measure.

Motion is a single transform or opacity transition, 300ms to 800ms, on a `cubic-bezier(0.4, 0, 0.2, 1)` curve. `prefers-reduced-motion: reduce` collapses all of it.
