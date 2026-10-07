import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import en from "@/locales/schema.en.json";
import { SCHEMA_KEY } from "@/util/schemaKeys";

// The text of the schemas by language. English is always there (the fallback),
// the other languages are loaded when they are needed.
const loaders = {
  de: () => import("@/locales/schema.de.json"),
  zh: () => import("@/locales/schema.zh.json"),
};
const loaded = { en };
const pending = {};

const load = (language) =>
  (pending[language] ??= loaders[language]()
    .then((module) => {
      loaded[language] = module.default;
    })
    .catch(() => {
      delete pending[language];
    }));

// A function from the key of a schema description to its text in the current
// language. Anything that is not a key (a schema with plain text) is passed on.
export const useSchemaText = () => {
  const { i18n } = useTranslation();
  const language = (i18n.language ?? "en").split("-")[0];
  const [loadedLanguage, setLoadedLanguage] = useState("en");

  useEffect(() => {
    if (loaders[language] && !loaded[language]) {
      let current = true;
      load(language).then(() => current && setLoadedLanguage(language));
      return () => {
        current = false;
      };
    }
  }, [language]);

  // loadedLanguage only makes a language that has just loaded render again
  void loadedLanguage;
  const strings = loaded[language] ?? en;
  return (value) =>
    typeof value === "string" && SCHEMA_KEY.test(value)
      ? (strings[value] ?? en[value] ?? value)
      : value;
};

// The English text of a key, for code that reads the meaning of a description
export const englishSchemaText = (value) => en[value] ?? value;
