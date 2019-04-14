const fs = require('fs');
const puppeteer = require('puppeteer');
const R = require('ramda');
const express = require('express');
const path = require('path');

require("@babel/register");

const util = require('../src/render/util');
const setup = util.setup;

setup();

let games = [process.argv[2] || "1830"];
if(process.argv[2] === "all") {
  games = R.keys(require("../src/data/games").default);
}

const app = express();

app.use(express.static(path.join(process.cwd(), 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(process.cwd(), 'build', 'index.html'));
});

const server = app.listen(9000);

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  for(let g=0;g<games.length;g++) {
    let game = games[g];

    // Create the output folder
    try {
      fs.mkdirSync(`./build/render/${game}`);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    let items = ['background', 'cards', 'charters', 'map', 'map-paginated', 'market', 'tiles', 'tokens'];

    let gameDef = require(`../src/data/games/${game}`).default;

    for(let i=0;i<items.length;i++) {
      let item = items[i];

      if(item === "map-paginated" && gameDef.info.paginated === false) continue;
      if(item === "market" && gameDef.stock.paginated === true) item = 'market-paginated';

      console.log("Printing " + game + "/" + item);
      await page.goto(`http://localhost:9000/${game}/${item}`, {waitUntil: 'networkidle2'});
      await page.pdf({path: `build/render/${game}/${item.replace(/\//g,'-')}.pdf`, scale: 1.0, preferCSSPageSize: true});
    }

    // Board 18 Output
    let tileDefs = require('../src/data/tiles').default;
    let counts = R.compose(
      R.countBy(R.identity),
      R.map(R.prop("color")),
      R.uniq,
      R.map(id => tileDefs[id] || tileDefs[id.split("|")[0]])
    )(R.keys(gameDef.tiles));
    let colors = R.keys(counts);

    for(let j=0;j<colors.length;j++) {
      let color = colors[j];

      let width = counts[color] * 150;
      let height = 900;

      console.log("Printing " + game + "/b18-tiles-" + color);
      await page.goto(`http://localhost:9000/${game}/b18-tiles-${color}`, {waitUntil: 'networkidle2'});
      await page.setViewport({ width, height });
      await page.addStyleTag({ content: 'nav {display:none;} footer {display:none;} .PrintNotes {display:none;}'});
      await page.screenshot({ path: `build/render/${game}/b18-tiles-${color}.png`, omitBackground: true });
    }
  }

  await browser.close();

  await server.close();
})();
