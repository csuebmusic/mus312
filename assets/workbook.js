/* mus 312 workbook pages.
   Draws the blank staff paper a set writes on, and prints the page.

   Every svg.answer takes data-staff:
     "single"   one treble staff
     "grand"    both staves
     "figured"  both staves with a bass line and its figures already set
   A grand or figured staff takes data-flats or data-sharps for its key
   signature. A figured staff takes data-key for the key label, data-bass for
   the bass notes, and data-fig for the figure under each of them: figures
   within one chord separated by commas, one chord from the next by a bar. */
(function () {
  "use strict";

  var RIGHT = 1580;
  var VIEW = {
    single: "0 20 1600 190",
    grand: "0 30 1600 260",
    figured: "0 30 1600 320"
  };

  var FIG_Y = 250, FIG_STEP = 17, BASS_X = 130, BASS_ADV = 130;

  function count(svg, name) {
    return parseInt(svg.getAttribute(name) || "0", 10);
  }

  function signature(svg) {
    return MUS.grandStaff(svg, count(svg, "data-flats"), count(svg, "data-sharps"));
  }

  function figuredBass(svg) {
    var sig = signature(svg);
    var x0 = BASS_X + 13 * (count(svg, "data-flats") + count(svg, "data-sharps"));
    var notes = (svg.getAttribute("data-bass") || "").split(/\s+/).filter(Boolean);
    var figs = (svg.getAttribute("data-fig") || "").split("|");

    notes.forEach(function (note, i) {
      var x = x0 + i * BASS_ADV;
      MUS.gsNote(svg, x, note, "b", { sig: sig });
      (figs[i] || "").split(",").filter(Boolean).forEach(function (f, row) {
        svg.appendChild(MUS.el("text", {
          x: x + 7, y: FIG_Y + row * FIG_STEP, "class": "figbass"
        }, f));
      });
    });

    var key = svg.getAttribute("data-key");
    if (key) {
      svg.appendChild(MUS.el("text", { x: 14, y: FIG_Y, "class": "keylabel" }, key));
    }
  }

  function draw(svg) {
    var kind = svg.getAttribute("data-staff");
    if (!VIEW[kind]) { kind = "single"; }
    svg.setAttribute("viewBox", VIEW[kind]);
    if (kind === "figured") { figuredBass(svg); }
    else if (kind === "grand") { signature(svg); }
    else { MUS.staff(svg); }
    MUS.endStaff(svg, RIGHT);
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
