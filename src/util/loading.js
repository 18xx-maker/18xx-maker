import { compose, curry, pick, prop } from "ramda";

export const BUNDLED = "bundled";
export const ELECTRON = "electron";

export const info = compose(
  pick(["title", "subtitle", "designer", "publisher"]),
  prop("info"),
);

export const getGameSummary = (game, extra = {}) => ({
  ...info(game),
  ...game.meta,
  ...extra,
});

export const loadFile = (file) => file.text().then(JSON.parse);

export const loadSummary = curry((type, file) =>
  loadFile(type, file).then(getGameSummary),
);
