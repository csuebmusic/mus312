# mus 312 conventions

## terminology

Sonata-form terminology follows Hepokoski and Darcy.

Harmonic function follows Laitz: four functions, tonic, mediant, pre-dominant, dominant. Where Caplin differs, student-facing material names his reading alongside. Caplin counts three functions, placing vi with the tonic and treating iii as a dominant substitute.

Elsewhere formal terminology follows Caplin.

## prose

Student-facing prose follows the style rules in the profile and project instructions. Read them before drafting.

## labels

Roman numerals take the jazz flatted-degree convention: ♭3̂, ♭III.

The cadential six-four is Cad6/4.

Second-level analysis labels prolongations by what they do: N neighbor, P passing, CL chordal leap, arp arpeggiation. Structural chords keep their roman numerals.

## texts

Caplin, *Analyzing Classical Form*, chapter 1 and Parts I and II. Hepokoski and Darcy, *Elements of Sonata Theory*, for sonata form. Laitz and Bartlette, *The Graduate Review of Tonal Theory*, for review, chromatic harmony, and the form topics outside Caplin.

## assessment

The department's 0 to 4 grade-point scale. The score is the GPA.

Late work loses 2 percent per day past the due date, any part of a day counting as a day, to a floor of 50 percent. Canvas takes percentages only.

## checks before pushing a page

Extract the `<script>` block and run `node --check`.

Render the page in jsdom and confirm every SVG has children and the console is clean. Click every button and confirm the same. For a transposable figure, click through all twelve tonics and confirm no glyph passes the end of its staff.

When changing how a figure is drawn, snapshot the rendered SVG of every figure first and diff after. A refactor that changes no output produces an empty diff.

## repository

Commits to main, one logical change each, pushed. Commit messages name what changed.

`meta/` is Markdown and instructor-only by convention. The repo is public.

Student-facing pages are HTML linking `assets/style.css` with a `?v=N` query. Visual rules are in `meta/visual-conventions.md`.

Live links to student-facing pages go in `README.md` as they are built.
