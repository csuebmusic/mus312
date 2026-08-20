/* mus 312 workbook pages.
   Draws the staff paper a set writes on, and prints the page.

   Every svg.answer takes data-staff:
     "single"   one treble staff
     "grand"    both staves
     "figured"  both staves with a bass line and its figures already set
     "numerals" both staves with roman numerals already set beneath
   A grand or numerals staff takes data-flats or data-sharps for its key
   signature. On a figured staff data-bass, data-fig, data-key, data-num,
   data-flats, and data-sharps hold one entry per example, separated by
   semicolons: within an example, chords are separated by bars and the
   figures of one chord by commas. Every chord on a system, whatever example
   it belongs to, takes an equal share of the width, and an example that
   names its own key signature has that signature drawn where it begins. */
(function () {
  "use strict";

  var VIEW = {
    single: "0 20 1600 190",
    grand: "0 30 1600 260",
    figured: "0 30 1600 320",
    numerals: "0 30 1600 320"
  };

  var FIRST = 150, LAST = 1440, TAIL = 70;
  var FIG_Y = 250, FIG_STEP = 17, ROMAN_Y = 252, NUM_Y = 52, SIG_BACK = 30, BAR_BACK = 18;

  function count(svg, name) {
    return parseInt(svg.getAttribute(name) || "0", 10);
  }

  function part(svg, name) {
    return (svg.getAttribute(name) || "").split(";");
  }

  /* every chord on the system, evenly spread */
  function slots(n) {
    if (n < 2) { return [FIRST]; }
    var step = (LAST - FIRST) / (n - 1), out = [], i;
    for (i = 0; i < n; i++) { out.push(FIRST + i * step); }
    return out;
  }

  function figures(svg, x, list) {
    list.split(",").filter(Boolean).forEach(function (f, row) {
      svg.appendChild(MUS.el("text", {
        x: x + 7, y: FIG_Y + row * FIG_STEP, "class": "figbass"
      }, f));
    });
  }

  /* two thin lines, as a key signature is approached */
  function doubleBar(svg, x) {
    [x, x + 6].forEach(function (at) {
      svg.appendChild(MUS.el("line", {
        x1: at, y1: MUS.GS.trebleTop, x2: at, y2: MUS.GS.bassBottom, "class": "divider"
      }));
    });
  }

  function figuredBass(svg) {
    var examples = part(svg, "data-bass").map(function (e) {
      return e.split(/\s+/).filter(Boolean);
    });
    var figs = part(svg, "data-fig");
    var keys = part(svg, "data-key");
    var nums = part(svg, "data-num");
    var flats = part(svg, "data-flats");
    var sharps = part(svg, "data-sharps");

    var total = examples.reduce(function (n, ex) { return n + ex.length; }, 0);
    var at = slots(total);
    var k = 0, last = FIRST, prev = null;

    examples.forEach(function (notes, e) {
      var start = at[k];
      var f = parseInt(flats[e] || "0", 10), s = parseInt(sharps[e] || "0", 10);
      /* a signature is cancelled where the next example has none of its own,
         or stands on the other side of the circle */
      var cancel = prev && (prev.f + prev.s) &&
                   (!(f + s) || (f > 0) !== (prev.f > 0)) ? prev : null;
      var width = 13 * (f + s) + (cancel ? 13 * (cancel.f + cancel.s) + 6 : 0);
      if (e > 0) { doubleBar(svg, start - SIG_BACK - width - BAR_BACK); }
      var x = start - SIG_BACK - width;
      if (cancel) { x += 13 * MUS.cancelSignature(svg, x, cancel.f, cancel.s) + 6; }
      var sig = MUS.keySignature(svg, x, f, s);
      prev = { f: f, s: s };

      notes.forEach(function (note, i) {
        var x = at[k + i];
        MUS.gsNote(svg, x, note, "b", { sig: sig });
        figures(svg, x, (figs[e] || "").split("|")[i] || "");
        last = x;
      });

      if (nums[e]) {
        svg.appendChild(MUS.el("text", { x: start - 4, y: NUM_Y, "class": "itemnum" }, nums[e]));
      }
      if (keys[e]) {
        svg.appendChild(MUS.el("text", {
          x: nums[e] ? start + 20 : 14, y: nums[e] ? NUM_Y : FIG_Y, "class": "keylabel"
        }, keys[e]));
      }
      k += notes.length;
    });

    return last;
  }

  function numerals(svg) {
    MUS.keySignature(svg, 56, count(svg, "data-flats"), count(svg, "data-sharps"));
    var list = part(svg, "data-roman").filter(Boolean);
    var at = slots(list.length);
    list.forEach(function (r, i) {
      svg.appendChild(MUS.el("text", { x: at[i], y: ROMAN_Y, "class": "roman" }, r));
    });
    var key = svg.getAttribute("data-key");
    if (key) {
      svg.appendChild(MUS.el("text", { x: 14, y: ROMAN_Y, "class": "keylabel" }, key));
    }
    return at[at.length - 1];
  }

  function draw(svg) {
    var kind = svg.getAttribute("data-staff");
    if (!VIEW[kind]) { kind = "single"; }
    svg.setAttribute("viewBox", VIEW[kind]);
    var end = null;
    if (kind === "single") {
      MUS.staff(svg);
    } else if (kind === "figured") {
      MUS.grandStaff(svg, 0);
      end = figuredBass(svg);
    } else if (kind === "numerals") {
      MUS.grandStaff(svg, 0);
      end = numerals(svg);
    } else {
      MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
    }
    MUS.endStaff(svg, end === null ? 1580 : Math.min(1580, end + TAIL));
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
