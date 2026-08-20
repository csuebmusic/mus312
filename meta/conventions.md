# mus 312 conventions

## the meta files

Each file owns one kind of statement. A sentence goes where it is owned, and nowhere else.

| file | owns | never contains |
|---|---|---|
| `conventions.md` | rules to follow: terminology, what a label means, assessment, the checks, repository practice | how anything is drawn, what is built, what happened |
| `visual-conventions.md` | how a page is drawn: palette, type, notation geometry, figure size, spacing, structure, interaction | what a label means, what is built |
| `outline.md` | the schedule: calendar, texts, week by week | anything not on the calendar |
| `status.md` | what exists, in a line each, and what is open | descriptions of features, verification results, page counts, history |
| `README.md` | the public front: live links and what each page is for | rules, status, anything instructor-only |

Update by replacing, not appending. A change that lands edits the sentence that is now wrong. Where no sentence is wrong, nothing is added: a file records the state, not the sequence of states that reached it.

Settled decisions are written as rules. Leave out why a rule was chosen, what was weighed against it, when it changed, and what it replaced. A commit reference belongs in a commit, not in a file.

## terminology

Caplin, *Analyzing Classical Form*, chapter 1 and Parts I and II, is the main text. Hepokoski and Darcy, *Elements of Sonata Theory*, covers sonata form. Laitz and Bartlette, *The Graduate Review of Tonal Theory*, covers the review, chromatic harmony, and the form topics outside Caplin.

Sonata-form terminology follows Hepokoski and Darcy.

Harmonic function follows Laitz: four functions, tonic, mediant, pre-dominant, dominant. Where Caplin differs, student-facing material names his reading alongside. Caplin counts three functions, placing vi with the tonic and treating iii as a dominant substitute.

Elsewhere formal terminology follows Caplin.

Common modulation targets are given for the classical repertoire: V, vi, and IV from a major key, ♭III and v from a minor one. Laitz lists iii in place of IV.

## prose

Student-facing prose follows the style rules in the profile and project instructions. Read them before drafting.

## labels

An applied chord is written with its target after a slash and a curved arrow to that target, whether or not the target follows.

Roman numerals take the jazz flatted-degree convention: ♭3̂, ♭III.

The cadential six-four is Cad6/4.

Second-level analysis names the function of each span: T, M, PD, D. Prolongations inside a span are labelled by what they do: N neighbor, P passing, CL chordal leap, arp arpeggiation.

A cadence bracket covers the dominant and its target at an authentic cadence, and the pre-dominant and the dominant at a half cadence. Caplin brackets the whole cadential progression; where both notations appear, each takes its own bracket.

## assessment

Twelve homework packets weighted equally at 70 percent, the final analysis at 30 percent. Performing a passage from the movement analyzed, in the final exam slot, earns extra credit.

The department's 0 to 4 grade-point scale. The score is the GPA.

Late work loses 2 percent per day past the due date, any part of a day counting as a day, to a floor of 50 percent. Canvas takes percentages only.

## checks before pushing a page

Extract the `<script>` block and run `node --check`.

Render the page in jsdom and confirm every SVG has children and the console is clean. Click every button and confirm the same. For a transposable figure, click through all twelve tonics and confirm no glyph passes the end of its staff.

When changing how a figure is drawn, snapshot the rendered SVG of every figure first and diff after. A refactor that changes no output produces an empty diff.

When adding or revoicing a four-voice example, check the voice leading: group noteheads by `data-col`, order them low to high, and confirm no parallel fifths or octaves between any pair of voices, no upper voice leaping past a fifth, no crossings, and no gap over an octave between adjacent upper voices.

When changing playback, stub `AudioContext`, record every oscillator frequency and start time, and confirm the pitches and onsets of a chordal figure, a metered one, and a transposed one. Run the stub from `suspended` and from `interrupted` as well as from `running`, and confirm every oscillator starts with the context running.

When changing a rotating figure, read the coordinates off the drawn elements, and confirm every point still sits on the circle it was drawn on and the tonic ring lands on the pitch class that was clicked. Check all twelve, at rest and at frames through the glide.

## checks before pushing a meta file

Split every file in `meta/` and `README.md` into sentences and report any that appear in two files, or twice in one. A hit means two owners for one statement; delete the copy that sits outside its owner.

Grep the meta files for every path and identifier they name, and confirm each still exists. A moved function or a renamed file leaves the sentence that described it behind.

Read `status.md` end to end. Any sentence that would still be true if the work had gone differently is a rule and belongs in a conventions file; any sentence about what was done rather than what is, comes out.

## repository

Commits to main, one logical change each, pushed. Commit messages name what changed.

`meta/` is Markdown and instructor-only by convention. The repo is public.

Student-facing pages are HTML linking `assets/style.css` with a `?v=N` query. Visual rules are in `meta/visual-conventions.md`.

Live links to student-facing pages go in `README.md` as they are built.
