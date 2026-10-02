import { assocPath, defaultTo, mergeDeepRight } from "ramda";

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
  return searchConfig;
};

// Every layer of the config, lowest to highest: the defaults, the user's
// config.json, the config stored by the app, URL parameters and finally the
// game's own config.
export const resolveConfig = ({
  defaults = {},
  user = {},
  stored = {},
  search = "",
  gameConfig,
} = {}) => {
  const searchConfig = searchToConfig(search);
  const game = defaultTo({}, gameConfig);
  const preSearch = mergeDeepRight(mergeDeepRight(defaults, user), stored);
  const preGame = mergeDeepRight(preSearch, searchConfig);

  return {
    config: mergeDeepRight(preGame, game),
    searchConfig,
    gameConfig: game,
  };
};
