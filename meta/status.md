# mus 312 status

## built

`meta/outline.md`, the sixteen-week schedule.

`tools/harmony-review.html`, four parts in one file.

Part 1, counting in semitones: the four scale types on linked staff and clock, interval names, diatonic triads in major and all three minors, the chord builder, figured bass, inversions, nonchord tones.

Part 2, harmonic progressions and functions: tonal syntax, the seven triads by function in major and minor, the diatonic function chart, structural and prolongational diatonic harmony with two worked phrases, the cadential six-four, six cadence types, the six diatonic sequences with a worked phrase.

Part 3, chromatic harmony: applied dominant chords, the five applied dominants of C major in four voices; function and applied chords, embedded phrase models and extended tonicization with the jazz ii–V–I filling the dominant space; applied leading-tone chords, the four chords built on 7̂ in major and minor with their sensitive tones resolved, then the five applied leading-tone chords of C major in four voices; chromatic pre-dominants, the three augmented sixths on single staves with their resolutions and the Neapolitan sixth in four voices with its voice leading marked; the master function and prolongation chart, modal mixture melodic and harmonic with the voice leading for altered tones, and one chart with every chord in both modes and the chromatic pre-dominants across the top with a prolongation panel hanging under each function; quality informs function, a guided analysis, one eight-chord progression drawn seven times, each state adding the next layer from bare notes to a second-level reading.

Part 4, modulation: tonicization against extended tonicization against modulation; modulation as a classical development; the three stages; destabilizing the tonic three ways, the added seventh, the borrowed third, and the tonic passed through in inversion; the pivot chord, an eight-chord keyboard-style phrase from C major to G major with vi6 boxed and read again as ii6/V, the returning C major triad marked as IV/V, and the cadence in the new key bracketed; closely related keys and chromatic modulation, two grids of roman numerals read down the columns.

Playback: 54 of the 62 figures with pitches on them have a play button, the eight left out being the six later states of the guided analysis and the two annotated figured-bass repeats. Sound is synthesized from the noteheads through the Web Audio API.

`assets/notation.js`, shared by every tool.

`tools/chord-finder.html`: up to four spelled notes entered from the bass up, written on a staff and marked on the clock with the semitone distance between adjacent members, the closing span to the bass left undrawn; the stack of thirds with its distances, the quality, the chord symbol, the bass note and its figure; the interval name for two notes. A tonic and mode picker reads the same chord in a key: the roman numeral and its function, in this order of test, diatonic, borrowed from the parallel mode, applied dominant or applied leading-tone chord taking its target's function, then the three augmented sixths and the Neapolitan. The minor v and ♭VII are reported as standing outside the four functions.

`syllabus.html`, at the repo root. Course information, important dates, the catalog description and learning outcomes, assessment and the grade scale, the coursework, the tools, the AI policy, the schedule, policies, and the campus statements. General sections follow the MUS 601 syllabus.

Assessment: twelve homework packets weighted equally at 70%, final analysis 30%.

The twelve homework packets are the end-of-chapter material from Caplin, one packet per chapter read, each due at the start of the first meeting on the next chapter, on paper. Chapters 9 and 10 share packet 9; chapters 13 and 14 share packet 12. Students hand in the Examples for Analysis, work the review questions against Caplin's companion website without handing them in, and are not assigned Model Composition. The compiled PDF is 120 pages: a cover, then twelve packets each opening on a divider page. It is distributed through Canvas rather than the public site.

Packet due dates: 1 Aug 31, 2 Sep 9, 3 Sep 14, 4 Sep 21, 5 Sep 28, 6 Oct 5, 7 Oct 12, 8 Oct 19, 9 Oct 26, 10 Nov 2, 11 Nov 9, 12 Nov 30.

Caplin page ranges per packet: 25–29, 67–72, 93–98, 117–122, 157–165, 186–194, 228–237, 253–258, 301–307, 344–352, 408–419, and 462–474 with 510–518.

`tools/annotation-guide.html`: Caplin's annotation rules against a composed eight-bar sentence in C minor, a two-bar basic idea stated and repeated over a tonic prolongation, then a continuation fragmenting into one-bar units and cadencing PAC. Quarters and halves only, so no beams are needed. Four layers: form, this course's roman numerals, Caplin's roman numerals, and figured bass. Both notations show at once on their own rows, each with its own cadence bracket and boxed cadence; the cadence is part of the roman analysis rather than a layer of its own. Marks carry `data-rule`; pressing a rule lights every mark it governs, and the two band rules light every mark in their layers. Playback reads the staff. The two extra passages take no toggles and no form layer, and each carries a second level below the numerals in the harmony review's treatment, T, M, PD, or D at the head of its span with an accent line running to the end of it. The modulating passage takes a third level below that, one tonic held to the return of I and one pre-dominant held across the modulation to the last ii6, labelled T, PD, D, T: two half-note chords a bar, numerals in this course's notation, and the applied-chord arrow, the extended-tonicization brace, and the pivot brace drawn where they fall.

The two notations differ on seven of the eight chords: i against I, iv against IV, ii°6 against II6, Cad6/4 and V against V(6-4 5-3), and the cadence bracket runs from the pre-dominant in Caplin and from the dominant here.

The syllabus states the coursework in brief and points to guidelines distributed with the packets. Those guidelines are not written.

Awaiting confirmation on the syllabus: the 70/30 split; whether the final analysis keeps its performance component, which is where SLO 4 currently sits; the prerequisite line, left out of the course table; and whether required materials are in fact distributed through Canvas or library reserve. The repertoire, work by work, is not in the schedule.
