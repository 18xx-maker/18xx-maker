/* eslint no-fallthrough: "off" */

import { existsSync, mkdirSync, readdirSync } from "node:fs";

import { chromium } from "playwright";

import { compose, filter, map } from "ramda";

import {
  UsageError,
  customConfig as config,
  defaultConfig as defaults,
  loadGame,
  setup,
  startExpress,
} from "#cli/util";

const command = async (game, opts) => {
  // Setup folders
  setup();

  if (opts.debug) {
    startExpress();
    console.log("Debug Mode");
    console.log("Starting the express server on http://localhost:9000");
    console.log("\nCtrl-C when done");
    return;
  }

  let games = [game];
  if (opts.all) {
    // Read all games from directory
    const gameFiles = readdirSync("./src/data/games");
    games = compose(
      map((name) => name.replace(/\.json$/, "")),
      filter((name) => name.endsWith(".json")),
    )(gameFiles);
  } else {
    // Check if the game exists
    if (!existsSync(`./src/data/games/${games[0]}.json`)) {
      throw new UsageError(`Game ${games[0]} not found`);
    }
  }
  console.log(`Games: ${games.join(", ")}`);

  // Start processing
  const server = startExpress();
  const failed = [];
  let browser;
  try {
    browser = await chromium.launch({
      args: ["--force-color-profile srgb"],
    });

    const page = await browser.newPage();

    for (let g = 0; g < games.length; g++) {
      let game = games[g];

      // Create the output folder
      try {
        mkdirSync(`./render/${game}`);
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

      let gameDef = loadGame(game);

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
        try {
          await page.goto(`http://localhost:9000/games/${game}/${item}`, {
            waitUntil: "networkidle",
          });
          await page.pdf({
            path: `render/${game}/${filename}`,
            scale: 1.0,
            preferCSSPageSize: true,
          });
        } catch (err) {
          console.error(`Failed ${filename}: ${err.message}`);
          failed.push(filename);
        }
      }
    }
  } finally {
    await browser?.close();
    server.close();
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} documents failed:\n${failed.join("\n")}`);
    process.exitCode = 1;
  }
};

export default command;
