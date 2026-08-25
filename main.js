(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  var LS_RECENTS = "emojiland_recientes";
  var LS_FAVS = "emojiland_favoritos";
  var SS_CORNER = "emojiland_corner_ad_dismissed";
  var SS_DOWNLOAD_AD = "emojiland_download_ad_shown";
  var LS_COOKIE_CONSENT = "emojiland_cookie_consent";

  function readList(key) {
    try {
      var raw = localStorage.getItem(key);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function writeList(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); } catch (e) {}
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = $("[data-nav-toggle]");
    var panel = $("[data-mobile-nav]");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveals() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }, 6000);
  }

  /* ---------- Emoji tool ---------- */
  function initEmojiTool() {
    var root = $("[data-emoji-tool]");
    if (!root || !data.categories) return;

    var tabsEl = $("[data-cat-tabs]", root);
    var gridEl = $("[data-emoji-grid]", root);
    var searchEl = $("[data-emoji-search]", root);
    var toastEl = $("[data-copy-toast]");
    var favCountEl = $("[data-fav-count]", root);
    var favDownloadBtn = $("[data-fav-download]", root);

    var categories = data.categories;
    var activeCat = categories[0] ? categories[0].id : null;
    var recents = readList(LS_RECENTS);
    var favs = readList(LS_FAVS);
    var toastTimer = null;

    function allItemsFlat() {
      var out = [];
      categories.forEach(function (cat) {
        cat.items.forEach(function (it) { out.push({ e: it[0], n: it[1], cat: cat.id }); });
      });
      return out;
    }
    var flat = allItemsFlat();

    function renderTabs() {
      if (!tabsEl) return;
      var html = "";
      if (recents.length) {
        html += tabButton("recientes", "\u{1F551}", "Recientes");
      }
      categories.forEach(function (cat) {
        html += tabButton(cat.id, cat.icon, cat.label);
      });
      tabsEl.innerHTML = html;
    }

    function tabButton(id, icon, label) {
      var selected = id === activeCat;
      return '<button type="button" class="cat-tab" data-cat="' + id + '" role="tab" ' +
        'aria-selected="' + (selected ? "true" : "false") + '" aria-label="' + escHTML(label) + '">' +
        '<span class="cat-tab-icon" aria-hidden="true">' + icon + "</span>" +
        "<span>" + escHTML(label) + "</span></button>";
    }

    function itemsForCat(id) {
      if (id === "recientes") {
        return recents.map(function (e) {
          var found = flat.filter(function (f) { return f.e === e; })[0];
          return { e: e, n: found ? found.n : "emoji" };
        });
      }
      var cat = categories.filter(function (c) { return c.id === id; })[0];
      if (!cat) return [];
      return cat.items.map(function (it) { return { e: it[0], n: it[1] }; });
    }

    function renderGrid(items) {
      if (!gridEl) return;
      if (!items.length) {
        gridEl.innerHTML = '<div class="empty-state">No se encontraron emojis. Prueba con otra palabra.</div>';
        return;
      }
      gridEl.innerHTML = items.map(function (it) {
        var isFav = favs.indexOf(it.e) !== -1;
        return '<button type="button" class="emoji-cell" data-emoji="' + escHTML(it.e) +
          '" data-name="' + escHTML(it.n) + '" title="' + escHTML(it.n) +
          '" aria-label="Copiar emoji: ' + escHTML(it.n) + '">' +
          '<span aria-hidden="true">' + it.e + "</span>" +
          '<span class="emoji-star' + (isFav ? " is-fav" : "") + '" data-star aria-hidden="true">' + (isFav ? "★" : "☆") + "</span>" +
          "</button>";
      }).join("");
    }

    function refreshFavUi() {
      if (favCountEl) favCountEl.textContent = String(favs.length);
      if (favDownloadBtn) favDownloadBtn.disabled = favs.length === 0;
    }

    function setActive(id) {
      activeCat = id;
      renderTabs();
      if (searchEl) searchEl.value = "";
      renderGrid(itemsForCat(id));
    }

    function copyEmoji(emoji, name) {
      var text = emoji;
      function done(ok) {
        showToast(emoji, ok);
        if (ok) {
          recents = [emoji].concat(recents.filter(function (e) { return e !== emoji; })).slice(0, 24);
          writeList(LS_RECENTS, recents);
        }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () {
          fallbackCopy(text, done);
        });
      } else {
        fallbackCopy(text, done);
      }
    }

    function fallbackCopy(text, cb) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        cb(ok);
      } catch (e) { cb(false); }
    }

    function showToast(emoji, ok) {
      if (!toastEl) return;
      toastEl.innerHTML = '<span class="toast-emoji" aria-hidden="true">' + emoji + "</span>" +
        '<span class="toast-check">' + (ok ? "✓ Copiado" : "No se pudo copiar") + "</span>";
      toastEl.classList.add("is-shown");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.classList.remove("is-shown"); }, 1600);
    }

    function toggleFav(emoji) {
      var idx = favs.indexOf(emoji);
      if (idx === -1) { favs.push(emoji); } else { favs.splice(idx, 1); }
      writeList(LS_FAVS, favs);
      refreshFavUi();
      $$(".emoji-cell", gridEl).forEach(function (cell) {
        if (cell.getAttribute("data-emoji") === emoji) {
          var star = $("[data-star]", cell);
          var isFav = favs.indexOf(emoji) !== -1;
          if (star) {
            star.classList.toggle("is-fav", isFav);
            star.textContent = isFav ? "★" : "☆";
          }
        }
      });
    }

    function downloadFavorites() {
      if (!favs.length) return;
      var lines = favs.map(function (e) {
        var found = flat.filter(function (f) { return f.e === e; })[0];
        return e + (found ? "  " + found.n : "");
      });
      var content = "Mis emojis favoritos — Emojiland\n\n" + lines.join("\n") + "\n";
      var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "mis-emojis-favoritos.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      document.dispatchEvent(new CustomEvent("emojiland:downloaded"));
    }

    if (tabsEl) {
      tabsEl.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-cat]");
        if (!btn) return;
        setActive(btn.getAttribute("data-cat"));
      });
    }

    if (gridEl) {
      gridEl.addEventListener("click", function (e) {
        var star = e.target.closest("[data-star]");
        var cell = e.target.closest(".emoji-cell");
        if (!cell) return;
        var emoji = cell.getAttribute("data-emoji");
        if (star) {
          toggleFav(emoji);
          return;
        }
        cell.classList.remove("is-copied");
        void cell.offsetWidth;
        cell.classList.add("is-copied");
        copyEmoji(emoji, cell.getAttribute("data-name"));
      });
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        var q = searchEl.value.trim().toLowerCase();
        if (!q) { renderGrid(itemsForCat(activeCat)); return; }
        var matches = flat.filter(function (it) {
          return it.n.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 200);
        renderGrid(matches);
      });
    }

    if (favDownloadBtn) {
      favDownloadBtn.addEventListener("click", downloadFavorites);
    }

    renderTabs();
    renderGrid(itemsForCat(activeCat));
    refreshFavUi();
  }

  /* ---------- Ad placeholders (explicitly requested, empty slots only) ---------- */
  function initDownloadAdDialog() {
    var dialog = $("[data-ad-dialog]");
    if (!dialog) return;
    var closeBtn = $("[data-ad-dialog-close]", dialog);
    var closeBtn2 = $("[data-ad-dialog-close-2]", dialog);

    document.addEventListener("emojiland:downloaded", function () {
      var alreadyShown = sessionStorage.getItem(SS_DOWNLOAD_AD) === "1";
      if (alreadyShown) return;
      setTimeout(function () {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
          try { sessionStorage.setItem(SS_DOWNLOAD_AD, "1"); } catch (e) {}
        }
      }, 350);
    });

    function closeDialog() { if (dialog.open) dialog.close(); }
    if (closeBtn) closeBtn.addEventListener("click", closeDialog);
    if (closeBtn2) closeBtn2.addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeDialog();
    });
    dialog.addEventListener("cancel", function () {});
  }

  function initCornerAd() {
    var corner = $("[data-ad-corner]");
    if (!corner) return;
    if (sessionStorage.getItem(SS_CORNER) === "1") return;
    var closeBtn = $("[data-ad-corner-close]", corner);
    var shown = false;
    setTimeout(function () {
      shown = true;
      corner.classList.add("is-shown");
    }, 4500);
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        corner.classList.remove("is-shown");
        try { sessionStorage.setItem(SS_CORNER, "1"); } catch (e) {}
      });
    }
  }

  /* ---------- Cookie consent ---------- */
  function initCookieConsent() {
    var banner = $("[data-cookie-banner]");
    if (!banner) return;
    var acceptBtn = $("[data-cookie-accept]", banner);
    var rejectBtn = $("[data-cookie-reject]", banner);

    function announce(value) {
      try { document.dispatchEvent(new CustomEvent("emojiland:cookies-" + value)); } catch (e) {}
    }

    var stored = null;
    try { stored = localStorage.getItem(LS_COOKIE_CONSENT); } catch (e) {}

    if (stored === "accepted" || stored === "rejected") {
      announce(stored);
      return;
    }

    setTimeout(function () { banner.classList.add("is-shown"); }, 900);

    function decide(value) {
      try { localStorage.setItem(LS_COOKIE_CONSENT, value); } catch (e) {}
      banner.classList.remove("is-shown");
      announce(value);
    }

    if (acceptBtn) acceptBtn.addEventListener("click", function () { decide("accepted"); });
    if (rejectBtn) rejectBtn.addEventListener("click", function () { decide("rejected"); });
  }

  /* ---------- View transitions on internal nav ---------- */
  function initViewTransitions() {
    if (!document.startViewTransition) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (a.target === "_blank" || a.hasAttribute("download") || url.hash) return;
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      document.startViewTransition(function () { location.href = a.href; });
    });
  }

  function boot() {
    safe(initMobileNav, "initMobileNav");
    safe(initReveals, "initReveals");
    safe(initEmojiTool, "initEmojiTool");
    safe(initDownloadAdDialog, "initDownloadAdDialog");
    safe(initCornerAd, "initCornerAd");
    safe(initCookieConsent, "initCookieConsent");
    safe(initViewTransitions, "initViewTransitions");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
