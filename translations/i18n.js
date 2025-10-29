// i18n.js
let translations = {}; // will hold the currently loaded translation JSON

// Load translation JSON file
async function loadTranslations(lang) {
  try {
    const response = await fetch(`translations_${lang}.json`);
    translations = await response.json();
    updatePageText();
  } catch (error) {
    console.error("Could not load translations:", error);
  }
}

// Update all elements with data-i18n / data-i18n-alt
function updatePageText() {
  // Elements with visible text
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[key]) el.textContent = translations[key];
  });

  // Elements with alt attributes (like images)
  document.querySelectorAll("[data-i18n-alt]").forEach(el => {
    const key = el.getAttribute("data-i18n-alt");
    if (translations[key]) el.alt = translations[key];
  });

  // Optionally, update placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[key]) el.placeholder = translations[key];
  });

  // Optionally, update tooltips
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (translations[key]) el.title = translations[key];
  });
}

// Language selector event listener
document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("languageSelector");
  if (!selector) return;

  // Load default language (English)
  loadTranslations(selector.value);

  // Change language on selection
  selector.addEventListener("change", (e) => {
    loadTranslations(e.target.value);
  });
});
