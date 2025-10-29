// translations/i18n.js

let currentLang = 'en';
let translations = null;

// Load translations for a given language
async function loadTranslations(lang) {
  if (lang === 'en') {
    // English: reset to default HTML text
    translations = null;
    applyTranslations();
    return;
  }

  try {
    // Fetch the JSON file relative to this JS file
    const response = await fetch(`translations_${lang}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations = await response.json();
    applyTranslations();
  } catch (err) {
    console.error("Could not load translations:", err);
  }
}

// Apply translations to elements with data-i18n attributes
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');

    if (translations && translations[key]) {
      if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
        el.placeholder = translations[key];
      } else if (el.tagName.toLowerCase() === 'img' && el.hasAttribute('data-i18n-alt')) {
        el.alt = translations[key];
      } else {
        el.textContent = translations[key];
      }
    } else if (el.hasAttribute('data-i18n-default')) {
      // Optional: restore default text if specified
      el.textContent = el.getAttribute('data-i18n-default');
    }
    // Otherwise leave the original HTML text (default English)
  });
}

// Initialize language selector (assumes there's a <select id="language-select">)
document.addEventListener('DOMContentLoaded', () => {
  const selector = document.querySelector('#language-select');
  if (selector) {
    selector.value = currentLang;
    selector.addEventListener('change', e => {
      currentLang = e.target.value;
      loadTranslations(currentLang);
    });
  }

  // Apply default language on page load
  loadTranslations(currentLang);
});
