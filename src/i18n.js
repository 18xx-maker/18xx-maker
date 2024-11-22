import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    load: "languageOnly",

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
