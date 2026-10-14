/* spacelibre VI — client-side i18n. Auto-detects the visitor's language, switches on
   demand and works offline (translations are bundled in i18n-data.js). No server needed. */
(function () {
  'use strict';
  var DATA = window.SPACELIBRE_I18N || {};
  var BASE = 'zh-CN'; // the inline source language
  var ORDER = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'es', 'pt', 'fr', 'de', 'it', 'ru',
    'ar', 'hi', 'id', 'vi', 'th', 'tr', 'nl', 'pl', 'fa', 'uk', 'he'];
  var NAMES = {
    'zh-CN': '简体中文', 'zh-TW': '繁體中文', 'en': 'English', 'ja': '日本語', 'ko': '한국어',
    'es': 'Español', 'pt': 'Português', 'fr': 'Français', 'de': 'Deutsch', 'it': 'Italiano',
    'ru': 'Русский', 'ar': 'العربية', 'hi': 'हिन्दी', 'id': 'Bahasa Indonesia',
    'vi': 'Tiếng Việt', 'th': 'ไทย', 'tr': 'Türkçe', 'nl': 'Nederlands', 'pl': 'Polski',
    'fa': 'فارسی', 'uk': 'Українська', 'he': 'עברית'
  };
  var RTL = { ar: 1, he: 1, fa: 1, ur: 1 };

  var LOCALES = ORDER.filter(function (l) { return l === BASE || !!DATA[l]; });
  Object.keys(DATA).forEach(function (l) { if (LOCALES.indexOf(l) < 0) LOCALES.push(l); });

  function norm(tag) {
    tag = String(tag || '').toLowerCase().replace('_', '-');
    if (tag.indexOf('zh') === 0) return /hant|tw|hk|mo/.test(tag) ? 'zh-TW' : BASE;
    var b = tag.split('-')[0];
    if (b === 'nb' || b === 'nn') b = 'no';
    return b;
  }
  function match(cands) {
    for (var i = 0; i < cands.length; i++) {
      var full = String(cands[i]).toLowerCase().replace('_', '-');
      if (LOCALES.indexOf(full) >= 0) return full;
      var n = norm(cands[i]);
      if (LOCALES.indexOf(n) >= 0) return n;
    }
    return null;
  }
  function initial() {
    var q = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
    if (q) { var m = match([q]); if (m) return m; }
    try { var s = localStorage.getItem('spacelibre.lang'); if (s && LOCALES.indexOf(s) >= 0) return s; } catch (e) {}
    var nav = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
    return match(nav) || 'en';
  }

  var current = initial();
  var cat = (current === BASE) ? null : (DATA[current] || null);
  var fb = (current === BASE) ? null : (DATA.en || null);

  function look(kind, key) {
    var v = cat && cat[kind] && cat[kind][key];
    if (v) return v;
    v = fb && fb[kind] && fb[kind][key];
    if (v) return v;
    return null;
  }
  function t(key, vars) {
    var s = look('text', key);
    if (s === null) s = key;
    if (vars) for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  window.t = t;
  window.spacelibreLocale = current;

  function applyDom() {
    var root = document.documentElement;
    root.lang = current;
    root.dir = RTL[current.split('-')[0]] ? 'rtl' : 'ltr';
    if (!cat && !fb) return;
    var TW = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = TW.nextNode())) {
      var p = node.parentNode;
      if (p) { var tag = (p.nodeName || '').toLowerCase(); if (tag === 'script' || tag === 'style') continue; }
      var raw = node.nodeValue || '';
      var key = raw.trim();
      if (!key) continue;
      var v = look('text', key);
      if (v && v !== key) node.nodeValue = raw.replace(key, v);
    }
    var names = ['alt', 'aria-label', 'placeholder', 'title', 'content'];
    Array.prototype.forEach.call(
      document.querySelectorAll('[alt],[aria-label],[placeholder],[title],[content]'),
      function (el) {
        names.forEach(function (a) {
          var raw = el.getAttribute(a);
          if (!raw) return;
          var key = raw.trim();
          var v = look('attr', key);
          if (v && v !== key) el.setAttribute(a, v);
        });
      }
    );
  }

  function buildSwitcher() {
    var sel = document.querySelector('#lang-select');
    if (!sel) return;
    sel.innerHTML = LOCALES.map(function (l) {
      return '<option value="' + l + '"' + (l === current ? ' selected' : '') + '>' + (NAMES[l] || l) + '</option>';
    }).join('');
    sel.addEventListener('change', function () {
      try { localStorage.setItem('spacelibre.lang', sel.value); } catch (e) {}
      var url = null;
      try { url = new URL(location.href); url.searchParams.set('lang', sel.value); } catch (e) {}
      if (url) { location.href = url.toString(); } else { location.reload(); }
    });
  }

  applyDom();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildSwitcher);
  else buildSwitcher();
})();
