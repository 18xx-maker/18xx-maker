import { diff } from "deep-object-diff";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

import { mergeDeepRight } from "ramda";

import { useGame, useValidation } from "@/hooks";
import { createResetConfig, createSetConfig } from "@/state";
import { getRenderInput } from "@/util/renderInput";
import { resolveConfig } from "@/util/resolveConfig";

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

export const useConfig = () => {
  const dispatch = useDispatch();
  const game = useGame();
  const location = useLocation();
  const { validateConfigSchema } = useValidation();

  const storedConfig = useSelector((state) => state.config);
  const { config, searchConfig, gameConfig } = resolveConfig({
    defaults: initialConfig,
    stored: storedConfig,
    search: location.search,
    gameConfig: game && game.config,
  });

  const setConfig = useCallback(
    async (config) => {
      const errors = await validateConfigSchema(config);

      if (!errors.length) {
        return dispatch(createSetConfig(diff(initialConfig, config)));
      }
    },
    [dispatch, validateConfigSchema],
  );

  return {
    setConfig,
    resetConfig: useCallback(() => dispatch(createResetConfig()), [dispatch]),
    config,
    defaultConfig,
    userConfig,
    searchConfig,
    gameConfig,
    storedConfig,
  };
};
