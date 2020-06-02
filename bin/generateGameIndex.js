#!/usr/bin/env node

const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const map = require("ramda/src/map");
const path = require("path");

let files = glob.sync("**/*.json", { cwd: "./src/data/games" });

let public_games = [];
// Create proper data for template
let games = map((file) => {
  let dir = path.dirname(file);
  let group = dir === "." ? undefined : dir;

  let id = path.basename(file, ".json");
  let slug = encodeURIComponent(id);

  // Load json in order to get more data
  let data = require(`../src/data/games/${file}`);
  let { title, subtitle, designer, publisher } = data.info;

  let minPlayers = data.players ? data.players[0].number : 0;
  let maxPlayers = data.players
    ? data.players[data.players.length - 1].number
    : 0;

  let game = {
    id,
    slug,
    file,
    title,
    subtitle,
    designer,
    publisher,
    minPlayers,
    maxPlayers,
  };

  if (group) {
    game.group = group;

    if (group === "public") {
      public_games.push(game);
    }
  }

  return game;
}, files);

const template = Handlebars.compile(
  fs.readFileSync("./src/data/games/index.js.hb", { encoding: "UTF8" })
);

fs.writeFileSync(
  "./src/data/games/index.js",
  template({ games, public_games }),
  { mode: "644" }
);
