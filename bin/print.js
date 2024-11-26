/* eslint no-fallthrough: "off" */

import fs from "node:fs";
import path from "node:path";

import express from "express";
import { chromium } from "playwright";

import { compose, filter, map } from "ramda";

import defaults from "../src/defaults.json" with { type: "json" };
import { setup } from "../src/render/util.js";

let config = {};
if (fs.existsSync(path.resolve("../src/config.json"))) {
  config = await import("../src/config.json", { with: { type: "json" } });
}

// Setup folders
setup();

// Start up the server
const app = express();

app.use(express.static(path.join(process.cwd(), "dist/site")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(process.cwd(), "dist/site", "index.html"));
});

const server = app.listen(9000);

if (process.argv[2] === "debug") process.exit(0);

let games = [process.argv[2] || "1889"];
if (process.argv[2] === "all") {
  // Read all games from directory
  const gameFiles = fs.readdirSync("./src/data/games");
  games = compose(
    map((name) => name.replace(/\.json$/, "")),
    filter((name) => name.endsWith(".json")),
  )(gameFiles);
} else {
  // Check if the game exists
  if (!fs.existsSync(`./src/data/games/${games[0]}.json`)) {
    console.error(`Game ${games[0]} not found`);
    process.exit(1);
  }
}
console.log(`Games: ${games.join(", ")}`);

// Start processing
(async () => {
  const browser = await chromium.launch({
    args: ["--force-color-profile srgb"],
  });

  const page = await browser.newPage();

  for (let g = 0; g < games.length; g++) {
    let game = games[g];

    // Create the output folder
    try {
      fs.mkdirSync(`./render/${game}`);
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    let items = [
      "background",
      "cards",
      "charters",
      "map",
      "map?paginated=true",
      "market",
      "market?paginated=true",
      "par",
      "par?paginated=true",
      "revenue",
      "revenue?paginated=true",
      "tile-manifest",
      "tiles",
      "tokens",
    ];

    let gameDef = await import(`../src/data/games/${game}.json`, {
      with: { type: "json" },
    }).then((module) => module.default);

    for (let i = 0; i < items.length; i++) {
      let item = items[i];

      // Break if the game doesn't include certain items
      let hasData = true;
      let filename = `${game}-${item}.pdf`;
      let tilesLayout =
        config.tiles && config.tiles.layout
          ? config.tiles.layout
          : defaults.tiles.layout;
      let cardsLayout =
        config.cards && config.cards.layout
          ? config.cards.layout
          : defaults.cards.layout;

      switch (item) {
        case "cards":
          filename = `${game}-cards-${cardsLayout}.pdf`;
          if (
            !gameDef.companies &&
            !gameDef.privates &&
            !gameDef.trains &&
            !gameDef.players
          ) {
            hasData = false;
          }
          break;
        case "tokens":
        case "charters":
          if (!gameDef.companies) {
            hasData = false;
          }
          break;
        case "map?paginated=true":
          filename = `${game}-map-paginated.pdf`;
        case "map":
          if (!gameDef.map) {
            hasData = false;
          }
          break;
        case "market?paginated=true":
          filename = `${game}-market-paginated.pdf`;
        case "market":
          if (!gameDef.stock) {
            hasData = false;
          }
          break;
        case "par?paginated=true":
          filename = `${game}-par-paginated.pdf`;
        case "par":
          if (
            !gameDef.stock ||
            !gameDef.stock.par ||
            !gameDef.stock.par.values
          ) {
            hasData = false;
          }
          break;
        case "revenue?paginated=true":
          filename = `${game}-revenue-paginated.pdf`;
          break;
        case "tiles":
          filename = `${game}-tiles-${tilesLayout}.pdf`;
        case "tile-manifest":
          if (!gameDef.tiles) {
            hasData = false;
          }
          break;
        default:
          break;
      }

      if (!hasData) {
        continue;
      }

      console.log(`Printing ${filename}`);
      await page.goto(`http://localhost:9000/games/${game}/${item}`, {
        waitUntil: "networkidle",
      });
      await page.pdf({
        path: `render/${game}/${filename}`,
        scale: 1.0,
        preferCSSPageSize: true,
      });
    }
  }

  await browser.close();

  await server.close();
})();
