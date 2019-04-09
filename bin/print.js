const fs = require('fs');
const puppeteer = require('puppeteer');
const R = require('ramda');
const express = require('express');
const path = require('path');

require("@babel/register");

try {
  fs.mkdirSync(`./build`);
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

try {
  fs.mkdirSync(`./build/render`);
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

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

    let items = ['cards', 'charters', 'map', 'map-paginated', 'tiles', 'tokens'];
    if(process.argv[2] === "all") {
      items = ['map'];
    }

    for(let i=0;i<items.length;i++) {
      let item = items[i];
      console.log("Printing " + game + "/" + item);
      await page.goto(`http://localhost:9000/${game}/${item}`, {waitUntil: 'networkidle2'});
      await page.pdf({path: `build/render/${game}/${item.replace(/\//g,'-')}.pdf`, scale: 1.0, preferCSSPageSize: true});
    }

    // Board 18 Output
    let gameDef = require(`../src/data/games/${game}`).default;
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
