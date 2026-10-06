import { assoc, assocPath, defaultTo, dissoc, mergeDeepRight } from "ramda";

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

// Every layer of the config, lowest to highest: the defaults, the user's
// config.json, the config stored by the app, URL parameters and finally the
// game's own config. The print scale is a setting of the printer, not of the
// game: the game's config never sets it. In render mode (the exports) it is
// always 100, an export has a fixed size.
export const resolveConfig = ({
  defaults = {},
  user = {},
  stored = {},
  search = "",
  gameConfig,
  render = false,
} = {}) => {
  const searchConfig = searchToConfig(search);
  const game = dissoc("printScale", defaultTo({}, gameConfig));
  const preSearch = mergeDeepRight(mergeDeepRight(defaults, user), stored);
  const preGame = mergeDeepRight(preSearch, searchConfig);

  const merged = mergeDeepRight(preGame, game);
  const config =
    render || merged.printScale !== undefined
      ? assoc(
          "printScale",
          render ? 100 : parsePrintScale(merged.printScale),
          merged,
        )
      : merged;

  return { config, searchConfig, gameConfig: game };
};
