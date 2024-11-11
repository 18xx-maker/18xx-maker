import { assocPath, defaultTo, mergeDeepRight } from "ramda";
import { diff } from "deep-object-diff";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { createSetConfig, createResetConfig } from "@/state";
import { useGame } from "@/hooks";

const configs = import.meta.glob("../*.json", {
  eager: true,
  import: "default",
});
const defaultConfig = configs["../defaults.json"];
const userConfig = configs["../config.json"] || {};
const initialConfig = mergeDeepRight(defaultConfig, userConfig);

export const useConfig = () => {
  const dispatch = useDispatch();
  const game = useGame();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const storedConfig = useSelector((state) => state.config);
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
  const config = mergeDeepRight(preGameConfig, gameConfig);

  return {
    setConfig: (config) =>
      dispatch(createSetConfig(diff(initialConfig, config))),
    resetConfig: () => dispatch(createResetConfig()),
    config,
    defaultConfig,
    userConfig,
    searchConfig,
    gameConfig,
    storedConfig,
  };
};
