// The language the system declares (what is used without an override)
export const detectedLanguage = () =>
  (typeof navigator !== "undefined" &&
    (navigator.languages?.[0] || navigator.language)) ||
  "en";

// Languages with translations
export const availableLanguages = (i18n) =>
  Object.keys(i18n.options.resources ?? {});
