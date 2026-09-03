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
  var LS_SKIN_TONE = "emojiland_skin_tone";

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

  /* ---------- Shared clipboard + toast helpers ---------- */
  var toastTimer = null;

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

  function copyToClipboard(text, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { cb(true); }).catch(function () {
        fallbackCopy(text, cb);
      });
    } else {
      fallbackCopy(text, cb);
    }
  }

  function showCopyToast(display, ok) {
    var toastEl = $("[data-copy-toast]");
    if (!toastEl) return;
    toastEl.innerHTML = '<span class="toast-emoji" aria-hidden="true">' + display + "</span>" +
      '<span class="toast-check">' + (ok ? "✓ Copiado" : "No se pudo copiar") + "</span>";
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-shown"); }, 1600);
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
  var TONE_OPTIONS = [
    { id: "", label: "Tono por defecto", swatch: "" },
    { id: "light", label: "Tono de piel claro", swatch: "\u{1F3FB}" },
    { id: "mlight", label: "Tono de piel claro medio", swatch: "\u{1F3FC}" },
    { id: "medium", label: "Tono de piel medio", swatch: "\u{1F3FD}" },
    { id: "mdark", label: "Tono de piel oscuro medio", swatch: "\u{1F3FE}" },
    { id: "dark", label: "Tono de piel oscuro", swatch: "\u{1F3FF}" }
  ];

  function initEmojiTool() {
    var root = $("[data-emoji-tool]");
    var emojiData = window.__EMOJI_DATA__;
    if (!root || !emojiData || !emojiData.categories) return;

    var tabsEl = $("[data-cat-tabs]", root);
    var gridEl = $("[data-emoji-grid]", root);
    var searchEl = $("[data-emoji-search]", root);
    var favCountEl = $("[data-fav-count]", root);
    var favDownloadBtn = $("[data-fav-download]", root);
    var toneEl = $("[data-skin-tones]", root);

    var categories = emojiData.categories;
    var searchIndex = emojiData.searchIndex || [];
    var activeCat = categories[0] ? categories[0].id : null;
    var recents = readList(LS_RECENTS);
    var favs = readList(LS_FAVS);
    var isSearching = false;
    var skinTone = "";
    try { skinTone = localStorage.getItem(LS_SKIN_TONE) || ""; } catch (e) {}

    function findName(emoji) {
      var found = searchIndex.filter(function (f) { return f[0] === emoji; })[0];
      return found ? found[1] : "emoji";
    }

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

    function resolveItem(raw) {
      if (raw.length === 3 && skinTone && raw[2][skinTone]) {
        var t = raw[2][skinTone];
        return { e: t[0], n: t[1] };
      }
      return { e: raw[0], n: raw[1] };
    }

    function itemsForCat(id) {
      if (id === "recientes") {
        return recents.map(function (e) { return { e: e, n: findName(e) }; });
      }
      var cat = categories.filter(function (c) { return c.id === id; })[0];
      if (!cat) return [];
      return cat.items.map(resolveItem);
    }

    function renderTones() {
      if (!toneEl) return;
      toneEl.innerHTML = TONE_OPTIONS.map(function (o) {
        var selected = skinTone === o.id;
        var cls = "tone-swatch" + (o.id ? " tone-swatch-" + o.id : " tone-swatch-default") + (selected ? " is-selected" : "");
        return '<button type="button" class="' + cls + '" data-tone="' + o.id + '" aria-label="' + escHTML(o.label) +
          '" aria-pressed="' + (selected ? "true" : "false") + '" title="' + escHTML(o.label) + '">' +
          (o.swatch ? '<span aria-hidden="true">' + o.swatch + "</span>" : "") + "</button>";
      }).join("");
      toneEl.classList.toggle("is-visible", activeCat === "personas" && !isSearching);
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
      isSearching = false;
      renderTabs();
      renderTones();
      if (searchEl) searchEl.value = "";
      renderGrid(itemsForCat(id));
    }

    function setTone(id) {
      skinTone = id || "";
      try {
        if (skinTone) localStorage.setItem(LS_SKIN_TONE, skinTone);
        else localStorage.removeItem(LS_SKIN_TONE);
      } catch (e) {}
      renderTones();
      if (activeCat === "personas" && !isSearching) {
        renderGrid(itemsForCat("personas"));
      }
    }

    function copyEmoji(emoji) {
      copyToClipboard(emoji, function (ok) {
        showCopyToast(emoji, ok);
        if (ok) {
          recents = [emoji].concat(recents.filter(function (e) { return e !== emoji; })).slice(0, 24);
          writeList(LS_RECENTS, recents);
        }
      });
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
        return e + "  " + findName(e);
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
        copyEmoji(emoji);
      });
    }

    if (toneEl) {
      toneEl.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-tone]");
        if (!btn) return;
        setTone(btn.getAttribute("data-tone"));
      });
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        var q = searchEl.value.trim().toLowerCase();
        if (!q) {
          isSearching = false;
          renderTones();
          renderGrid(itemsForCat(activeCat));
          return;
        }
        isSearching = true;
        renderTones();
        var matches = searchIndex.filter(function (it) {
          return it[1].toLowerCase().indexOf(q) !== -1;
        }).slice(0, 200).map(function (it) { return { e: it[0], n: it[1] }; });
        renderGrid(matches);
      });
    }

    if (favDownloadBtn) {
      favDownloadBtn.addEventListener("click", downloadFavorites);
    }

    renderTabs();
    renderTones();
    renderGrid(itemsForCat(activeCat));
    refreshFavUi();
  }

  /* ---------- Combo packs ---------- */
  function initCombos() {
    var root = $("[data-combo-grid]");
    if (!root) return;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-combo-copy]");
      if (!btn) return;
      var combo = btn.getAttribute("data-combo-copy");
      copyToClipboard(combo, function (ok) {
        showCopyToast(combo, ok);
      });
    });
  }

  /* ---------- Kaomoji tool ---------- */
  function initKaomojiTool() {
    var root = $("[data-kaomoji-tool]");
    var kaomojiData = window.__KAOMOJI_DATA__;
    if (!root || !kaomojiData || !kaomojiData.categories) return;

    var tabsEl = $("[data-cat-tabs]", root);
    var gridEl = $("[data-emoji-grid]", root);
    var searchEl = $("[data-emoji-search]", root);

    var categories = kaomojiData.categories;
    var activeCat = categories[0] ? categories[0].id : null;

    function allFlat() {
      var out = [];
      categories.forEach(function (cat) {
        cat.items.forEach(function (it) { out.push([it[0], it[1]]); });
      });
      return out;
    }
    var flat = allFlat();

    function renderTabs() {
      if (!tabsEl) return;
      tabsEl.innerHTML = categories.map(function (cat) {
        var selected = cat.id === activeCat;
        return '<button type="button" class="cat-tab" data-cat="' + cat.id + '" role="tab" ' +
          'aria-selected="' + (selected ? "true" : "false") + '" aria-label="' + escHTML(cat.label) + '">' +
          '<span class="cat-tab-icon" aria-hidden="true">' + cat.icon + "</span>" +
          "<span>" + escHTML(cat.label) + "</span></button>";
      }).join("");
    }

    function itemsForCat(id) {
      var cat = categories.filter(function (c) { return c.id === id; })[0];
      return cat ? cat.items : [];
    }

    function renderGrid(items) {
      if (!gridEl) return;
      if (!items.length) {
        gridEl.innerHTML = '<div class="empty-state">No se encontraron kaomoji. Prueba con otra palabra.</div>';
        return;
      }
      gridEl.innerHTML = items.map(function (it) {
        return '<button type="button" class="kaomoji-cell" data-kaomoji="' + escHTML(it[0]) +
          '" title="' + escHTML(it[1]) + '" aria-label="Copiar kaomoji: ' + escHTML(it[1]) + '">' +
          '<span aria-hidden="true">' + escHTML(it[0]) + "</span></button>";
      }).join("");
    }

    function setActive(id) {
      activeCat = id;
      renderTabs();
      if (searchEl) searchEl.value = "";
      renderGrid(itemsForCat(id));
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
        var cell = e.target.closest(".kaomoji-cell");
        if (!cell) return;
        var kaomoji = cell.getAttribute("data-kaomoji");
        cell.classList.remove("is-copied");
        void cell.offsetWidth;
        cell.classList.add("is-copied");
        copyToClipboard(kaomoji, function (ok) { showCopyToast(kaomoji, ok); });
      });
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        var q = searchEl.value.trim().toLowerCase();
        if (!q) { renderGrid(itemsForCat(activeCat)); return; }
        var matches = flat.filter(function (it) {
          return it[1].toLowerCase().indexOf(q) !== -1;
        }).slice(0, 200);
        renderGrid(matches);
      });
    }

    renderTabs();
    renderGrid(itemsForCat(activeCat));
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
    safe(initCombos, "initCombos");
    safe(initKaomojiTool, "initKaomojiTool");
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
