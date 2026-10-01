/* ============================================================
   Thought Clouds — rendering, search, and a tiny Markdown parser
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Minimal, dependency-free Markdown renderer ----------
     Supports: headings (#..###), bold, italic, inline code, links,
     unordered / ordered lists, pipe tables, blockquotes, hr, paragraphs.
     Everything is HTML-escaped first, so pasted text is safe.          */

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function inline(text) {
    // links [text](url) — build before other replacements
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, url) {
      return (
        '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + "</a>"
      );
    });
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    return text;
  }

  function splitRow(line) {
    return line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map(function (c) { return c.trim(); });
  }

  function renderMarkdown(md) {
    var lines = md.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;

    function flushParagraph(buf) {
      if (buf.length) {
        html.push("<p>" + inline(escapeHtml(buf.join(" "))) + "</p>");
        buf.length = 0;
      }
    }

    var para = [];

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // blank line
      if (trimmed === "") {
        flushParagraph(para);
        i++;
        continue;
      }

      // horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushParagraph(para);
        html.push("<hr />");
        i++;
        continue;
      }

      // heading
      var h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
      if (h) {
        flushParagraph(para);
        var level = Math.min(h[1].length, 3);
        html.push("<h" + level + ">" + inline(escapeHtml(h[2])) + "</h" + level + ">");
        i++;
        continue;
      }

      // table: a header row followed by a |---|---| separator
      if (trimmed.indexOf("|") !== -1 && i + 1 < lines.length &&
          /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
        flushParagraph(para);
        var headers = splitRow(trimmed);
        i += 2; // skip header + separator
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") !== -1 && lines[i].trim() !== "") {
          rows.push(splitRow(lines[i].trim()));
          i++;
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

      // blockquote
      if (/^>\s?/.test(trimmed)) {
        flushParagraph(para);
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
          quote.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        html.push("<blockquote>" + inline(escapeHtml(quote.join(" "))) + "</blockquote>");
        continue;
      }

      // unordered list
      if (/^[-*+]\s+/.test(trimmed)) {
        flushParagraph(para);
        var ul = ["<ul>"];
        while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
          ul.push("<li>" + inline(escapeHtml(lines[i].trim().replace(/^[-*+]\s+/, ""))) + "</li>");
          i++;
        }
        ul.push("</ul>");
        html.push(ul.join(""));
        continue;
      }

      // ordered list
      if (/^\d+[.)]\s+/.test(trimmed)) {
        flushParagraph(para);
        var ol = ["<ol>"];
        while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
          ol.push("<li>" + inline(escapeHtml(lines[i].trim().replace(/^\d+[.)]\s+/, ""))) + "</li>");
          i++;
        }
        ol.push("</ol>");
        html.push(ol.join(""));
        continue;
      }

      // default: paragraph text
      para.push(trimmed);
      i++;
    }
    flushParagraph(para);
    return html.join("\n");
  }

  /* ---------- Rendering clouds ---------- */

  var sky = document.getElementById("sky");
  var emptyMsg = document.getElementById("empty");
  var searchInput = document.getElementById("search");

  var data = (window.THOUGHTS || []).slice();

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

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
      .filter(Boolean)
      .join("  ·  ");
    btn.appendChild(foot);

    btn.addEventListener("click", function () { openReader(thought); });
    return btn;
  }

  function renderClouds(list) {
    sky.innerHTML = "";
    if (!list.length) {
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;
    list.forEach(function (t) { sky.appendChild(makeCloud(t)); });
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

  /* ---------- Search ---------- */

  function applySearch() {
    var q = searchInput.value.trim().toLowerCase();
    if (!q) { renderClouds(data); return; }
    var filtered = data.filter(function (t) {
      return (
        t.question.toLowerCase().indexOf(q) !== -1 ||
        (t.answer || "").toLowerCase().indexOf(q) !== -1 ||
        (t.tags || []).join(" ").toLowerCase().indexOf(q) !== -1
      );
    });
    renderClouds(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", applySearch);

  /* ---------- Boot ---------- */

  // newest first if dates are present
  data.sort(function (a, b) {
    return (b.date || "").localeCompare(a.date || "");
  });

  renderClouds(data);
})();
