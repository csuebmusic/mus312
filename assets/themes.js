/* mus 312 shared theme diagrams

   Idea boxes, function and theme brackets, cadence boxes, and the pickers
   that choose a diagram. Loaded after notation.js by every page that draws a
   theme diagram. A page passes its own themes and may add ideas and units. */

MUS.themes = (function () {
  "use strict";

  var el = MUS.el;

  var X0 = 150, SPAN = 1000, GAP = 18;
  var Y_MNUM = 20, Y_MARK = 48, Y_CAD = 56, Y_BOX = 92, H_BOX = 80;
  var Y_UNIT = 204, ROW = 70, TICK = 10;

  var IDEAS = {
    bi:     { abbr: "b.i.",  name: "basic idea" },
    ci:     { abbr: "c.i.",  name: "contrasting idea" },
    cont:   { abbr: "frag. / accel. / seq.", short: "cont.", name: "continuation processes" },
    cad:    { abbr: "cad.",  name: "cadential idea" },
    ecp:    { abbr: "ECP",   name: "expanded cadential progression" },
    interp: { abbr: "interp.", name: "interpolation", term: "interpolation" },
    intro:  { abbr: "intro.", name: "thematic introduction", term: "introduction", frame: true },
    cod:    { abbr: "cod.",  name: "codetta", term: "codetta", frame: true },
    sod:    { abbr: "s.o.d.", name: "standing on the dominant", term: "sod", frame: true }
  };

  var UNITS = {
    presentation: { name: "presentation" },
    continuation: { name: "continuation" },
    contcad:      { name: "continuation ⇒ cadential", term: "continuation" },
    cadential:    { name: "cadential" },
    antecedent:   { name: "antecedent" },
    consequent:   { name: "consequent" },
    cbi:          { name: "compound basic idea" },
    introduction: { name: "introduction", frame: true },
    closing:      { name: "closing section", frame: true },
    sod:          { name: "standing on the dominant", frame: true }
  };

  var CADS = { deceptive: true, evaded: true, abandoned: true };

  var COUNT = ["no phrase", "one phrase", "two phrases", "three phrases", "four phrases"];

  /* where the theme types page defines a term, for a page that draws it without defining it */
  var HOME = "theme-types.html";
  var AWAY = {
    phrase: ["phrase and subphrase", ["cadence"]],
    ideas: ["the ideas", ["bi", "rep", "restart", "ci", "cont", "cad", "ecp"]],
    sentence: ["the sentence", ["sentence", "presentation", "continuation"]],
    period: ["the period", ["period", "antecedent", "consequent"]],
    hybrids: ["the hybrids", ["ant-cont", "ant-cad", "cbi-cont", "cbi-cons"]],
    functions: ["the functions", ["function", "fusion", "cbi", "cadential"]],
    "phrase-deviations": ["phrase deviations", ["extension", "expansion", "compression", "interpolation"]],
    "cadential-deviations": ["cadential deviations", ["deceptive", "evaded", "abandoned", "omt"]],
    framing: ["framing functions", ["framing", "introduction", "closing", "sod", "codetta"]]
  };

  function away(term) {
    for (var id in AWAY) {
      if (AWAY[id][1].indexOf(term) >= 0) { return { href: HOME + "#" + id, title: AWAY[id][0] }; }
    }
    return null;
  }

  /* the paragraph or list item that defines a term */
  function def(term) {
    return document.querySelector("p[data-term~=\"" + term + "\"], li[data-term~=\"" + term + "\"]");
  }

  /* one element is pressed at a time across the page */
  function clearAll() {
    document.querySelectorAll("svg g.on, p[data-term].on, li[data-term].on").forEach(function (n) { n.classList.remove("on"); });
    document.querySelectorAll(".readout.def").forEach(function (r) { r.innerHTML = ""; });
  }

  function hit(g, x, y, w, h, label) {
    var r = el("rect", { x: x, y: y, width: w, height: h, "class": "hit",
      tabindex: "0", role: "button", "aria-label": label });
    g.appendChild(r);
    return r;
  }

  function bracket(g, x1, x2, y) {
    g.appendChild(el("path", { d: "M" + x1 + " " + (y - TICK) + " V" + y + " H" + x2 + " V" + (y - TICK), "class": "bracket" }));
  }

  function measures(a, b) { return "measure" + (b > a ? "s " + a + " to " + b : " " + a); }

  /* ideas: [kind, from, to, term, name]; units: [function, from, to, suffix, row];
     cads: [measure, label, term]; marks: [from, to, label, term]; breaks: measures followed by //.
     A unit in row 1 stands on a second function row, under the first. */
  function draw(svg, theme, readout, key) {
    var n = theme.n, MW = SPAN / n;
    var span = theme.span || [1, n];
    var breaks = theme.breaks || [];
    var rows = theme.units.some(function (u) { return u[4]; }) ? 2 : 1;
    var yTheme = Y_UNIT + rows * ROW;
    var cadEnds = theme.cads.filter(function (c) { return !CADS[c[1]]; }).map(function (c) { return c[0]; });
    function left(m) { return X0 + (m - 1) * MW + GAP / 2; }
    function right(m) { return X0 + m * MW - GAP / 2; }
    function closings(a, b) { return cadEnds.filter(function (m) { return m >= a && m <= b; }).length; }

    /* a phrase runs to a cadence, from the start of the theme or from the cadence before it */
    function level(u) {
      if (UNITS[u[0]].frame) { return "framing"; }
      var closes = cadEnds.indexOf(u[2]) >= 0;
      var opens = u[1] === span[0] || cadEnds.indexOf(u[1] - 1) >= 0;
      if (!(closes && opens)) { return "subphrase"; }
      var k = closings(u[1], u[2]);
      return k === 1 ? "phrase" : COUNT[k];
    }

    while (svg.firstChild) { svg.removeChild(svg.firstChild); }
    var groups = [];

    function item(term, label, cls) {
      var g = el("g", { "data-term": term });
      if (cls) { g.setAttribute("class", cls); }
      svg.appendChild(g);
      groups.push({ g: g, term: term, label: label });
      return g;
    }

    var names = [["ideas", Y_BOX + H_BOX / 2 + 4]];
    for (var r = 0; r < rows; r++) { names.push(["function", Y_UNIT + r * ROW + 18]); }
    names.push(["theme", yTheme + 18]);
    names.forEach(function (r) {
      svg.appendChild(el("text", { x: X0 - 20, y: r[1], "class": "rowname" }, r[0]));
    });

    for (var m = 1; m <= n; m++) {
      svg.appendChild(el("text", { x: X0 + (m - 0.5) * MW, y: Y_MNUM, "class": "mnum" }, String(m)));
    }

    (theme.marks || []).forEach(function (k) {
      var g = item(k[3], k[2], "markg");
      var x1 = left(k[0]), x2 = right(k[1]);
      g.appendChild(el("path", { d: "M" + x1 + " " + (Y_MARK + 6) + " V" + Y_MARK + " H" + x2 + " V" + (Y_MARK + 6), "class": "mark" }));
      g.appendChild(el("text", { x: (x1 + x2) / 2, y: Y_MARK - 6, "class": "marktext" }, k[2]));
      hit(g, x1, Y_MARK - 20, x2 - x1, 28, k[2] + ", " + measures(k[0], k[1]));
    });

    theme.ideas.forEach(function (d, i) {
      var info = IDEAS[d[0]], name = d[4] || info.name, term = d[3] || info.term || d[0];
      var g = item(term, name, "idea k-" + d[0] + (info.frame ? " frame" : ""));
      var x = left(d[1]), w = right(d[2]) - x, cx = x + w / 2;
      var abbr = info.abbr, cls = "idea-abbr";
      if (abbr.length * 11.4 > w - 14) { cls = "idea-abbr long"; }
      if (abbr.length * 9 > w - 14) { cls = "idea-abbr longer"; }
      if (abbr.length * 7.8 > w - 14 && info.short) { abbr = info.short; cls = "idea-abbr"; }
      else if (abbr.length * 7.8 > w - 6) { cls = "idea-abbr smallest"; }
      g.appendChild(el("rect", { x: x, y: Y_BOX, width: w, height: H_BOX, "class": "box" }));
      g.appendChild(el("text", { x: cx, y: Y_BOX + 38, "class": cls }, abbr));
      if (name.length * 6.3 < w - 12) {
        g.appendChild(el("text", { x: cx, y: Y_BOX + 60, "class": "idea-name" }, name));
      }
      hit(g, x, Y_BOX, w, H_BOX, name + ", " + measures(d[1], d[2]));
      if (i < theme.ideas.length - 1) {
        var brk = breaks.indexOf(d[2]) >= 0;
        svg.appendChild(el("text", { x: X0 + d[2] * MW, y: Y_BOX + H_BOX / 2 + 5, "class": brk ? "brk" : "plus" }, brk ? "//" : "+"));
      }
    });

    theme.cads.forEach(function (c) {
      var term = c[2] || (CADS[c[1]] ? c[1] : "cadence");
      var g = item(term, c[1]);
      var cx = X0 + (c[0] - 0.5) * MW, w = 18 + c[1].length * 7.8;
      g.appendChild(el("rect", { x: cx - w / 2, y: Y_CAD, width: w, height: 24, "class": "cadbox" }));
      g.appendChild(el("text", { x: cx, y: Y_CAD + 17, "class": "cadtext" }, c[1]));
      hit(g, cx - w / 2, Y_CAD, w, 24, c[1] + (CADS[c[1]] ? " cadence" : "") + " at measure " + c[0]);
    });

    theme.units.forEach(function (u) {
      var info = UNITS[u[0]], lev = level(u), y = Y_UNIT + (u[4] || 0) * ROW;
      var name = info.name + (u[3] ? " (" + u[3] + ")" : "");
      var g = item(info.term || u[0], name, "unit");
      var x1 = left(u[1]), x2 = right(u[2]);
      bracket(g, x1, x2, y);
      g.appendChild(el("text", { x: (x1 + x2) / 2, y: y + 22, "class": "unit-label" }, name));
      g.appendChild(el("text", { x: (x1 + x2) / 2, y: y + 40, "class": "unit-cap" }, lev));
      hit(g, x1, y - TICK - 2, x2 - x1, 58, name + ", " + lev + ", " + measures(u[1], u[2]));
    });

    var cap = COUNT[closings(span[0], span[1])];
    var tg = item(theme.term || key, theme.name, "unit");
    var t1 = left(span[0]), t2 = right(span[1]);
    bracket(tg, t1, t2, yTheme);
    tg.appendChild(el("text", { x: (t1 + t2) / 2, y: yTheme + 22, "class": "unit-label" }, theme.name));
    tg.appendChild(el("text", { x: (t1 + t2) / 2, y: yTheme + 40, "class": "unit-cap" }, cap));
    hit(tg, t1, yTheme - TICK - 2, t2 - t1, 58, theme.name + ", " + cap);

    function select(entry) {
      clearAll();
      entry.g.classList.add("on");
      var src = def(entry.term), p;
      if (!src) {
        /* a term this page draws but doesn't define points to the page that does */
        var home = away(entry.term);
        p = document.createElement("p");
        p.innerHTML = "Defined under <a target=\"_blank\" rel=\"noopener\"></a> on the theme types page.";
        p.firstElementChild.textContent = home.title;
        p.firstElementChild.setAttribute("href", home.href);
        readout.appendChild(p);
        return;
      }
      src.classList.add("on");
      /* an idea's definition, and any definition kept in another section, is shown under the figure */
      if (entry.g.classList.contains("idea") || src.closest("section") !== svg.closest("section")) {
        p = document.createElement("p");
        p.innerHTML = src.innerHTML;
        readout.appendChild(p);
      }
    }

    groups.forEach(function (o) {
      var h = o.g.querySelector(".hit");
      h.addEventListener("click", function () { select(o); });
      h.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(o); }
      });
    });
  }

  /* a figure with a row of buttons choosing what it draws; a choice lights the definition it names */
  function picker(themes, id, keys, lights) {
    var pick = document.getElementById("pick-" + id),
        fig = document.getElementById("fig-" + id),
        read = document.getElementById("read-" + id),
        model = document.getElementById("model-" + id),
        buttons = [];

    function show(key, opening) {
      var t = themes[key];
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.key === key ? "true" : "false"); });
      fig.setAttribute("aria-label", t.name + (t.label ? ", " + t.label : "") + ", drawn as idea boxes with function brackets beneath");
      clearAll();
      draw(fig, t, read, key);
      if (model) { model.textContent = t.model || ""; }
      if (!opening && lights) { def(lights(key)).classList.add("on"); }
    }

    keys.forEach(function (key) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.key = key;
      b.setAttribute("aria-pressed", "false");
      b.appendChild(document.createTextNode(themes[key].label || themes[key].name));
      b.addEventListener("click", function () { show(key); });
      pick.appendChild(b);
      buttons.push(b);
    });

    show(keys[0], true);
  }

  return { IDEAS: IDEAS, UNITS: UNITS, draw: draw, picker: picker };
})();
