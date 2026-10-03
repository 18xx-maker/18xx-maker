import { diff } from "deep-object-diff";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

import { mergeDeepRight } from "ramda";

import { useGame, useValidation } from "@/hooks";
import { createAlert, createResetConfig, createSetConfig } from "@/state";
import { createConfigSelector } from "@/state/selectors";
import { getRenderInput } from "@/util/renderInput";

const configs = import.meta.glob("../*.json", {
  eager: true,
  import: "default",
});
const defaultConfig = configs["../defaults.json"];
const userConfig = configs["../config.json"] || {};
const renderInput = getRenderInput();
// In render mode the page is given the layers below the URL parameters, they
// replace the config.json built into the page
const initialConfig = renderInput
  ? mergeDeepRight(defaultConfig, renderInput.config)
  : mergeDeepRight(defaultConfig, userConfig);

const selectConfig = createConfigSelector(initialConfig);

export const useConfig = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const game = useGame();
  const location = useLocation();
  const { validateConfigSchema, checkConfigSchema } = useValidation();

  const storedConfig = useSelector((state) => state.config);
  const { config, searchConfig, gameConfig } = useSelector((state) =>
    selectConfig(state, location.search, game),
  );

  const setConfig = useCallback(
    async (config) => {
      const errors = await validateConfigSchema(config);

      if (!errors.length) {
        return dispatch(createSetConfig(diff(initialConfig, config)));
      }
    },
    [dispatch, validateConfigSchema],
  );

  // Replaces the stored config with the imported settings and alerts with the
  // result. Resolves true when imported, nothing is stored on schema errors.
  const importConfig = useCallback(
    async (imported) => {
      const full = mergeDeepRight(defaultConfig, imported);
      const errors = await checkConfigSchema(full);

      if (errors.length) {
        dispatch(
          createAlert(
            t("alerts.configInvalid"),
            errors
              .map((error) => `${error.data.pointer}: ${error.message}`)
              .join("\n"),
            "error",
          ),
        );
        return false;
      }

      dispatch(createSetConfig(diff(initialConfig, full)));
      dispatch(
        createAlert(
          t("alerts.configImported"),
          t("alerts.configImportedMessage"),
          "success",
        ),
      );
      return true;
    },
    [dispatch, checkConfigSchema, t],
  );

  return {
    setConfig,
    importConfig,
    resetConfig: useCallback(() => dispatch(createResetConfig()), [dispatch]),
    config,
    defaultConfig,
    userConfig,
    searchConfig,
    gameConfig,
    storedConfig,
  };
};
