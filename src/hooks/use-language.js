import i18n from "i18next";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectLanguage } from "@/state/selectors";
import { createSetLanguage } from "@/state/settings";

// The language setting and a function to change it: it is stored in the
// settings and applied to i18n. Without a setting the detected language is used.
export const useLanguage = () => {
  const dispatch = useDispatch();
  const language = useSelector(selectLanguage);
  const setLanguage = useCallback(
    (language) => {
      dispatch(createSetLanguage(language));
      return i18n.changeLanguage(language);
    },
    [dispatch],
  );

  return [language, setLanguage];
};
