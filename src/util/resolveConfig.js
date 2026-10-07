import { assoc, assocPath, defaultTo, mergeDeepRight, omit } from "ramda";

import { parsePrintScale } from "./index.js";

// The die sizes in `cards.dice` are numbers, a URL parameter is a string. A
// value that is not a number is dropped (the die keeps its own size).
const diceToNumbers = (value) =>
  Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      if (item !== null && typeof item === "object") {
        return [[key, diceToNumbers(item)]];
      }
      const number = item === "" ? NaN : Number(item);
      return Number.isFinite(number) ? [[key, number]] : [];
    }),
  );

// The config values in URL parameters: ?config.cards.layout=die becomes
// { cards: { layout: "die" } }. search is a query string or URLSearchParams.
export const searchToConfig = (search = "") => {
  let searchConfig = {};
  for (let [key, value] of new URLSearchParams(search).entries()) {
    let [head, ...path] = key.split(".");
    if (head === "config" && path.length > 0) {
      searchConfig = assocPath(path, value, searchConfig);
    }
  }

  // The settings that are numbers and must not reach the layout as a string
  if (searchConfig.printScale !== undefined) {
    searchConfig = assoc(
      "printScale",
      parsePrintScale(searchConfig.printScale),
      searchConfig,
    );
  }
  if (searchConfig.cards?.dice) {
    searchConfig = assocPath(
      ["cards", "dice"],
      diceToNumbers(searchConfig.cards.dice),
      searchConfig,
    );
  }

  return searchConfig;
};

// A config without any value: {} or {cards:{}} is not an override
const hasValues = (value) =>
  value !== null && typeof value === "object"
    ? Object.values(value).some(hasValues)
    : value !== undefined;

// Every layer of the config, lowest to highest: the defaults, the user's
// config.json, the config stored by the app, URL parameters and finally the
// game's own config. The game's config only applies when the user allows it
// (allowGameConfig, read from the defaults, user and stored layers: never the
// URL, so the page, the exports and the CLI agree). The print scale is a
// setting of the printer, not of the game: the game's config never sets it,
// nor the allowGameConfig setting. In render mode (the exports) the print
// scale is always 100, an export has a fixed size.
export const resolveConfig = ({
  defaults = {},
  user = {},
  stored = {},
  search = "",
  gameConfig,
  render = false,
} = {}) => {
  const searchConfig = searchToConfig(search);
  const game = omit(
    ["printScale", "allowGameConfig"],
    defaultTo({}, gameConfig),
  );
  const userLayerConfig = mergeDeepRight(
    mergeDeepRight(defaults, user),
    stored,
  );
  const preGame = mergeDeepRight(userLayerConfig, searchConfig);
  const gameConfigAllowed = userLayerConfig.allowGameConfig === true;

  const merged = gameConfigAllowed ? mergeDeepRight(preGame, game) : preGame;
  const config =
    render || merged.printScale !== undefined
      ? assoc(
          "printScale",
          render ? 100 : parsePrintScale(merged.printScale),
          merged,
        )
      : merged;

  return {
    config,
    searchConfig,
    gameConfig: game,
    gameConfigAllowed,
    gameConfigIgnored: !gameConfigAllowed && hasValues(game),
    userLayerConfig,
  };
};
