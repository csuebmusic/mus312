/* mus 312 · light and dark ground
   Loaded in the head, before the first paint, so the page never renders on
   the wrong ground. The palette lives in assets/style.css under .dark. */
(function () {
  "use strict";

  var KEY = "mus312-ground";
  var root = document.documentElement;
  var query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() {
    try { return window.localStorage.getItem(KEY); } catch (err) { return null; }
  }

  function keep(value) {
    try { window.localStorage.setItem(KEY, value); } catch (err) {}
  }

  function dark() {
    var choice = stored();
    if (choice === "dark") { return true; }
    if (choice === "light") { return false; }
    return !!(query && query.matches);
  }

  function paint(on) {
    if (on) { root.classList.add("dark"); } else { root.classList.remove("dark"); }
    var button = document.querySelector("button.ground");
    if (button) {
      button.textContent = on ? "light ground" : "dark ground";
      button.setAttribute("aria-label", on ? "switch to the light ground" : "switch to the dark ground");
    }
  }

  paint(dark());

  /* follow the system until a choice is made here */
  if (query && query.addEventListener) {
    query.addEventListener("change", function () { if (!stored()) { paint(dark()); } });
  } else if (query && query.addListener) {
    query.addListener(function () { if (!stored()) { paint(dark()); } });
  }

  /* another tab on the same site */
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) { paint(dark()); }
  });

  function mount() {
    var row = document.querySelector(".eyebrow");
    if (!row || row.querySelector("button.ground")) { return; }
    var button = document.createElement("button");
    button.type = "button";
    button.className = "ground";
    row.appendChild(button);
    button.addEventListener("click", function () {
      var next = !root.classList.contains("dark");
      keep(next ? "dark" : "light");
      paint(next);
    });
    paint(dark());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}());
