const fs = require('fs');
const puppeteer = require('puppeteer');

let games = [process.argv[2] || "1830"];

// Create the output folder
try {
  fs.mkdirSync('./output');
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

  const items = ['background', 'cards', 'charters', 'map', 'map-paginated', 'tiles', 'tokens',
                 'b18/tiles/yellow', 'b18/tiles/green', 'b18/tiles/brown', 'b18/tiles/gray'];
  for(let g=0;g<games.length;g++) {
    let game = games[g];

    // Create the output folder
    try {
      fs.mkdirSync(`./output/${game}`);
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    for(let i=0;i<items.length;i++) {
      let item = items[i];
      console.log("Printing " + game + "/" + item);
      await page.goto(`http://localhost:9000/${game}/${item}`, {waitUntil: 'networkidle2'});
      await page.pdf({path: `output/${game}/${item.replace(/\//g,'-')}.pdf`, scale: 1.0, preferCSSPageSize: true});
    }
  }

  await browser.close();

  await server.close();
})();
