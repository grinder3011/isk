// translations/i18n.js

let currentLang = 'en';
let translations = {};
const defaultTexts = new Map();

// Cache original text/placeholder/alt
function cacheDefaults() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (!defaultTexts.has(el)) {
      if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
        defaultTexts.set(el, el.placeholder);
      } else if (el.tagName.toLowerCase() === 'img' && el.hasAttribute('data-i18n-alt')) {
        defaultTexts.set(el, el.alt);
      } else {
        defaultTexts.set(el, el.textContent);
      }
    }
  });
}

// Apply translations (or revert to default if missing)
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = translations[key];

    if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
      el.placeholder = translated || defaultTexts.get(el) || '';
    } else if (el.tagName.toLowerCase() === 'img' && el.hasAttribute('data-i18n-alt')) {
      el.alt = translated || defaultTexts.get(el) || '';
    } else {
      el.textContent = translated || defaultTexts.get(el) || '';
    }
  });
}

// Load JSON translations
async function loadTranslations(lang) {
  if (lang === 'en') {
    translations = {}; // revert to default texts
    applyTranslations();
    return;
  }

  try {
    const res = await fetch(`translations-${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    translations = await res.json();
    applyTranslations();
  } catch (err) {
    console.error('Could not load translations:', err);
    translations = {};
    applyTranslations();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  cacheDefaults();

  const selector = document.getElementById('languageSelector');
  if (selector) {
    selector.value = currentLang;
    selector.addEventListener('change', e => {
      currentLang = e.target.value;
      loadTranslations(currentLang);
    });
  }

  // Apply default language on page load
  applyTranslations();
});
