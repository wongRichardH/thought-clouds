/* ============================================================
   Thought Clouds — feed, month timeline, reader, Markdown renderer
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Minimal, dependency-free Markdown renderer ----------
     Supports: headings (#..###), bold, italic, inline code, links,
     unordered / ordered lists, pipe tables, blockquotes, hr, paragraphs.
     Everything is HTML-escaped first, so pasted text is safe.          */

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(text) {
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + "</a>";
    });
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    return text;
  }

  function splitRow(line) {
    return line.replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); });
  }

  function renderMarkdown(md) {
    var lines = md.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;
    var para = [];

    function flushParagraph(buf) {
      if (buf.length) {
        html.push("<p>" + inline(escapeHtml(buf.join(" "))) + "</p>");
        buf.length = 0;
      }
    }

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      if (trimmed === "") { flushParagraph(para); i++; continue; }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushParagraph(para); html.push("<hr />"); i++; continue;
      }

      var h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
      if (h) {
        flushParagraph(para);
        var level = Math.min(h[1].length, 3);
        html.push("<h" + level + ">" + inline(escapeHtml(h[2])) + "</h" + level + ">");
        i++; continue;
      }

      if (trimmed.indexOf("|") !== -1 && i + 1 < lines.length &&
          /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
        flushParagraph(para);
        var headers = splitRow(trimmed);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") !== -1 && lines[i].trim() !== "") {
          rows.push(splitRow(lines[i].trim())); i++;
        }
        var t = ["<table><thead><tr>"];
        headers.forEach(function (c) { t.push("<th>" + inline(escapeHtml(c)) + "</th>"); });
        t.push("</tr></thead><tbody>");
        rows.forEach(function (r) {
          t.push("<tr>");
          for (var c = 0; c < headers.length; c++) {
            t.push("<td>" + inline(escapeHtml(r[c] || "")) + "</td>");
          }
          t.push("</tr>");
        });
        t.push("</tbody></table>");
        html.push(t.join(""));
        continue;
      }

      if (/^>\s?/.test(trimmed)) {
        flushParagraph(para);
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
          quote.push(lines[i].trim().replace(/^>\s?/, "")); i++;
        }
        html.push("<blockquote>" + inline(escapeHtml(quote.join(" "))) + "</blockquote>");
        continue;
      }

      if (/^[-*+]\s+/.test(trimmed)) {
        flushParagraph(para);
        var ul = ["<ul>"];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          ul.push("<li>" + inline(escapeHtml(lines[i].trim().replace(/^[-*+]\s+/, ""))) + "</li>"); i++;
        }
        ul.push("</ul>"); html.push(ul.join("")); continue;
      }

      if (/^\d+[.)]\s+/.test(trimmed)) {
        flushParagraph(para);
        var ol = ["<ol>"];
        while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
          ol.push("<li>" + inline(escapeHtml(lines[i].trim().replace(/^\d+[.)]\s+/, ""))) + "</li>"); i++;
        }
        ol.push("</ol>"); html.push(ol.join("")); continue;
      }

      para.push(trimmed); i++;
    }
    flushParagraph(para);
    return html.join("\n");
  }

  /* ---------- Date helpers ---------- */

  var MONTHS_FULL = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var MONTHS_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var UNDATED = "0000-00";

  function monthKey(iso) { return iso ? iso.slice(0, 7) : UNDATED; }

  function monthFull(key) {
    if (key === UNDATED) return "Someday";
    var p = key.split("-");
    return MONTHS_FULL[+p[1] - 1] + " " + p[0];
  }

  function monthShort(key) {
    if (key === UNDATED) return "Someday";
    var p = key.split("-");
    return MONTHS_ABBR[+p[1] - 1] + " ’" + p[0].slice(2);
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  /* ---------- Elements ---------- */

  var feed = document.getElementById("feed");
  var tlNav = document.getElementById("tl-nav");
  var emptyMsg = document.getElementById("empty");

  var data = (window.THOUGHTS || []).slice();
  // newest first
  data.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

  /* ---------- Build a cloud button ---------- */

  function makeCloud(thought) {
    var btn = document.createElement("button");
    btn.className = "cloud";
    btn.type = "button";

    var q = document.createElement("p");
    q.className = "cloud-question";
    q.textContent = thought.question;
    btn.appendChild(q);

    var foot = document.createElement("span");
    foot.className = "cloud-foot";
    foot.textContent = [formatDate(thought.date), (thought.tags || []).join(" · ")]
      .filter(Boolean).join("   ·   ");
    btn.appendChild(foot);

    btn.addEventListener("click", function () { openReader(thought); });
    return btn;
  }

  /* ---------- Render feed + timeline ---------- */

  var tlItems = {}; // key -> timeline button

  function render(list) {
    feed.innerHTML = "";
    tlNav.innerHTML = "";
    tlItems = {};

    if (!list.length) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;

    // group by month, preserving the newest-first order of keys
    var order = [];
    var groups = {};
    list.forEach(function (t) {
      var k = monthKey(t.date);
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(t);
    });

    order.forEach(function (key) {
      var section = document.createElement("section");
      section.className = "month-group";
      section.id = "grp-" + key;

      var heading = document.createElement("h2");
      heading.className = "month-heading";
      heading.textContent = monthFull(key);
      section.appendChild(heading);

      var col = document.createElement("div");
      col.className = "cloud-column";
      groups[key].forEach(function (t) { col.appendChild(makeCloud(t)); });
      section.appendChild(col);

      feed.appendChild(section);

      // matching timeline marker
      var item = document.createElement("button");
      item.className = "tl-item";
      item.type = "button";
      item.setAttribute("data-target", section.id);
      item.setAttribute("aria-label", "Jump to " + monthFull(key));
      item.innerHTML = '<span class="tl-dot"></span><span class="tl-label">' +
        monthShort(key) + "</span>";
      item.addEventListener("click", function () {
        var target = document.getElementById(section.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      tlNav.appendChild(item);
      tlItems[section.id] = item;
    });

    setupScrollSpy();
  }

  /* ---------- Scroll-spy: highlight the month in view ---------- */

  var observer = null;

  function setActive(id) {
    Object.keys(tlItems).forEach(function (key) {
      tlItems[key].classList.toggle("is-active", key === id);
    });
  }

  function setupScrollSpy() {
    if (observer) observer.disconnect();
    var visible = {};

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      // pick the most-visible group
      var bestId = null, best = -1;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > best) { best = visible[id]; bestId = id; }
      });
      if (bestId && best > 0) setActive(bestId);
    }, {
      // trigger around the vertical middle of the viewport
      rootMargin: "-40% 0px -40% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    document.querySelectorAll(".month-group").forEach(function (g) {
      observer.observe(g);
    });

    // activate the first marker up front
    var first = document.querySelector(".month-group");
    if (first) setActive(first.id);
  }

  /* ---------- Reader overlay ---------- */

  var overlay = document.getElementById("overlay");
  var readerTitle = document.getElementById("reader-title");
  var readerBody = document.getElementById("reader-body");
  var readerDate = document.getElementById("reader-date");
  var readerTags = document.getElementById("reader-tags");

  function openReader(thought) {
    readerTitle.textContent = thought.question;
    readerDate.textContent = formatDate(thought.date);
    readerTags.textContent = (thought.tags || []).join(" · ");
    readerBody.innerHTML = renderMarkdown(thought.answer || "");
    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    overlay.querySelector(".reader-close").focus();
  }

  function closeReader() {
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  overlay.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeReader();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeReader();
  });

  /* ---------- Boot ---------- */

  render(data);
})();
