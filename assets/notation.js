/* mus 312 shared notation

   Note spelling, staff and clock geometry, the notehead tag, the grand staff
   and single-staff renderers, and playback. Loaded by every tool that draws
   notation. */

var MUS = (function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  function el(name, attrs, text) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) { n.setAttribute(k, attrs[k]); }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }

  /* ---------- shared data ---------- */

  var NAMES = [
    ["C"], ["C\u266F", "D\u266D"], ["D"], ["D\u266F", "E\u266D"], ["E"], ["F"],
    ["F\u266F", "G\u266D"], ["G"], ["G\u266F", "A\u266D"], ["A"],
    ["A\u266F", "B\u266D"], ["B"]
  ];
  var LETTER = ["C", "D", "E", "F", "G", "A", "B"];
  var NATURAL_PC = [0, 2, 4, 5, 7, 9, 11];

  /* ---------- note names ---------- */

  var NOTE_RE = /^([A-G])([#b]?)(\d)$/;

  /* diatonic index: octave times seven plus letter, so a difference of one
     is one staff step whatever the accidentals */
  function noteDia(n) {
    var m = NOTE_RE.exec(n);
    return parseInt(m[3], 10) * 7 + LETTER.indexOf(m[1]);
  }
  function noteAlt(n) {
    var m = NOTE_RE.exec(n);
    return m[2] === "#" ? 1 : (m[2] === "b" ? -1 : 0);
  }

  /* ledger lines for a notehead at a step beyond either edge of a staff,
     measured from the y of its bottom line */
  function ledgers(target, x, step, bottomY) {
    var v;
    if (step <= -2) {
      for (v = -2; v >= step; v -= 2) {
        target.appendChild(el("line", {
          x1: x - 7, y1: bottomY - 6 * v, x2: x + 27, y2: bottomY - 6 * v, "class": "ledger"
        }));
      }
    } else if (step >= 10) {
      for (v = 10; v <= step; v += 2) {
        target.appendChild(el("line", {
          x1: x - 7, y1: bottomY - 6 * v, x2: x + 27, y2: bottomY - 6 * v, "class": "ledger"
        }));
      }
    }
  }

  /* tonic letter index and key signature, for major and for minor */
  var MAJOR_KEYS = [
    { name: "C",       letter: 0, count: 0, kind: null },
    { name: "D\u266D", letter: 1, count: 5, kind: "flat" },
    { name: "D",       letter: 1, count: 2, kind: "sharp" },
    { name: "E\u266D", letter: 2, count: 3, kind: "flat" },
    { name: "E",       letter: 2, count: 4, kind: "sharp" },
    { name: "F",       letter: 3, count: 1, kind: "flat" },
    { name: "F\u266F", letter: 3, count: 6, kind: "sharp" },
    { name: "G",       letter: 4, count: 1, kind: "sharp" },
    { name: "A\u266D", letter: 5, count: 4, kind: "flat" },
    { name: "A",       letter: 5, count: 3, kind: "sharp" },
    { name: "B\u266D", letter: 6, count: 2, kind: "flat" },
    { name: "B",       letter: 6, count: 5, kind: "sharp" }
  ];
  var MINOR_KEYS = [
    { name: "C",       letter: 0, count: 3, kind: "flat" },
    { name: "C\u266F", letter: 0, count: 4, kind: "sharp" },
    { name: "D",       letter: 1, count: 1, kind: "flat" },
    { name: "E\u266D", letter: 2, count: 6, kind: "flat" },
    { name: "E",       letter: 2, count: 1, kind: "sharp" },
    { name: "F",       letter: 3, count: 4, kind: "flat" },
    { name: "F\u266F", letter: 3, count: 3, kind: "sharp" },
    { name: "G",       letter: 4, count: 2, kind: "flat" },
    { name: "G\u266F", letter: 4, count: 5, kind: "sharp" },
    { name: "A",       letter: 5, count: 0, kind: null },
    { name: "B\u266D", letter: 6, count: 5, kind: "flat" },
    { name: "B",       letter: 6, count: 2, kind: "sharp" }
  ];

  var MAJOR_REF = [0, 2, 4, 5, 7, 9, 11];
  var DEG_ACC = { "-1": "\u266D", "1": "\u266F" };
  var DEG_WORD = { "-1": "flat ", "1": "sharp " };

  function mod12(n) { return ((n % 12) + 12) % 12; }

  function degreeAlt(semis, letterOffset) {
    var oct = Math.floor(letterOffset / 7);
    return (semis - 12 * oct) - MAJOR_REF[letterOffset % 7];
  }

  function drawDegree(g, cx, y, degree, alt) {
    if (DEG_ACC[String(alt)]) {
      g.appendChild(el("text", {
        x: cx - 7, y: y - 3, "class": "degree-acc"
      }, DEG_ACC[String(alt)]));
    }
    g.appendChild(el("text", { x: cx, y: y, "class": "degree" }, String(degree)));
  }

  function romanText(g, cx, y, alt, body) {
    var t = el("text", { x: cx, y: y, "class": "roman" });
    if (DEG_ACC[String(alt)]) {
      t.appendChild(el("tspan", { "class": "acc-inline", dy: "-3.5" },
                        DEG_ACC[String(alt)]));
      t.appendChild(el("tspan", { dy: "3.5" }, body));
    } else {
      t.textContent = body;
    }
    g.appendChild(t);
  }

  var SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6];
  var FLAT_ORDER  = [6, 2, 5, 1, 4, 0, 3];
  var SHARP_STEPS = [8, 5, 9, 6, 3, 7, 4];
  var FLAT_STEPS  = [4, 7, 3, 6, 2, 5, 1];
  var KEYSIG_GLYPH = { sharp: "\uE262", flat: "\uE260" };
  var ACC_GLYPH = {
    "-2": "\uE264", "-1": "\uE260", "0": "\uE261", "1": "\uE262", "2": "\uE263"
  };
  var ACC_SIGN = { "-2": "\u266D\u266D", "-1": "\u266D", "0": "", "1": "\u266F", "2": "x" };

  /* scale definitions: semitone offset paired with letter offset */
  var MAJOR    = [[0, 0], [2, 1], [4, 2], [5, 3], [7, 4], [9, 5], [11, 6], [12, 7]];
  var NAT_MIN  = [[0, 0], [2, 1], [3, 2], [5, 3], [7, 4], [8, 5], [10, 6], [12, 7]];
  var HARM_MIN = [[0, 0], [2, 1], [3, 2], [5, 3], [7, 4], [8, 5], [11, 6], [12, 7]];
  var MEL_UP   = [[0, 0], [2, 1], [3, 2], [5, 3], [7, 4], [9, 5], [11, 6], [12, 7]];
  var MEL_DOWN = [[12, 7], [10, 6], [8, 5], [7, 4], [5, 3], [3, 2], [2, 1], [0, 0]];

  /* A staff ends 70 units past the right edge of its last notehead, or at an
     explicit point where the figure is a measure. Every figure drawn with the
     shared module registers here and is closed once all drawing is done. */
  var NOTE_ADV = 20, STAFF_TAIL = 70;
  var STAVES = [], ENDED = {};

  function endStaff(svg, right) {
    if (right === undefined) {
      if (ENDED[svg.id]) { return; }
      var last = 0;
      Array.prototype.forEach.call(svg.querySelectorAll("text.notehead"), function (t) {
        var x = parseFloat(t.getAttribute("x"));
        if (x > last) { last = x; }
      });
      right = last + NOTE_ADV + STAFF_TAIL;
    }
    ENDED[svg.id] = true;
    Array.prototype.forEach.call(svg.querySelectorAll("line.staff-line"), function (l) {
      if (l.getAttribute("y1") === l.getAttribute("y2")) { l.setAttribute("x2", right); }
    });
  }

  function closeStaves() {
    STAVES.forEach(function (svg) { endStaff(svg); });
  }

  /* a figure joins the list once, however often it is redrawn */
  function register(svg) {
    if (STAVES.indexOf(svg) < 0) { STAVES.push(svg); }
  }

  /* ---------- noteheads ---------- */

  /* A notehead records the pitch it draws and the column it belongs to, so a
     figure can be played back from what is on the staff. `col` is the nominal
     x of the chord, which differs from `x` where a second is displaced. */
  function head(x, y, cls, note, opt) {
    opt = opt || {};
    var a = {
      x: x, y: y, "class": cls,
      "data-note": note,
      "data-col": opt.col === undefined ? x : opt.col
    };
    if (opt.dur) { a["data-dur"] = opt.dur; }
    if (opt.beat !== undefined) { a["data-beat"] = opt.beat; }
    return el("text", a, opt.glyph || "\uE0A2");
  }

  /* the sounding name of a pitch, with ascii accidentals and an octave */
  var ASCII_ACC = { "-2": "bb", "-1": "b", "0": "", "1": "#", "2": "##" };
  function pitchOf(letterIndex, alt, step) {
    return LETTER[letterIndex] + ASCII_ACC[String(alt)] +
           Math.floor((noteDia("E4") + step) / 7);
  }

  /* ---------- geometry ---------- */

  var SP = 12, ROW_H = 215, ROW_TOP = 80;
  function rowTop(r) { return ROW_TOP + ROW_H * r; }
  function noteY(step, r) { return rowTop(r) + 48 - (SP / 2) * step; }

  var CX = 220, CY = 220;
  var R_SPOKE_IN = 36, R_SPOKE_OUT = 100, R_NUM = 114, R_RIM = 130,
      R_NAME = 156, R_ARROW = 184, R_ARROW_LABEL = 202;

  function ang(pc) { return (-90 + 30 * pc) * Math.PI / 180; }
  function px(pc, r) { return CX + r * Math.cos(ang(pc)); }
  function py(pc, r) { return CY + r * Math.sin(ang(pc)); }
  function arc(from, to, r, inset) {
    var a1 = ang(from) + inset, a2 = ang(to) - inset;
    return "M" + (CX + r * Math.cos(a1)) + " " + (CY + r * Math.sin(a1)) +
           " A " + r + " " + r + " 0 0 1 " +
           (CX + r * Math.cos(a2)) + " " + (CY + r * Math.sin(a2));
  }
  var INSET = 6 * Math.PI / 180;

  /* Two chord tones a second apart cannot share a column. Pairs are taken from
     the top down, and a note already displaced is left where it is. `low` and
     `high` are the shifts given to the lower and upper of a pair. Returns the
     notes low to high with a map from note name to its shift. */
  function secondsShift(notes, low, high) {
    var order = notes.slice().sort(function (a, b) { return noteDia(a) - noteDia(b); });
    var shift = {};
    for (var k = order.length - 1; k > 0; k--) {
      if (noteDia(order[k]) - noteDia(order[k - 1]) === 1 && !shift[order[k]]) {
        if (low) { shift[order[k - 1]] = low; }
        if (high) { shift[order[k]] = high; }
      }
    }
    return { order: order, shift: shift };
  }

  /* ---------- arrows ---------- */

  /* an arrowhead marker in a figure's own defs, returned as a url() reference */
  function arrowMarker(target, id, w, refX, cls) {
    var defs = el("defs", {});
    var m = el("marker", {
      id: id, markerWidth: w, markerHeight: w, refX: refX, refY: w / 2,
      orient: "auto", markerUnits: "userSpaceOnUse"
    });
    m.appendChild(el("path", {
      d: "M0,0 L" + w + "," + (w / 2) + " L0," + w + " z", "class": cls
    }));
    defs.appendChild(m);
    target.appendChild(defs);
    return "url(#" + id + ")";
  }

  /* a block arrow running from x1 to x2, centred on y */
  var ARROW_WIDE = { s: 6, hw: 26, hh: 15 };
  var ARROW_NARROW = { s: 5, hw: 22, hh: 13 };

  function blockArrow(svg, x1, x2, y, size) {
    var s = size.s, hw = size.hw, hh = size.hh;
    svg.appendChild(el("polygon", {
      points: [
        x1 + "," + (y - s), (x2 - hw) + "," + (y - s), (x2 - hw) + "," + (y - hh),
        x2 + "," + y, (x2 - hw) + "," + (y + hh), (x2 - hw) + "," + (y + s),
        x1 + "," + (y + s)
      ].join(" "),
      "class": "fn-arrow"
    }));
  }

  /* ---------- chord types ---------- */

  var TRIAD_TYPES = [
    { steps: [3, 3], abbr: "\u00B0", name: "diminished", sym: "\u00B0", upper: false },
    { steps: [3, 4], abbr: "m",      name: "minor",      sym: "-",      upper: false },
    { steps: [4, 3], abbr: "M",      name: "major",      sym: "",       upper: true  },
    { steps: [4, 4], abbr: "+",      name: "augmented",  sym: "+",      upper: true  }
  ];
  var SEVENTH_TYPES = [
    { steps: [3, 3, 3], abbr: "\u00B07", name: "fully diminished seventh",  sym: "\u00B07", upper: false },
    { steps: [3, 3, 4], abbr: "\u00F87", name: "half-diminished seventh",   sym: "\u00F87", upper: false },
    { steps: [3, 4, 3], abbr: "mm7",     name: "minor seventh",             sym: "-7",      upper: false },
    { steps: [3, 4, 4], abbr: "mM7",     name: "minor-major seventh",       sym: "-M7",     upper: false },
    { steps: [4, 3, 3], abbr: "Mm7",     name: "dominant seventh",          sym: "7",       upper: true  },
    { steps: [4, 3, 4], abbr: "MM7",     name: "major seventh",             sym: "M7",      upper: true  },
    { steps: [4, 4, 3], abbr: "+M7",     name: "augmented major seventh",   sym: "+M7",     upper: true  }
  ];

  /* the chord type a stack of thirds makes, by its semitone steps */
  function chordType(steps) {
    var key = steps.join(",");
    var all = TRIAD_TYPES.concat(SEVENTH_TYPES), i;
    for (i = 0; i < all.length; i++) {
      if (all[i].steps.join(",") === key) { return all[i]; }
    }
    return null;
  }

  /* ---------- spelling ---------- */

  function keySigMap(key) {
    var order = key.kind === "flat" ? FLAT_ORDER : SHARP_ORDER;
    var m = {};
    for (var a = 0; a < key.count; a++) {
      m[order[a]] = key.kind === "flat" ? -1 : 1;
    }
    return m;
  }

  function spellNote(tonic, key, pair) {
    var semis = pair[0], lo = pair[1];
    var li = (key.letter + lo) % 7;
    var pc = (tonic + semis) % 12;
    var alt = mod12(pc - NATURAL_PC[li] + 6) - 6;
    return {
      pc: pc,
      letterIndex: li,
      step: key.letter + lo - 2,
      degree: (lo % 7) + 1,
      alt: alt,
      name: LETTER[li] + ACC_SIGN[String(alt)],
      pitch: pitchOf(li, alt, key.letter + lo - 2)
    };
  }

  /* ---------- sound ---------- */

  /* Playback reads the staff rather than a second copy of the music: every
     notehead records its pitch, its column, and where the figure is metered,
     its beat and its length in beats. */

  var PITCH_RE = /^([A-G])(b{1,2}|#{1,2})?(\d)$/;
  var PARTIALS = [[1, 1], [2, 0.4], [3, 0.15], [4, 0.06]];
  var CHORD_BEAT = 0.85, LINE_BEAT = 0.48, RING = 1.7;
  var CTX = null, current = null;

  function context() {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) { return null; }
    if (!CTX) { CTX = new Ctor(); }
    if (CTX.state === "suspended" && CTX.resume) { CTX.resume(); }
    return CTX;
  }

  function pitchHz(name) {
    var m = PITCH_RE.exec(name);
    if (!m) { return 0; }
    var acc = m[2] || "";
    var alt = acc.charAt(0) === "#" ? acc.length : -acc.length;
    var midi = 12 * (parseInt(m[3], 10) + 1) +
               NATURAL_PC[LETTER.indexOf(m[1])] + alt;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function strike(ctx, hz, at, dur, level, nodes) {
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, at);
    out.gain.exponentialRampToValueAtTime(level, at + 0.014);
    out.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    out.connect(ctx.destination);
    PARTIALS.forEach(function (p) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = hz * p[0];
      g.gain.value = p[1];
      o.connect(g);
      g.connect(out);
      o.start(at);
      o.stop(at + dur + 0.06);
      nodes.push(o);
    });
  }

  /* One entry per sounding notehead, ordered by onset. A figure with no beat
     marked sounds one column to a beat. */
  function figureNotes(svg) {
    var heads = Array.prototype.filter.call(
      svg.querySelectorAll("text.notehead"),
      function (t) {
        return t.getAttribute("data-note") && !t.getAttribute("data-tie") &&
               t.getAttribute("class").indexOf("optional") < 0;
      }
    );
    var order = [], seen = {};
    heads.forEach(function (t) {
      var c = parseFloat(t.getAttribute("data-col"));
      if (!seen[c]) { seen[c] = true; order.push(c); }
    });
    order.sort(function (a, b) { return a - b; });
    var index = {};
    order.forEach(function (c, i) { index[c] = i; });
    return heads.map(function (t) {
      var beat = t.getAttribute("data-beat");
      var dur = parseFloat(t.getAttribute("data-dur"));
      return {
        head: t,
        note: t.getAttribute("data-note"),
        at: beat === null ? index[parseFloat(t.getAttribute("data-col"))]
                          : parseFloat(beat),
        beats: dur > 0 ? dur : 1
      };
    }).sort(function (a, b) { return a.at - b.at; });
  }

  function stopPlaying() {
    if (!current) { return; }
    var c = current;
    current = null;
    c.timers.forEach(function (t) { window.clearTimeout(t); });
    c.lit.forEach(function (h) { h.classList.remove("sounding"); });
    c.nodes.forEach(function (o) {
      try { o.stop(c.ctx.currentTime + 0.04); } catch (err) { return; }
    });
    c.button.setAttribute("aria-pressed", "false");
  }

  function playFigure(svg, button) {
    stopPlaying();
    var ctx = context();
    if (!ctx) { return; }
    var notes = figureNotes(svg);
    if (!notes.length) { return; }

    var chordal = notes.some(function (n, i) {
      return i > 0 && n.at === notes[i - 1].at;
    });
    var beat = chordal ? CHORD_BEAT : LINE_BEAT;
    var voices = {};
    notes.forEach(function (n) { voices[n.at] = (voices[n.at] || 0) + 1; });

    var state = { ctx: ctx, button: button, nodes: [], timers: [], lit: [] };
    current = state;
    button.setAttribute("aria-pressed", "true");

    var start = ctx.currentTime + 0.06, end = 0;
    notes.forEach(function (n) {
      var hz = pitchHz(n.note);
      var dur = n.beats * beat;
      if (hz) {
        strike(ctx, hz, start + n.at * beat, dur * RING,
               0.26 / Math.sqrt(voices[n.at]), state.nodes);
      }
      state.timers.push(window.setTimeout(function () {
        n.head.classList.add("sounding");
        state.lit.push(n.head);
      }, n.at * beat * 1000));
      state.timers.push(window.setTimeout(function () {
        n.head.classList.remove("sounding");
      }, (n.at + n.beats) * beat * 1000));
      end = Math.max(end, n.at * beat + dur * RING);
    });
    state.timers.push(window.setTimeout(stopPlaying, end * 1000 + 200));
  }

  /* A play button under every figure that has pitches on it, labelled from the
     headings it sits under. */
  function playButtons() {
    var section = "", panel = "";
    Array.prototype.forEach.call(
      document.querySelectorAll(".wrap h1, .wrap h2, .wrap h3, .wrap svg"),
      function (node) {
        var tag = node.tagName;
        if (tag === "H1" || tag === "H2") {
          section = node.textContent.trim();
          panel = "";
          return;
        }
        if (tag === "H3") { panel = node.textContent.trim(); return; }
        if (node.getAttribute("data-play") === "no") { return; }
        if (!node.querySelector("text.notehead[data-note]")) { return; }

        var bar = document.createElement("div");
        var button = document.createElement("button");
        bar.className = "controls";
        button.type = "button";
        button.className = "play";
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label",
          "play " + (panel ? panel + ", " + section : section));
        button.appendChild(document.createTextNode("play"));
        button.addEventListener("click", function () {
          if (current && current.button === button) { stopPlaying(); }
          else { playFigure(node, button); }
        });
        bar.appendChild(button);
        node.parentNode.insertBefore(bar, node.nextSibling);
      }
    );
  }

  /* ---------- grand staff ---------- */

  var GS = {
    trebleTop: 66, trebleBottom: 114,
    bassTop: 178, bassBottom: 226,
    trebleRef: noteDia("E4"), bassRef: noteDia("G2")
  };

  /* Both staves, both clefs, the opening barline, and a flat key signature.
     Returns the signature as a map from letter index to alteration. */
  function grandStaff(svg, flats) {
    register(svg);
    [GS.trebleTop, GS.bassTop].forEach(function (topY) {
      for (var L = 0; L < 5; L++) {
        svg.appendChild(el("line", {
          x1: 10, y1: topY + 12 * L, x2: 10, y2: topY + 12 * L, "class": "staff-line"
        }));
      }
    });
    svg.appendChild(el("text", { x: 18, y: GS.trebleBottom - 12, "class": "clef" }, "\uE050"));
    svg.appendChild(el("text", { x: 18, y: GS.bassBottom - 36, "class": "clef" }, "\uE062"));
    svg.appendChild(el("line", {
      x1: 10, y1: GS.trebleTop, x2: 10, y2: GS.bassBottom, "class": "staff-line"
    }));
    var sig = {};
    for (var b = 0; b < (flats || 0); b++) {
      sig[FLAT_ORDER[b]] = -1;
      svg.appendChild(el("text", {
        x: 56 + 13 * b, y: GS.trebleBottom - 6 * FLAT_STEPS[b], "class": "keysig"
      }, KEYSIG_GLYPH.flat));
      svg.appendChild(el("text", {
        x: 56 + 13 * b, y: GS.bassBottom - 6 * (FLAT_STEPS[b] - 2), "class": "keysig"
      }, KEYSIG_GLYPH.flat));
    }
    return sig;
  }

  function gsY(note, which) {
    var bottomY = which === "b" ? GS.bassBottom : GS.trebleBottom;
    var ref = which === "b" ? GS.bassRef : GS.trebleRef;
    return bottomY - 6 * (noteDia(note) - ref);
  }

  /* One notehead with its ledger lines, and its accidental where a key
     signature is given and does not already supply it. */
  function gsNote(svg, x, note, which, opt) {
    opt = opt || {};
    var bottomY = which === "b" ? GS.bassBottom : GS.trebleBottom;
    var ref = which === "b" ? GS.bassRef : GS.trebleRef;
    var step = noteDia(note) - ref, y = bottomY - 6 * step;
    ledgers(svg, x, step, bottomY);
    if (opt.sig) {
      var alt = noteAlt(note);
      if (alt !== (opt.sig[LETTER.indexOf(note.charAt(0))] || 0)) {
        svg.appendChild(el("text", {
          x: (opt.accX === undefined ? x : opt.accX) - 17, y: y,
          "class": "accidental" + (opt.lit ? " lit-" + opt.lit : "")
        }, ACC_GLYPH[String(alt)]));
      }
    }
    svg.appendChild(head(x, y, "notehead" + (opt.lit ? " lit-" + opt.lit : ""), note, {
      col: opt.accX === undefined ? x : opt.accX, glyph: opt.head,
      dur: opt.dur, beat: opt.beat
    }));
    return y;
  }

  /* ---------- single-staff chords ---------- */

  /* the single staff sits where row 0 of a part 1 figure sits */
  function stepOf(n) { return noteDia(n) - GS.trebleRef; }

  var TOP = ROW_TOP;
  var RN_Y = TOP + 108;

  function staff(svg) {
    register(svg);
    for (var L = 0; L < 5; L++) {
      svg.appendChild(el("line", {
        x1: 10, y1: TOP + 12 * L, x2: 10, y2: TOP + 12 * L, "class": "staff-line"
      }));
    }
    svg.appendChild(el("text", { x: 18, y: noteY(2, 0), "class": "clef" }, "\uE050"));
  }

  function chord(g, x, notes, hot, cool) {
    hot = hot || [];
    cool = cool || [];

    var col = secondsShift(notes, 0, 13);
    var set = col.order.map(function (n) {
      return { n: n, s: stepOf(n), a: noteAlt(n), dx: col.shift[n] || 0 };
    });

    function tint(n) {
      return hot.indexOf(n) >= 0 ? " hot" : (cool.indexOf(n) >= 0 ? " cool" : "");
    }

    var accCount = 0;
    set.slice().reverse().forEach(function (p) {
      var y = noteY(p.s, 0), nx = x + p.dx;
      ledgers(g, nx, p.s, noteY(0, 0));
      if (p.a !== 0) {
        g.appendChild(el("text", {
          x: x - 17 - 13 * accCount, y: y, "class": "accidental" + tint(p.n)
        }, ACC_GLYPH[String(p.a)]));
        accCount += 1;
      }
      g.appendChild(head(nx, y, "notehead" + tint(p.n), p.n, { col: x }));
    });
  }

  /* a straight arrow from one notehead to the note it resolves to */
  function resolveArrow(g, x0, y0, x1, y1, cls) {
    var line = cls ? "arrow " + cls : "res-line";
    var head = cls ? "arrowhead-fill " + cls : "res-head";
    g.appendChild(el("line", { x1: x0, y1: y0, x2: x1, y2: y1, "class": line }));
    var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy);
    dx /= L; dy /= L;
    var nx = -dy, ny = dx, HL = 7, HW = 2.8;
    g.appendChild(el("path", {
      d: "M" + x1 + " " + y1 +
         " L" + (x1 - HL * dx + HW * nx) + " " + (y1 - HL * dy + HW * ny) +
         " L" + (x1 - HL * dx - HW * nx) + " " + (y1 - HL * dy - HW * ny) + " z",
      "class": head
    }));
  }

  function targetMark(g, x, cy) {
    g.appendChild(el("circle", { cx: x + 10, cy: cy, r: 6.5, "class": "target-ring" }));
    g.appendChild(el("circle", { cx: x + 10, cy: cy, r: 2, "class": "target-dot" }));
  }

  /* a curve rising from one roman numeral and falling into the next */
  function arrow(g, x0, x1, baseY) {
    var sx = x0, sy = baseY - 18;
    var ex = x1 - 4, ey = baseY - 15;
    var cx = x0 + (x1 - x0) * 0.6, cy = baseY - 40;
    g.appendChild(el("path", {
      d: "M" + sx + " " + sy + " Q" + cx + " " + cy + " " + ex + " " + ey,
      "class": "app-arrow"
    }));
    var dx = ex - cx, dy = ey - cy, len = Math.sqrt(dx * dx + dy * dy);
    dx /= len; dy /= len;
    var nx = -dy, ny = dx, L = 9, W = 3.4;
    g.appendChild(el("path", {
      d: "M" + ex + " " + ey +
         " L" + (ex - L * dx + W * nx) + " " + (ey - L * dy + W * ny) +
         " L" + (ex - L * dx - W * nx) + " " + (ey - L * dy - W * ny) + " z",
      "class": "app-head"
    }));
  }

  return {
    SVGNS: SVGNS,
    el: el,
    NAMES: NAMES,
    LETTER: LETTER,
    NATURAL_PC: NATURAL_PC,
    noteDia: noteDia,
    noteAlt: noteAlt,
    ledgers: ledgers,
    MAJOR_KEYS: MAJOR_KEYS,
    MINOR_KEYS: MINOR_KEYS,
    DEG_WORD: DEG_WORD,
    DEG_ACC: DEG_ACC,
    mod12: mod12,
    degreeAlt: degreeAlt,
    drawDegree: drawDegree,
    romanText: romanText,
    FLAT_ORDER: FLAT_ORDER,
    SHARP_ORDER: SHARP_ORDER,
    SHARP_STEPS: SHARP_STEPS,
    FLAT_STEPS: FLAT_STEPS,
    KEYSIG_GLYPH: KEYSIG_GLYPH,
    ACC_GLYPH: ACC_GLYPH,
    ACC_SIGN: ACC_SIGN,
    MAJOR: MAJOR,
    NAT_MIN: NAT_MIN,
    HARM_MIN: HARM_MIN,
    MEL_UP: MEL_UP,
    MEL_DOWN: MEL_DOWN,
    STAVES: STAVES,
    endStaff: endStaff,
    register: register,
    closeStaves: closeStaves,
    head: head,
    pitchOf: pitchOf,
    ROW_TOP: ROW_TOP,
    rowTop: rowTop,
    noteY: noteY,
    SP: SP,
    CX: CX,
    CY: CY,
    R_SPOKE_IN: R_SPOKE_IN,
    R_SPOKE_OUT: R_SPOKE_OUT,
    R_NUM: R_NUM,
    R_RIM: R_RIM,
    R_NAME: R_NAME,
    R_ARROW: R_ARROW,
    R_ARROW_LABEL: R_ARROW_LABEL,
    ang: ang,
    px: px,
    py: py,
    arc: arc,
    INSET: INSET,
    secondsShift: secondsShift,
    arrowMarker: arrowMarker,
    ARROW_WIDE: ARROW_WIDE,
    ARROW_NARROW: ARROW_NARROW,
    blockArrow: blockArrow,
    keySigMap: keySigMap,
    spellNote: spellNote,
    TRIAD_TYPES: TRIAD_TYPES,
    SEVENTH_TYPES: SEVENTH_TYPES,
    chordType: chordType,
    playButtons: playButtons,
    playFigure: playFigure,
    stopPlaying: stopPlaying,
    pitchHz: pitchHz,
    GS: GS,
    grandStaff: grandStaff,
    gsY: gsY,
    gsNote: gsNote,
    stepOf: stepOf,
    TOP: TOP,
    RN_Y: RN_Y,
    staff: staff,
    chord: chord,
    resolveArrow: resolveArrow,
    targetMark: targetMark,
    arrow: arrow
  };
})();
