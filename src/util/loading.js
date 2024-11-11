import { assoc, compose, curry, pick, prop } from "ramda";

export const getID = (filename) =>
  filename
    .replace(/\.json$/, "")
    .split("/")
    .pop();

export const getInfo = compose(
  pick(["title", "subtitle", "designer", "publisher"]),
  prop("info"),
);

export const getSlug = curry((type, id) => {
  const encoded = encodeURIComponent(id);
  return type === "bundled" ? encoded : `${type}:${encoded}`;
});

export const addMeta = curry((type, id, game) =>
  assoc(
    "meta",
    {
      id,
      type,
      slug: getSlug(type, id),
    },
    game,
  ),
);

export const getGameSummary = (game) => ({
  ...getInfo(game),
  ...game.meta,
});

export const loadFile = curry((type, file) =>
  file
    .text()
    .then(JSON.parse)
    .then(addMeta(type, getID(file.name))),
);

export const loadSummary = curry((type, file) =>
  loadFile(type, file).then(getGameSummary),
);
