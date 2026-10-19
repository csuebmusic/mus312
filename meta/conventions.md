# mus 312 conventions

## the meta files

Each file owns one kind of statement. A sentence goes where it's owned, and nowhere else.

| file | owns | never contains |
|---|---|---|
| `conventions.md` | rules to follow: level, sources, terminology, what a label means, assessment, the checks, repository practice | how anything is drawn, what is built, what happened |
| `visual-conventions.md` | how a page is drawn: palette, type, notation geometry, figure size, spacing, structure, interaction | what a label means, what is built |
| `outline.md` | the schedule: calendar, texts, week by week | anything not on the calendar |
| `status.md` | what exists, in a line each, and what is open | descriptions of features, verification results, page counts, history |
| `README.md` | the public front: the course, the syllabus link, pointers to the folder READMEs | rules, status, anything instructor-only |
| `tools/README.md`, `review/README.md`, `assets/README.md` | live links and what each page or file in the folder is for | rules, status, anything instructor-only |

A convention settled in conversation holds until it's written to the file that owns it.

Update by replacing, not appending. A change edits the sentence that's now wrong. Where no sentence is wrong, nothing is added: a file records the state, not the sequence of states that reached it.

A commit reference belongs in a commit, not in a file.

## level

Students are undergraduate music majors who've completed MUS 211, Theory III, or its equivalent. Student-facing material assumes the vocabulary of the earlier theory sequence and defines each new formal term on first use. Analysis is connected to how a piece works and to how it's performed.

## sources

Conceptual and pedagogical questions are answered from the course texts, searched first: the three assigned texts in `meta/outline.md`; Griffiths, *A Concise History of Western Music*; Beach, *Advanced Schenkerian Analysis*; and Tymoczko's course handouts, in two parts.

A claim the course texts don't support is flagged rather than installed. Where a topic has no source, the gap is flagged and a handout offered. Bibliographic details are checked against the source itself.

## mus 601

MUS 601, Birth and Death of Tonality, is the graduate counterpart. Analytical material can be adapted between the two courses. The research and citation apparatus stays in 601.

## terminology

Caplin, *Analyzing Classical Form*, is the main text. Hepokoski and Darcy, *Elements of Sonata Theory*, covers sonata form. Laitz and Bartlette, *The Graduate Review of Tonal Theory*, covers the review, chromatic harmony, and the form topics outside Caplin.

Sonata-form terminology follows Hepokoski and Darcy.

Harmonic function follows Laitz: four functions, tonic, mediant, pre-dominant, dominant. Where Caplin differs, student-facing material names his reading alongside. Caplin counts three functions, placing vi with the tonic and treating iii as a dominant substitute.

A phrase runs to a cadence, weak or strong, from the start of a theme or from the cadence before it. A functional unit that doesn't span a phrase on its own is a subphrase. A sentence is one phrase of two subphrases, presentation and continuation. A period is two phrases, antecedent and consequent. Caplin calls all of these units phrases, and student-facing material names his usage where his rules are given.

Elsewhere formal terminology follows Caplin.

Common modulation targets are given for the classical repertoire: V, vi, and IV from a major key, ♭III and v from a minor one. Laitz lists iii in place of IV.

## prose

Prose follows the "how I want you to communicate" section of Inés's profile.

The "quality informs function" section of `tools/harmony-review.html` keeps its own voice and register.

## labels

An applied chord is written with its target after a slash and a curved arrow to that target, whether or not the target follows.

Roman numerals follow the jazz flatted-degree convention: ♭3̂, ♭III.

A mode has the key signature of its parent major scale: C dorian has B♭ major's two flats. Its scale degrees and roman numerals read against the major scale on its own tonic: C dorian is 1̂ 2̂ ♭3̂ 4̂ 5̂ 6̂ ♭7̂, and its triad on ♭3̂ is ♭III.

The cadential six-four is Cad6/4. In a figured bass the bass note is written twice, 6 over 4 under the first and 5 over 3 under the second, each row joined across, with the accidental in place of the 3 where the key raises it.

A note belonging to a chord is a chord tone. Nothing is a member.

A pivot is boxed and read in both keys, the old key's numeral above the new key's, and the new key is named in a box to the left of the lower row. Numerals after the pivot stand on that lower row.

Four-voice writing is keyboard style unless a page says otherwise: the bass alone on the bass staff, the three upper voices together on the treble staff.

Subphrase labels are unbracketed and stand at the point the subphrase begins. Brackets mark ideas, fragments, models, and sequences.

Second-level analysis names the function of each span: T, M, PD, D. Prolongations inside a span are labelled by what they do: N neighbor, P passing, CL chordal leap, arp arpeggiation.

A cadence bracket covers the dominant and its target at an authentic cadence, and the pre-dominant and the dominant at a half cadence. Caplin brackets the whole cadential progression; where both notations appear, each has its own bracket.

## assessment

Written analysis reaches a claim about how a piece works.

Twelve homework packets weighted equally at 70 percent, the final analysis at 30 percent. Performing a passage from the movement analyzed, in the final exam slot, earns extra credit.

A packet is the end-of-chapter material for one chapter of Caplin, due on paper at the start of the first meeting on the next chapter. Students hand in the Examples for Analysis, work the review questions against Caplin's companion website without handing them in, and aren't assigned Model Composition. The packets are distributed through Canvas, not the public site.

The review problem sets are outside the packets and aren't weighted. They're worked by hand and have no answers on the page.

Attendance and promptness at every meeting are expected and not separately weighted.

The department's 0 to 4 grade-point scale. The score is the GPA.

Late work loses 2 percent per day past the due date, any part of a day counting as a day, to a floor of 50 percent. Canvas takes percentages only.

## checks before pushing a page

Extract the `<script>` block and run `node --check`.

Render the page in jsdom and confirm every SVG has children and the console is clean. Click every button and confirm the same. For a transposable figure, click through all twelve tonics and confirm no glyph passes the end of its staff.

When changing how a figure is drawn, snapshot the rendered SVG of every figure first and diff after. A refactor that changes no output produces an empty diff.

When adding or revoicing a four-voice example, check the voice leading: group noteheads by `data-col`, order them low to high, and confirm no parallel fifths or octaves between any pair of voices, no upper voice leaping past a fifth, no crossings, and no gap over an octave between adjacent upper voices.

When changing playback, stub `AudioContext`, record every oscillator frequency and start time, and confirm the pitches and onsets of a chordal figure, a metered one, and a transposed one. Run the stub from `suspended` and from `interrupted` as well as from `running`, and confirm every oscillator starts with the context running.

When changing a highlight, list every painted class the highlighted group contains in the rendered DOM against every class its rule recolours, and account for each difference.

When changing a rotating figure, read the coordinates off the drawn elements, and confirm every point still sits on the circle it was drawn on and the tonic ring ends on the pitch class that was clicked. Check all twelve, at rest and at frames through the glide.

## checks before pushing a meta file

Split every file in `meta/` and every `README.md` into sentences and report any that appear in two files, or twice in one. A hit means two owners for one statement; delete the copy outside its owner.

Grep the meta files for every path and identifier they name, and confirm each still exists. A moved function or a renamed file leaves the sentence that described it behind.

Read `status.md` end to end. Any sentence that would still be true if the work had gone differently is a rule and belongs in a conventions file; any sentence about what was done rather than what is, comes out.

## repository

Commits go to main, one logical change each, authored as Inés Thiebaut <ines.thiebaut@csueastbay.edu>, and each is pushed. Commit messages name what changed.

A reorganization, a mass rename, or a deletion is described first and waits for confirmation.

Repo files aren't presented or attached in chat. Inés pulls locally.

Folders are added as materials need them.

`meta/` is Markdown and instructor-only by convention. GitHub Pages publishes the whole repository through the Actions workflow: `meta/` and every Markdown file are public at the repo and at the Pages URL.

Student-facing pages are HTML linking `assets/style.css` with a `?v=N` query. Visual rules are in `meta/visual-conventions.md`.

Live links to student-facing pages go in the README of the page's folder as they are built.

Each fall, the term facts in `syllabus.html`, `README.md`, and `meta/outline.md` are updated.
