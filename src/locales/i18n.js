import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import { preloadedState } from "@/state";
import { getRenderInput } from "@/util/renderInput";

// The language is a persisted setting (settings.language), so the detector
// never caches it. Releases before that cached it in localStorage under
// i18nextLng: it is still read, never written. An export (render mode) never
// touches localStorage.
const order = getRenderInput()
  ? ["navigator", "htmlTag"]
  : ["localStorage", "navigator", "htmlTag"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // undefined lets the detector choose
    lng: preloadedState.settings?.language,
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
