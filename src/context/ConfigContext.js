import { createContext, useContext } from "react";
import GameContext from "./GameContext";

import defaultTo from "ramda/src/defaultTo";
import mergeDeepRight from "ramda/src/mergeDeepRight";

import defaultConfig from "../defaults.json";
import userConfig from "../config.json";

import useLocalState from "../util/useLocalState";
import { diff } from "deep-object-diff";

const ConfigContext = createContext({ config: {} });

export const useConfig = () => {
  const { game } = useContext(GameContext);
  const gameConfig = defaultTo({}, game && game.config);

  const [storedConfig, setStoredConfig] = useLocalState('config', {});

  const initialConfig = mergeDeepRight(defaultConfig, userConfig);
  const preGameConfig = mergeDeepRight(initialConfig, storedConfig);
  const config = mergeDeepRight(preGameConfig, gameConfig);

  return {
    setConfig: (config) => setStoredConfig(diff(initialConfig, config)),
    resetConfig: () => setStoredConfig({}),
    config,
    defaultConfig,
    userConfig,
    gameConfig,
    storedConfig
  }
}

export default ConfigContext;
