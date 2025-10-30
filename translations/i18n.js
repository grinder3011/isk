// translations/i18n.js

let currentLang = localStorage.getItem('lang') || 'en';
let translations = null;

// Load translations for a given language
async function loadTranslations(lang) {
  if (lang === 'en') {
    // English: revert to default text
    translations = null;
    applyTranslations();
    return;
  }

  try {
    // JSON file is in the same folder as this script
    const response = await fetch(`translations_${lang}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations = await response.json();
    applyTranslations();
  } catch (err) {
    console.error("Could not load translations:", err);
  }
}

// Apply translations to all elements with data-i18n
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');

    if (translations && translations[key]) {
      // Handle placeholders and alt attributes
      if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
        el.placeholder = translations[key];
      } else if (el.tagName.toLowerCase() === 'img' && el.hasAttribute('data-i18n-alt')) {
        el.alt = translations[key];
      } else {
        el.textContent = translations[key];
      }
    } else if (el.hasAttribute('data-i18n-default')) {
      el.textContent = el.getAttribute('data-i18n-default');
    }
  });
}

// Initialize the language selector and apply saved language
document.addEventListener('DOMContentLoaded', () => {
  const selector = document.querySelector('#languageSelector');

  if (selector) {
    selector.value = currentLang;
    selector.addEventListener('change', e => {
      currentLang = e.target.value;
      localStorage.setItem('lang', currentLang);
      loadTranslations(currentLang);
    });
  }

  // Load saved or default language automatically
  loadTranslations(currentLang);
});
