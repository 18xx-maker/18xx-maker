import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import { preloadedState } from "@/state";
import { selectLanguage } from "@/state/selectors";

// The language is a persisted setting (settings.language), so the detector
// never reads or caches it in localStorage. Without a setting it detects it
// from the browser. An export (render mode) never touches localStorage.
const order = ["navigator", "htmlTag"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // undefined lets the detector choose
    lng: selectLanguage(preloadedState),
    fallbackLng: "en",
    load: "languageOnly",

    detection: { order, caches: [] },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    resources: {
      en: {
        translation: en,
      },
    },
  });

export default i18n;
