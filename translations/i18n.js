// translations/i18n.js
// Robust i18n loader — place alongside translations-<lang>.json files.
// Expects translation files named: translations-<lang>.json (e.g. translations-sl.json)

(() => {
  // --- config ---
  const DEFAULT_LANG = 'en';
  // --- end config ---

  let currentLang = localStorage.getItem('lang') || DEFAULT_LANG;
  let translations = {};                 // object with current translations
  const defaultTexts = new Map();        // Map<Element, string> of original texts/placeholders/alts

  // Resolve base folder of this script so fetch uses the same folder as this file.
  // This handles pages at different depths reliably.
  function getScriptBasePath() {
    // document.currentScript may be null in some async cases — fall back to scanning scripts
    const script = document.currentScript || (() => {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    if (!script || !script.src) return './';
    const url = new URL(script.src, location.href);
    // remove filename, keep trailing slash
    url.pathname = url.pathname.replace(/\/[^/]*$/, '/');
    return url.href;
  }
  const scriptBase = getScriptBasePath(); // full URL to folder containing i18n.js

  // Cache original text/placeholder/alt for every element that has data-i18n
  function cacheDefaults() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (defaultTexts.has(el)) return;
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        defaultTexts.set(el, el.placeholder || '');
      } else if (tag === 'img' && el.hasAttribute('data-i18n-alt')) {
        defaultTexts.set(el, el.alt || '');
      } else {
        defaultTexts.set(el, el.textContent || '');
      }
    });
  }

  // Apply translations (or revert to cached default)
  function applyTranslationsToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = translations && translations[key];
      const tag = el.tagName.toLowerCase();

      // choose value: translated if present, else cached default
      const value = (translated !== undefined) ? translated : defaultTexts.get(el);

      if (tag === 'input' || tag === 'textarea') {
        el.placeholder = value ?? '';
      } else if (tag === 'img' && el.hasAttribute('data-i18n-alt')) {
        el.alt = value ?? '';
      } else {
        el.textContent = value ?? '';
      }

      // helpful console warning if translation is missing (optional)
      if (!translated && currentLang !== DEFAULT_LANG) {
        // warn once per key to avoid spam — use a symbol on the element
        if (!el.__i18n_warned) {
          console.warn(`i18n: missing translation for key "${key}" (lang="${currentLang}")`);
          el.__i18n_warned = true;
        }
      }
    });
  }

  // Load translations JSON for a language.
  // Translation files expected in same folder as this script and named: translations-<lang>.json
  async function loadTranslations(lang) {
    // If english (default), just clear translations and apply defaults
    if (!lang || lang === DEFAULT_LANG) {
      translations = {};
      applyTranslationsToDOM();
      return;
    }

    const fileName = `translations-${lang}.json`; // your files: translations-sl.json
    const url = new URL(fileName, scriptBase).href;

    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      translations = await res.json();
    } catch (err) {
      console.error(`i18n: Could not load translations from ${url}:`, err);
      translations = {}; // fallback to defaults
    } finally {
      applyTranslationsToDOM();
    }
  }

  // Public callable function (pages can call window.setLang('sl') or window.applyTranslations('sl'))
  async function setLang(lang) {
    if (!lang) lang = DEFAULT_LANG;
    currentLang = lang;
    try { localStorage.setItem('lang', currentLang); } catch (e) { /* ignore */ }
    await loadTranslations(currentLang);
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    cacheDefaults();

    // If page has a selector with this exact id, wire it up (optional)
    const selector = document.querySelector('#languageSelector');
    if (selector) {
      // Set selector value to remembered lang
      if ([...selector.options].some(o => o.value === currentLang)) {
        selector.value = currentLang;
      }
      selector.addEventListener('change', (e) => {
        setLang(e.target.value);
      });
    }

    // load saved language automatically (will apply defaults or translation)
    loadTranslations(currentLang);
  });

  // expose to global so other pages/scripts can call it
  window.i18n = {
    setLang,               // programmatically set language: i18n.setLang('sl')
    getLang: () => currentLang,
    apply: applyTranslationsToDOM
  };

})();
