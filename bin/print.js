const fs = require('fs');
const puppeteer = require('puppeteer');
const R = require('ramda');

let game = process.argv[2] || "1830";

// Create the output folders
try {
  fs.mkdirSync('./output');
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

try {
  fs.mkdirSync(`./output/${game}`);
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const server = app.listen(9000);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // const items = ['background', 'cards', 'charters', 'map', 'map-paginated', 'tiles', 'tokens'];
  const items = [];

  for(let i=0;i<items.length;i++) {
    let item = items[i];
    console.log("Printing " + game + "/" + item);
    await page.goto(`http://localhost:3000/${game}/${item}`, {waitUntil: 'networkidle2'});
    await page.pdf({path: `output/${game}/${item.replace(/\//g,'-')}.pdf`, scale: 1.0, preferCSSPageSize: true});
  }

  // Board 18 Output
  let gameDef = require(`../src/data/games/${game}`);
  let tileDefs = require('../src/data/tiles');
  let counts = R.compose(
    R.countBy(R.identity),
    R.map(R.prop("color")),
    R.map(id => tileDefs[id] || tileDefs[id.split("|")[0]])
  )(R.keys(gameDef.tiles));
  let colors = R.keys(counts);

  for(let j=0;j<colors.length;j++) {
    let color = colors[j];

    let width = counts[color] * 150;
    let height = 900;

    console.log("Printing " + game + "/b18/tiles/" + color);
    await page.goto(`http://localhost:3000/${game}/b18/tiles/${color}`, {waitUntil: 'networkidle2'});
    await page.pdf({path: `output/${game}/b18-tiles-${color}.pdf`, scale: 1.0, preferCSSPageSize: true});
    await page.setViewport({ width, height });
    await page.addStyleTag({ content: '.App { padding: 0; } .GameMenu { display: none; }'});
    await page.screenshot({ path: `output/${game}/b18-tiles-${color}.png`, omitBackground: true });
  }

  await browser.close();

  await server.close();
})();
