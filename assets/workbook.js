/* mus 312 workbook pages.
   Draws the staff paper a set writes on, and prints the page.

   Every svg.answer takes data-staff:
     "single"   one treble staff
     "grand"    both staves
     "bass"     one bass staff, for a bass line written on its own
     "chord"    one staff to an example, sized to what it holds
     "sonority" a passage written out on a staff of its own, to be named
     "blank"    a staff of its own to write on, data-chords wide
     "figured"  a full-width bass line with its figures already set
     "numerals" both staves with roman numerals already set beneath
   Any of these takes data-flats or data-sharps for its key signature.
   data-bass names the bass notes and data-fig the figure under each of them,
   chords separated by bars and the figures of one chord by commas. A sonority
   staff takes data-up for the three voices above its bass. Any staff takes
   data-key, drawn under the bass clef, and data-num, drawn above. */
(function () {
  "use strict";

  var VIEW = {
    single: "0 20 1600 190",
    grand: "0 14 1600 276",
    bass: "0 120 1600 230",
    figured: "0 14 1600 400",
    numerals: "0 14 1600 400"
  };

  var FIRST = 150, LAST = 1440, TAIL = 70, SCALE = 0.75;
  /* the G clef reaches 53 above its baseline at 102, so the item number
     clears it at NUM_Y and the box opens above that */
  var FIG_Y = 250, FIG_STEP = 17, ROMAN_Y = 272, NUM_Y = 42, CHORD_ADV = 130;
  /* the key stands under the bass clef, boxed */
  var KEY_X = 14, KEY_Y = 264, KEY_SIZE = 19, KEY_PAD = 8;
  var ACC_W = { "\u266D": 0.32, "\u266F": 0.34, "\u266E": 0.26 };

  function count(svg, name) {
    return parseInt(svg.getAttribute(name) || "0", 10);
  }

  /* every chord on the system, evenly spread */
  function slots(n) {
    if (n < 2) { return [FIRST]; }
    var step = (LAST - FIRST) / (n - 1), out = [], i;
    for (i = 0; i < n; i++) { out.push(FIRST + i * step); }
    return out;
  }

  /* Any label a page sets: a key, a figure, a numeral. An accidental comes
     from Bravura, raised off the baseline, since neither Plex face carries
     the sign. Returns roughly how wide the label runs. */
  function marks(node, label, size) {
    var width = 0, run = "", dy = null;
    function flush() {
      if (!run) { return; }
      node.appendChild(MUS.el("tspan", dy ? { dy: dy } : {}, run));
      run = "";
      dy = null;
    }
    label.split("").forEach(function (ch) {
      if (ACC_W[ch]) {
        flush();
        node.appendChild(MUS.el("tspan", { "class": "acc-inline", dy: "-3" }, ch));
        dy = "3";
        width += ACC_W[ch] * size;
      } else {
        run += ch;
        width += 0.6 * size;
      }
    });
    flush();
    return width;
  }

  function keyBox(svg, label) {
    var text = MUS.el("text", { x: KEY_X + KEY_PAD, y: KEY_Y, "class": "keylabel" });
    var width = marks(text, label, KEY_SIZE);
    svg.appendChild(MUS.el("rect", {
      x: KEY_X, y: KEY_Y - KEY_SIZE + 3, width: Math.round(width) + KEY_PAD * 2,
      height: KEY_SIZE + 7, "class": "keybox"
    }));
    svg.appendChild(text);
  }

  function figures(svg, x, list) {
    list.split(",").filter(Boolean).forEach(function (f, row) {
      var t = MUS.el("text", { x: x + 7, y: FIG_Y + row * FIG_STEP, "class": "figbass" });
      marks(t, f, 14);
      svg.appendChild(t);
    });
  }

  function bassLine(svg, sig, at) {
    var notes = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean);
    var chords = (svg.getAttribute("data-fig") || "").split("|");
    notes.forEach(function (note, i) {
      MUS.gsNote(svg, at[i], note, "b", { sig: sig });
      figures(svg, at[i], chords[i] || "");
      /* a bass note held under changing figures carries each row across */
      if (i && notes[i] === notes[i - 1]) {
        var rows = Math.min((chords[i - 1] || "").split(",").filter(Boolean).length,
                            (chords[i] || "").split(",").filter(Boolean).length);
        for (var r = 0; r < rows; r++) {
          svg.appendChild(MUS.el("line", {
            x1: at[i - 1] + 14, y1: FIG_Y + r * FIG_STEP - 4,
            x2: at[i], y2: FIG_Y + r * FIG_STEP - 4, "class": "figline"
          }));
        }
      }
    });
    return notes.length ? at[notes.length - 1] : FIRST;
  }

  /* a compact staff is no wider than what it holds, and is then held to
     three quarters of that width so the notation keeps the house scale */
  function box(svg, last) {
    var width = last + TAIL + 10;
    svg.setAttribute("viewBox", "0 14 " + width + " 336");
    svg.style.maxWidth = Math.round(width * SCALE) + "px";
    return last;
  }

  /* one example on a staff of its own, no wider than what it holds */
  function chord(svg) {
    var sig = MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    var notes = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean);
    var at = notes.map(function (n, i) { return FIRST + i * CHORD_ADV; });
    return box(svg, bassLine(svg, sig, at));
  }

  /* one chord in keyboard style, written out for the student to name */
  /* a note takes an accidental where its spelling differs from the signature */
  function altered(note, sig) {
    var m = /^([A-G])(#|b)?/.exec(note);
    var letter = "CDEFGAB".indexOf(m[1]);
    var alt = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
    return alt !== (sig[letter] || 0);
  }

  /* accidentals stack in one column, so two of them close together step left */
  function columns(notes, sig, which) {
    var marked = notes.filter(function (n) { return altered(n, sig); })
      .map(function (n) { return { note: n, y: MUS.gsY(n, which) }; })
      .sort(function (a, b) { return a.y - b.y; });
    var out = {}, col = 0;
    marked.forEach(function (m, i) {
      col = (i && m.y - marked[i - 1].y < 22) ? col + 1 : 0;
      out[m.note] = col;
    });
    return out;
  }

  function sonority(svg) {
    var sig = MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    var basses = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean);
    var chords = (svg.getAttribute("data-up") || "").split("|");
    var last = FIRST;

    basses.forEach(function (bass, i) {
      var x = FIRST + i * CHORD_ADV;
      MUS.gsNote(svg, x, bass, "b", { sig: sig, col: x });
      var up = (chords[i] || "").split(/\s+/).filter(Boolean);
      var shift = MUS.secondsShift(up, 0, 13).shift;
      var col = columns(up, sig, "t");
      up.forEach(function (note) {
        MUS.gsNote(svg, x + (shift[note] || 0), note, "t",
                   { sig: sig, col: x, accX: x - 13 * (col[note] || 0) });
      });
      last = x;
    });

    return box(svg, last);
  }

  /* a compact staff with nothing on it, wide enough for data-chords chords */
  function blank(svg) {
    MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    var n = parseInt(svg.getAttribute("data-chords") || "3", 10), at = [], i;
    for (i = 0; i < n; i++) { at.push(FIRST + i * CHORD_ADV); }
    /* a blank staff may name the chord it wants written on it */
    if (svg.getAttribute("data-roman")) { numerals(svg, at); }
    return box(svg, at[n - 1]);
  }

  function figuredBass(svg) {
    var sig = MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    var n = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean).length;
    var at = slots(n);
    var end = bassLine(svg, sig, at);
    /* a bass line may carry its numerals already, leaving only the reading */
    if (svg.getAttribute("data-roman")) { numerals(svg, at); }
    return end;
  }

  function numerals(svg, at) {
    var list = (svg.getAttribute("data-roman") || "").split(";").filter(Boolean);
    at = at || slots(list.length);
    list.forEach(function (r, i) {
      var t = MUS.el("text", { x: at[i] + 7, y: ROMAN_Y, "class": "roman" });
      marks(t, r, 15);
      svg.appendChild(t);
    });
    return at[at.length - 1];
  }

  function draw(svg) {
    var kind = svg.getAttribute("data-staff");
    if (["chord", "sonority", "blank"].indexOf(kind) < 0 && !VIEW[kind]) { kind = "single"; }
    if (VIEW[kind]) { svg.setAttribute("viewBox", VIEW[kind]); }
    var end = null;
    if (kind === "single") {
      MUS.staff(svg);
    } else if (kind === "bass") {
      MUS.bassStaff(svg);
    } else if (kind === "chord") {
      end = chord(svg);
    } else if (kind === "sonority") {
      end = sonority(svg);
    } else if (kind === "blank") {
      end = blank(svg);
    } else if (kind === "figured") {
      end = figuredBass(svg);
    } else if (kind === "numerals") {
      MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
      end = numerals(svg);
    } else {
      MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    }
    MUS.endStaff(svg, end === null ? 1580 : Math.min(1580, end + TAIL));
    var num = svg.getAttribute("data-num");
    if (num) {
      svg.appendChild(MUS.el("text", { x: 18, y: NUM_Y, "class": "itemnum" }, num));
    }
    var key = svg.getAttribute("data-key");
    if (key) { keyBox(svg, key); }
  }

  /* the dark ground is a screen setting: a printed page is always on paper */
  function onPaper(state) {
    document.documentElement.classList.toggle("on-paper", state);
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("svg.answer"), draw);

    var host = document.querySelector(".controls");
    if (host) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "print";
      b.appendChild(document.createTextNode("print or save as PDF"));
      b.addEventListener("click", function () { window.print(); });
      host.appendChild(b);
    }

    window.addEventListener("beforeprint", function () { onPaper(true); });
    window.addEventListener("afterprint", function () { onPaper(false); });

    /* Safari and older WebKit fire the media query rather than the events */
    if (window.matchMedia) {
      var mq = window.matchMedia("print");
      if (mq.addEventListener) {
        mq.addEventListener("change", function (e) { onPaper(e.matches); });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
