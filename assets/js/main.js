(function () {
  "use strict";

  var root = document.documentElement;

  // -------------------------------------------------------------------------
  // Theme toggle (persists to localStorage; head.html applies it pre-paint)
  // -------------------------------------------------------------------------
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // -------------------------------------------------------------------------
  // Mobile sidebar drawer
  // -------------------------------------------------------------------------
  var sidebar = document.getElementById("sidebar");
  var menuToggle = document.getElementById("menu-toggle");
  var backdrop = document.getElementById("nav-backdrop");
  function closeNav() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    if (backdrop) backdrop.hidden = true;
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
  }
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      if (backdrop) backdrop.hidden = !open;
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeNav);

  // -------------------------------------------------------------------------
  // Sidebar filter box
  // -------------------------------------------------------------------------
  var search = document.getElementById("nav-search");
  if (search && sidebar) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      sidebar.querySelectorAll(".nav-list li").forEach(function (li) {
        var text = (li.textContent || "").toLowerCase();
        li.style.display = !q || text.indexOf(q) !== -1 ? "" : "none";
      });
    });
  }

  var article = document.querySelector(".doc.content");

  // -------------------------------------------------------------------------
  // GitHub-style alerts: > [!NOTE] blockquotes -> styled callouts
  // -------------------------------------------------------------------------
  var ALERTS = {
    NOTE: { cls: "callout-note", label: "Note",
      icon: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 5a1.2 1.2 0 110 2.4A1.2 1.2 0 0112 7zm1 10h-2v-6h2z"/>' },
    TIP: { cls: "callout-tip", label: "Tip",
      icon: '<path d="M9 21h6v-1H9v1zm3-19a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/>' },
    IMPORTANT: { cls: "callout-important", label: "Important",
      icon: '<path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>' },
    WARNING: { cls: "callout-warning", label: "Warning",
      icon: '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>' },
    CAUTION: { cls: "callout-caution", label: "Caution",
      icon: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>' }
  };
  var alertRe = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?\s*/i;

  (article || document).querySelectorAll("blockquote").forEach(function (bq) {
    var first = bq.querySelector("p");
    if (!first) return;
    var m = first.innerHTML.match(alertRe);
    if (!m) return;

    var type = ALERTS[m[1].toUpperCase()];
    first.innerHTML = first.innerHTML.replace(alertRe, "");
    bq.classList.add("callout", type.cls);

    var title = document.createElement("p");
    title.className = "callout-title";
    title.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">' +
      type.icon + "</svg>" + type.label;
    bq.insertBefore(title, bq.firstChild);
  });

  // -------------------------------------------------------------------------
  // Heading anchors + "On this page" TOC with scroll-spy
  // -------------------------------------------------------------------------
  if (article) {
    var tocNav = document.getElementById("toc-nav");
    var headings = article.querySelectorAll("h2, h3");
    var links = [];

    function slugify(text) {
      return text.toLowerCase().trim()
        .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    }

    headings.forEach(function (h) {
      if (!h.id) h.id = slugify(h.textContent) || "section";

      var anchor = document.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = "#" + h.id;
      anchor.setAttribute("aria-label", "Link to this section");
      anchor.textContent = "#";
      h.insertBefore(anchor, h.firstChild);

      if (tocNav) {
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent.replace(/^#/, "");
        a.className = h.tagName === "H3" ? "lvl-3" : "lvl-2";
        a.addEventListener("click", closeNav);
        tocNav.appendChild(a);
        links.push({ id: h.id, el: a });
      }
    });

    // Scroll-spy: highlight the section nearest the top of the viewport.
    if (links.length && "IntersectionObserver" in window) {
      var visible = {};
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        var activeId = null;
        for (var i = 0; i < headings.length; i++) {
          if (visible[headings[i].id]) { activeId = headings[i].id; break; }
        }
        links.forEach(function (l) {
          l.el.classList.toggle("is-active", l.id === activeId);
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      headings.forEach(function (h) { spy.observe(h); });
    }
  }
})();
