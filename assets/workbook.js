/* mus 312 workbook pages.
   Draws the staff paper a set writes on, and prints the page.

   Every svg.answer takes data-staff:
     "single"   one treble staff
     "grand"    both staves
     "chord"    one staff to an example, sized to what it holds
     "figured"  a full-width bass line with its figures already set
     "numerals" both staves with roman numerals already set beneath
   Any of these takes data-flats or data-sharps for its key signature.
   data-bass names the bass notes and data-fig the figure under each of them,
   chords separated by bars and the figures of one chord by commas. A chord
   staff also takes data-key and data-num, set above the staff. */
(function () {
  "use strict";

  var VIEW = {
    single: "0 20 1600 190",
    grand: "0 30 1600 260",
    figured: "0 30 1600 320",
    numerals: "0 30 1600 320"
  };

  var FIRST = 150, LAST = 1440, TAIL = 70, SCALE = 0.75;
  var FIG_Y = 250, FIG_STEP = 17, ROMAN_Y = 252, NUM_Y = 52, CHORD_ADV = 130;
  /* the key stands under the bass clef, boxed */
  var KEY_X = 14, KEY_Y = 264, KEY_SIZE = 19, KEY_PAD = 8;
  var KEY_ADV = { "\u266D": 0.32, "\u266F": 0.34 };

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

  /* the key label: a Bravura accidental where the name takes one, since
     neither Plex face carries the sign */
  function keyBox(svg, label) {
    var text = MUS.el("text", { x: KEY_X + KEY_PAD, y: KEY_Y, "class": "keylabel" });
    var width = 0, run = "", dy = null;
    /* the accidental is raised, and whatever follows it drops back */
    function flush() {
      if (!run) { return; }
      text.appendChild(MUS.el("tspan", dy ? { dy: dy } : {}, run));
      run = "";
      dy = null;
    }
    label.split("").forEach(function (ch) {
      if (KEY_ADV[ch]) {
        flush();
        text.appendChild(MUS.el("tspan", { "class": "acc-inline", dy: "-3" }, ch));
        dy = "3";
        width += KEY_ADV[ch] * KEY_SIZE;
      } else {
        run += ch;
        width += 0.6 * KEY_SIZE;
      }
    });
    flush();
    svg.appendChild(MUS.el("rect", {
      x: KEY_X, y: KEY_Y - KEY_SIZE + 3, width: Math.round(width) + KEY_PAD * 2,
      height: KEY_SIZE + 7, "class": "keybox"
    }));
    svg.appendChild(text);
  }

  function figures(svg, x, list) {
    list.split(",").filter(Boolean).forEach(function (f, row) {
      svg.appendChild(MUS.el("text", {
        x: x + 7, y: FIG_Y + row * FIG_STEP, "class": "figbass"
      }, f));
    });
  }

  function bassLine(svg, sig, at) {
    var notes = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean);
    var chords = (svg.getAttribute("data-fig") || "").split("|");
    notes.forEach(function (note, i) {
      MUS.gsNote(svg, at[i], note, "b", { sig: sig });
      figures(svg, at[i], chords[i] || "");
    });
    return at[notes.length - 1];
  }

  /* one example on a staff of its own, no wider than what it holds */
  function chord(svg) {
    var sig = MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    var notes = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean);
    var at = notes.map(function (n, i) { return FIRST + i * CHORD_ADV; });
    var last = bassLine(svg, sig, at);

    var num = svg.getAttribute("data-num");
    if (num) {
      svg.appendChild(MUS.el("text", { x: 18, y: NUM_Y, "class": "itemnum" }, num));
    }

    var width = last + TAIL + 10;
    svg.setAttribute("viewBox", "0 30 " + width + " 320");
    svg.style.width = Math.round(width * SCALE) + "px";
    svg.style.maxWidth = Math.round(width * SCALE) + "px";
    return last;
  }

  function figuredBass(svg) {
    var sig = MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    var n = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean).length;
    return bassLine(svg, sig, slots(n));
  }

  function numerals(svg) {
    var list = (svg.getAttribute("data-roman") || "").split(";").filter(Boolean);
    var at = slots(list.length);
    list.forEach(function (r, i) {
      svg.appendChild(MUS.el("text", { x: at[i], y: ROMAN_Y, "class": "roman" }, r));
    });
    return at[at.length - 1];
  }

  function draw(svg) {
    var kind = svg.getAttribute("data-staff");
    if (kind !== "chord" && !VIEW[kind]) { kind = "single"; }
    if (VIEW[kind]) { svg.setAttribute("viewBox", VIEW[kind]); }
    var end = null;
    if (kind === "single") {
      MUS.staff(svg);
    } else if (kind === "chord") {
      end = chord(svg);
    } else if (kind === "figured") {
      end = figuredBass(svg);
    } else if (kind === "numerals") {
      MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
      end = numerals(svg);
    } else {
      MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    }
    MUS.endStaff(svg, end === null ? 1580 : Math.min(1580, end + TAIL));
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
