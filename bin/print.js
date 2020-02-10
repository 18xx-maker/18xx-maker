const R = require('ramda');
const express = require('express');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

require("@babel/register");

const util = require('../src/render/util');
const setup = util.setup;

setup();

const gameDefs = require('../src/data/games').default;
let games = [process.argv[2] || "1830"];
if(process.argv[2] === "all") {
  games = R.keys(gameDefs);
}

const app = express();

app.use(express.static(path.join(process.cwd(), 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});

const server = app.listen(9000);

(async () => {
  if (process.argv[2] === "debug") return;

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile', 'srgb', '--force-raster-color-profile', 'srgb']});
  const page = await browser.newPage();

  for(let g=0;g<games.length;g++) {
    let game = games[g];

    // Create the output folder
    try {
      fs.mkdirSync(`./build/render/${game}`);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    let items = [
      'background',
      'bankpool',
      'cards',
      'charters',
      'ipo',
      'map',
      'map-paginated',
      'market',
      'market-paginated',
      'par',
      'par-paginated',
      'revenue',
      'revenue-paginated',
      'tile-manifest',
      'tiles',
      'tokens'
    ];

    let gameDef = gameDefs[game];

    for(let i=0;i<items.length;i++) {
      let item = items[i];

      // Break if the game doesn't include certain items
      let hasData = true;
      switch (item) {
      case "bankpool":
        if (!gameDef.pools) {
          hasData = false;
        }
        break;
      case "cards":
        if (!gameDef.companies && !gameDef.privates && !gameDef.trains && !gameDef.players) {
          hasData = false;
        }
        break;
      case "tokens":
      case "charters":
        if (!gameDef.companies) {
          hasData = false;
        }
        break;
      case "ipo":
        if (!gameDef.ipo) {
          hasData = false;
        }
        break;
      case "map":
      case "map-paginated":
        if (!gameDef.map) {
          hasData = false;
        }
        break;
      case "market":
      case "market-paginated":
        if (!gameDef.stock) {
          hasData = false;
        }
        break;
      case "par":
      case "par-paginated":
        if (!gameDef.stock || !gameDef.stock.par || !gameDef.stock.par.values) {
          hasData = false;
        }
        break;
      case "tiles":
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

      console.log("Printing " + game + "/" + item);
      await page.goto(`http://localhost:9000/${game}/${item}`, {waitUntil: 'networkidle2'});
      await page.pdf({path: `build/render/${game}/${item}.pdf`, scale: 1.0, preferCSSPageSize: true});
    }
  }

  await browser.close();

  await server.close();
})();
