/* mus 312 problem sets.
   Every section.set holding a .key gets a button that reveals it, and a page
   button drives all of them at once. */
(function () {
  "use strict";

  function setState(host, open) {
    var key = host.querySelector(".key");
    var btn = host.querySelector("button.answers");
    if (!key || !btn) { return; }
    key.hidden = !open;
    btn.setAttribute("aria-pressed", open ? "true" : "false");
    btn.textContent = open ? "hide answers" : "answers";
  }

  function init() {
    var sets = Array.prototype.slice.call(document.querySelectorAll("section.set"));
    var live = [];

    sets.forEach(function (host) {
      var key = host.querySelector(".key");
      if (!key) { return; }
      var controls = document.createElement("div");
      controls.className = "controls";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answers";
      btn.setAttribute("aria-pressed", "false");
      btn.appendChild(document.createTextNode("answers"));
      btn.addEventListener("click", function () { setState(host, key.hidden); });
      controls.appendChild(btn);
      key.parentNode.insertBefore(controls, key);
      key.hidden = true;
      live.push(host);
    });

    var all = document.querySelector("button.answers-all");
    if (!all) { return; }
    all.addEventListener("click", function () {
      var open = all.getAttribute("aria-pressed") !== "true";
      all.setAttribute("aria-pressed", open ? "true" : "false");
      all.textContent = open ? "hide every answer" : "show every answer";
      live.forEach(function (host) { setState(host, open); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
