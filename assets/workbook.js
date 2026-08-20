/* mus 312 workbook pages.
   Draws the blank staff paper a set writes on, and prints the page.

   Every svg.answer takes data-staff="single" or "grand", and a grand staff
   takes data-flats for its key signature. */
(function () {
  "use strict";

  var RIGHT = 1580;
  var VIEW = {
    single: "0 20 1600 190",
    grand: "0 30 1600 260"
  };

  function draw(svg) {
    var kind = svg.getAttribute("data-staff") === "grand" ? "grand" : "single";
    svg.setAttribute("viewBox", VIEW[kind]);
    if (kind === "grand") {
      MUS.grandStaff(svg, parseInt(svg.getAttribute("data-flats") || "0", 10));
    } else {
      MUS.staff(svg);
    }
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
