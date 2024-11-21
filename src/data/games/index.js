import { replace } from "ramda";

let gameImports = import.meta.glob("./*.json", {
  eager: true,
  import: "default",
});

let games = {};

for (let [filename, game] of Object.entries(gameImports)) {
  let id = replace(/^\.\/(.*)\.json$/, "$1", filename);
  let slug = encodeURIComponent(id);
  games[id] = {
    meta: {
      id,
      slug,
      type: "bundled",
    },
    ...game,
  };
}

export default games;
