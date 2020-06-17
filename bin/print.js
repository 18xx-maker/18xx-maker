const R = require("ramda");
const express = require("express");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

require("@babel/register");

const util = require("../src/render/util");
const config = require("../src/config.json");
const defaults = require("../src/defaults.json");
const setup = util.setup;

setup();

const gameDefs = require("../src/data/games").default;
let games = [process.argv[2] || "1830"];
if (process.argv[2] === "all") {
  games = R.keys(gameDefs);
}

const app = express();

app.use(express.static(path.join(process.cwd(), "build")));

app.get("/*", function (req, res) {
  res.sendFile(path.join(process.cwd(), "build", "index.html"));
});

const server = app.listen(9000);

(async () => {
  if (process.argv[2] === "debug") return;

  const browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--force-color-profile",
      "srgb",
      "--force-raster-color-profile",
      "srgb",
    ],
  });
  const page = await browser.newPage();

  for (let g = 0; g < games.length; g++) {
    let game = games[g];

    // Create the output folder
    try {
      fs.mkdirSync(`./build/render/${game}`);
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

    let gameIndex = gameDefs[game];
    let gameDef;
    if (gameIndex.local) {
      gameDef = require("../data/games/" + gameIndex.file);
    } else {
      gameDef = require("@18xx-maker/games/games/" + gameIndex.file);
    }

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
        waitUntil: "networkidle2",
      });
      await page.pdf({
        path: `build/render/${game}/${filename}`,
        scale: 1.0,
        preferCSSPageSize: true,
      });
    }
  }

  await browser.close();

  await server.close();
})();
