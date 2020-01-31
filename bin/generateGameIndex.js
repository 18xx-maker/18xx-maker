#!/usr/bin/env node

const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const map = require("ramda/src/map");
const path = require("path");

let files = glob.sync("**/*.json", { cwd: "./src/data/games" });

let public_games = [];
// Create proper data for template
let games = map(file => {
  let dir = path.dirname(file);
  let group = dir === "." ? undefined : dir;
  let name = path.basename(file, ".json");
  let object = name.replace(/[-\.]/g, '_');

  let game = { name, file, dir, object };

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

fs.writeFileSync("./src/data/games/index.js",
                 template({ games, public_games }),
                 { mode: "644" });
