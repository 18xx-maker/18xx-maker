import { diff } from "deep-object-diff";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

import { assocPath, defaultTo, mergeDeepRight } from "ramda";

import { useGame, useValidation } from "@/hooks";
import { createResetConfig, createSetConfig } from "@/state";

const configs = import.meta.glob("../*.json", {
  eager: true,
  import: "default",
});
const defaultConfig = configs["../defaults.json"];
const userConfig = configs["../config.json"] || {};
const initialConfig = mergeDeepRight(defaultConfig, userConfig);

const normalizeNumericConfig = (config, defaults) => {
  if (
    (typeof defaults === "number" || defaults === null) &&
    typeof config === "string" &&
    config !== ""
  ) {
    const value = Number(config);
    return Number.isFinite(value) ? value : config;
  }

  if (Array.isArray(config)) {
    return config.map((value, index) =>
      normalizeNumericConfig(value, defaults?.[index]),
    );
  }

  if (
    config &&
    defaults &&
    typeof config === "object" &&
    typeof defaults === "object"
  ) {
    return Object.fromEntries(
      Object.entries(config).map(([key, value]) => [
        key,
        normalizeNumericConfig(value, defaults[key]),
      ]),
    );
  }

  return config;
};

export const useConfig = () => {
  const dispatch = useDispatch();
  const game = useGame();
  const location = useLocation();
  const { validateConfigSchema } = useValidation();

  const searchParams = new URLSearchParams(location.search);

  const storedConfig = normalizeNumericConfig(
    useSelector((state) => state.config),
    initialConfig,
  );
  const preSearchConfig = mergeDeepRight(initialConfig, storedConfig);

  // Add Search config in
  let searchConfig = {};
  for (let [key, value] of searchParams.entries()) {
    let [head, ...path] = key.split(".");
    if (head === "config" && path.length > 0) {
      searchConfig = assocPath(path, value, searchConfig);
    }
  }
  const preGameConfig = mergeDeepRight(preSearchConfig, searchConfig);

  // Add Game config in
  const gameConfig = defaultTo({}, game && game.config);
  const config = normalizeNumericConfig(
    mergeDeepRight(preGameConfig, gameConfig),
    initialConfig,
  );

  const setConfig = useCallback(
    async (config) => {
      const normalizedConfig = normalizeNumericConfig(config, initialConfig);
      const errors = await validateConfigSchema(normalizedConfig);

      if (!errors.length) {
        return dispatch(
          createSetConfig(diff(initialConfig, normalizedConfig)),
        );
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
