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
| `--accent-2` | `#1f5fa8` | a second strand, where two things move at once and must be told apart |

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

Key signatures are drawn from the accidental orders (F C G D A E B, B E A D G C F) at fixed staff positions. A scale figure sets them 11px apart from x = 60 and starts its notes at x = 68 + 11 per accidental, spaced 48px apart, or 50px where any note in the figure takes an accidental. A triad figure sets them 13px apart from x = 66 and starts at x = 104 + 13 per accidental, spaced 64px apart. The grand staff sets them 13px apart from x = 46.

A note's accidental is the difference between its pitch class and the natural pitch class of its letter, drawn whenever that differs from the key signature. Double sharps and double flats come out of this rule and are drawn. The difference is taken with a positive modulo so it lands in the range -2 to 2.

Scale degrees are measured against the major scale on the same tonic: a degree a semitone lower takes a flat, and a roman numeral takes the accidental of its root. Accidentals inside degree labels and numerals are drawn from Bravura, which maps U+266D and U+266F; neither Plex face does. A Bravura accidental sits centered on its staff line rather than on a text baseline, so it is raised by about 0.22em when set in text.

Staves stack at 215px per row. Row labels sit at the left, above the staff.

Staff geometry: spaces of 12px, bottom line E4 at y = 128 in row 0, pitch positions at 6px per scale step. On the grand staff the treble bottom line sits at y = 114 and the bass bottom line at y = 226. Ledger lines run from x − 7 to x + 27 at even step positions beyond either edge.

## figure size

Staff notation renders at 0.75, so a 48px Bravura glyph draws at 36px and staff spaces at 9px. Diagrams that carry no staff (clock faces, stacking recipes, function and prolongation maps) render at 1.

A figure's `viewBox` is sized from the panel that holds it divided by its scale, not from its content. Panel inner widths:

| panel | inner |
|---|---|
| full width | 1200 |
| wide column of `.panels.uneven`, `.panel.centered.wide` | 667 |
| half of `.panels`, `.panel.centered` | 556 |
| narrow column of `.panels.uneven` | 445 |
| `.panels.three` | 341 |

Advance widths used to place a label beside a numeral are read from the shipped woff2, not estimated.

The drawing keeps its own coordinates and is centred by a negative `viewBox` origin: `viewBox="-DX minY W H"` where DX is half the difference between W and the drawing's own width. Empty space either side is expected. Where a drawing is wider than its panel allows, the `viewBox` takes the drawing's own width and the figure renders at whatever scale that gives.

## drawing

A note name is `C4`, `F#3`, `Eb5`. `noteDia` turns one into a diatonic index, `noteAlt` into an alteration of -1, 0, or 1, and `ledgers(target, x, step, bottomY)` draws the ledger lines for a step beyond either edge of a staff. Every figure uses these.

Grand-staff figures use the shared module in `tools/harmony-review.html`: `grandStaff(svg, flats)` draws both staves, both clefs, the opening barline, and a flat key signature, returning the signature as a map; `gsNote(svg, x, note, which, opt)` draws one notehead with its ledger lines, taking `sig`, `accX`, `lit`, and `head`; `gsY(note, which)` returns a vertical position. `which` is `"t"` or `"b"`. Single-staff figures outside part 1 use `staff(svg)` and `chord(g, x, notes, hot, cool)`. Do not write a second copy of any of these.

A staff ends 70 units past the right edge of its last notehead. `grandStaff` and `staff` register their figure; `closeStaves`, called at the end of the script, sets the ends. A figure that is a measure calls `endStaff(svg, x)` with its barline instead.

Two chord tones a second apart are displaced by `secondsShift(notes, low, high)`. It pairs from the top down, leaves a note already displaced where it is, and returns the notes low to high with a map from note name to shift. Part 1 figures pass -20 and 0, the function charts -20 and 3, grand-staff and single-staff figures 0 and 13.

`arrowMarker(target, id, w, refX, cls)` puts an arrowhead marker in a figure's own defs and returns its `url()` reference. `blockArrow(svg, x1, x2, y, size)` draws a function arrow at `ARROW_WIDE` or `ARROW_NARROW`.

Every notehead is drawn by `head(x, y, cls, note, opt)`, which writes `data-note` as a sounding pitch with ascii accidentals and an octave, and `data-col` as the nominal x of its chord. `opt` takes `col`, `glyph`, `dur`, and `beat`. Part 1 figures pass `pitch` from `spellNote`; the shared module passes the note name it was given.

Single-staff figures in part 1 keep their own geometry.

## sound

Playback reads the staff. `playButtons` walks the page in document order and puts a `button.play` under every figure carrying `text.notehead[data-note]`, labelled from the headings above it, unless the figure takes `data-play="no"`. `figureNotes(svg)` returns one entry per sounding notehead: its onset is `data-beat` where the figure is metered and its column index otherwise, and its length is `data-dur` in beats or one beat. A tied note carries the length of both halves and the note it ties into takes `data-tie`. Noteheads marked `optional` are silent.

A beat is 0.85 seconds where any two notes share an onset, 0.48 seconds for a single line. A note sounds as four sine partials at 1, 2, 3, and 4 times its frequency, decaying exponentially over 1.7 times its notated length, so a chord rings into the one after it. Built on the Web Audio API with no library and no sample. The notehead takes `.sounding` while it sounds. One figure plays at a time, and pressing a playing button stops it.

## spacing

One unit is `--step`, 0.5rem. The vertical scale, in units:

| units | use |
|---|---|
| 2 | paragraph to paragraph |
| 3 | heading to its content; panel to its controls |
| 4 | block to block inside a section |
| 5 | between panel grids; grid column gap |
| 6 | the rule between sections |
| 8 | page to footer |

Inside a section, spacing is carried by `margin-top` on `section.scale > *`, so adjacent margins never compete. A section's first heading takes no top margin; a later heading in the same section takes 6, so it reads as a subsection break. Paragraphs inside a panel keep their own bottom margin, and the last child of a panel drops it.

## structure

Student-facing pages are hand-authored HTML linking `assets/style.css` with a `?v=N` query. Bump N whenever the stylesheet changes.

Pages are self-contained: no build step, no runtime dependency, no external request. SVG is written inline so the variables resolve. Page-specific CSS sits in a `<style>` block in the page and uses the variables above.

Interactive tools live in `tools/`. Each is one file.

A section that carries a transposable figure is found by `data-scale`, not by id. Ids on a section belong to its heading.

A panel that stands alone rather than in a grid takes `.panel.centered`, which caps it at the width of one cell in the two-column grid and centers it:

```css
.panel.centered {
  max-width: calc((78rem - var(--step) * 5) / 2);
  margin-left: auto;
  margin-right: auto;
}
```

Drawings render at the scale their box gives them, so a drawing sized for a gridded panel doubles in a full-width one. Cap the box, not the drawing.

## contents index

A long page carries `nav.toc` as the first child of `.page`, ahead of `.wrap`. Every `h1` and `h2` takes an id and appears in it. A lower heading takes one only where the page links to it.

At 96rem and wider the index is a sticky 13rem column beside the content; below that it sits above the content in three columns, one column under 48rem. The content column stays 78rem at every width, so figure sizes hold.

The section in view is marked with `.here`: the entry whose target last crossed a line a quarter of the way down the viewport, recomputed on scroll and resize through `requestAnimationFrame`.

## interaction

Every control is a real `button` with `aria-pressed` where it toggles. Hit targets are transparent shapes over the drawing rather than the drawn marks themselves.

Focus is visible: a 2px accent outline at 2px offset.

Prose above and below a panel pair takes `.full`. Prose inside a panel keeps the default measure.

Motion is a single transform or opacity transition, 300ms to 800ms, on a `cubic-bezier(0.4, 0, 0.2, 1)` curve. `prefers-reduced-motion: reduce` collapses all of it.

Headings are lowercased by the stylesheet. Wrap a roman numeral, a pitch letter, or a proper noun in `<span class="caps">` to keep its case.
