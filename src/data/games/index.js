import path from "path-browserify";

let gameImports = import.meta.glob("./*.json", { eager: true, import: "default" });

let games = {};

for (let [filename, game] of Object.entries(gameImports)) {
  let id = path.basename(filename, ".json");
  let slug = encodeURIComponent(id);
  let minPlayers = game.players ? game.players[0].number : 0;
  let maxPlayers = game.players ? game.players[game.players.length - 1].number : 0;
  games[id] = {
    meta: {
      id,
      slug,
      filename,
      minPlayers,
      maxPlayers
    },
    ...game
  };
}

export default games;
