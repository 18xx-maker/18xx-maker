import { createContext, useContext } from "react";
import GameContext from "./GameContext";
import { useLocation } from "react-router-dom";

import assocPath from "ramda/src/assocPath";
import defaultTo from "ramda/src/defaultTo";
import mergeDeepRight from "ramda/src/mergeDeepRight";

import defaultConfig from "../defaults.json";
import userConfig from "../config.json";

import useLocalState from "../util/useLocalState";
import { diff } from "deep-object-diff";

const ConfigContext = createContext({ config: {} });

export const useConfig = () => {
  const { game } = useContext(GameContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const gameConfig = defaultTo({}, game && game.config);

  const [storedConfig, setStoredConfig] = useLocalState("config", {});

  const initialConfig = mergeDeepRight(defaultConfig, userConfig);

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
  const config = mergeDeepRight(preGameConfig, gameConfig);

  return {
    setConfig: (config) => setStoredConfig(diff(initialConfig, config)),
    resetConfig: () => setStoredConfig({}),
    config,
    defaultConfig,
    userConfig,
    searchConfig,
    gameConfig,
    storedConfig,
  };
};

export default ConfigContext;
