const Handlebars = require("handlebars");
const R = require('ramda');
const converter = require('number-to-words');
const fs = require("fs");
const path = require('path');

const util = require('../src/render/util');

const filename = process.argv[2] || "1830";
const gamename = path.basename(filename, ".json");

const gameDef = require(path.join("..", filename));
const companies = util.compileCompanies(gameDef);

const gmt = require('../src/data/themes/companies/gmt.json');
const rob = require('../src/data/themes/companies/rob.json');
const colors = {
  ...rob.colors,
  ...gmt.colors
};

const { compileBank, compileCertLimit, compileStartingCash } = require('../src/export/data');
const { compileHex, compileColor } = require('../src/export/hex');
const { compileMarket } = require('../src/export/market');

// Build data
const template = Handlebars.compile(
  fs.readFileSync("./src/export/18xx.games.rb.hb", { encoding: "UTF8" })
);

// Takes a hex and returns the first name we can find on it
const findName = hex => {
  let possibles = [...hex.cities || [],
                   ...hex.centerTowns || [],
                   ...hex.towns || [],
                   ...(hex.offBoardRevenue ? [hex.offBoardRevenue] : [])
                  ];
  let names = R.chain(p => p.name ? [p.name.name] : [], possibles);
  return names.join(" & ");
};

// Takes a map and returns each name/hex location
const findNames = hexes => {
  return R.reduce((names, hex) => {
    let name = findName(hex);
    if (!name) {
      return names;
    }
    return [...names, { coord: hex.hexes[0], name }];
  }, [], hexes);
};

const findHome = (abbrev, hexes) => {
  let hex = R.find(hex => {
    let cities = hex.cities;

    if (!cities) {
      return false;
    }

    return R.any(city => {
      return city.companies && city.companies.includes(abbrev);
    }, cities);
  }, hexes);

  return hex && hex.hexes[0];
};


const compileHexes = hexes => {
  let compiled = {};

  hexes.forEach(hex => {
    let color = compileColor(hex);
    let encoding = compileHex(hex);
    let locations = hex.hexes;

    if (!compiled[color]) {
      compiled[color] = {};
    }

    if (!compiled[color][encoding]) {
      compiled[color][encoding] = [];
    }

    compiled[color][encoding] = R.concat(compiled[color][encoding], locations);
  });

  const templated = R.map(color => ({
    color,
    hexes: R.map(encoding => ({
      encoding,
      hexes: compiled[color][encoding]
    }), R.keys(compiled[color]))
  }), R.keys(compiled));

  return templated;
};

// Get proper filename
const match = gamename.match(/^([0-9]*)(.*)$/);
const numbers = match[1];
const words = match[2].toLowerCase();
let newFilename = numbers;
if (words !== '') {
  newFilename += `_${words}`;
}
const exportName = `g_${newFilename}.rb`;
console.log(`Outputing as ${exportName}`);

util.setup();
util.setup18xxGame(gamename, newFilename);

// Grab logos that we want to copy
const LOGO_RE = /[& ]/g;
const logos = R.chain(c => {
  return c.logo ? [{
    file: c.logo,
    name: c.abbrev.replace(LOGO_RE, '')
  }] : [];
}, companies);

const game = {
  ...compileBank(gameDef),
  ...compileCertLimit(gameDef),
  ...compileStartingCash(gameDef),
  currency: gameDef.info.currency.replace('#', '%d'),
  tiles: R.mapObjIndexed((t,id) => ({id, quantity: (t.quantity ? t.quantity : t)}), gameDef.tiles),
  location_names: findNames((gameDef.map || {}).hexes || []),
  hexes: compileHexes((gameDef.map || {}).hexes || []),
  phases: R.map(p => ({
    name: isNaN(parseInt(p.name)) ? (p.name || p.phase).toUpperCase() : converter.toWords(parseInt(p.name)).toUpperCase()
  }), gameDef.phases || []),
  privates: R.map(p => ({
    name: p.name,
    value: R.is(String, p.price) ? `'${p.price}'` : p.price,
    revenue: R.is(Array, p.revenue) ? p.revenue[0] : (p.revenue || 0),
    abbrev: p.name.replace(/[^A-Z0-9&]/g, ''),
    description: (p.description || "").replace(/'/g, '\\\'')
  }), gameDef.privates || []),
  companies: R.map(c => ({
    floatPercent: c.floatPercent || gameDef.floatPercent,
    abbrev: c.abbrev,
    name: c.name,
    logo: c.logo ? `${newFilename}/${c.abbrev.replace(LOGO_RE, '')}` : "",
    tokens: R.map(t => ({ label: R.is(Number, t) ? t : 0 }), c.tokens),
    home: findHome(c.abbrev, ((gameDef.map || {}).hexes || [])),
    color: c.color === "white" ? colors["gray"] : colors[c.color]
  }), companies),
  market: compileMarket(gameDef.stock),
  trains: R.map(t => ({
    name: t.name,
    distance: t.distance || (isNaN(parseInt(t.name)) ? 999 : parseInt(t.name)),
    price: t.price || 0,
    rusts_on: t.rusts_on,
    num: t.quantity === "∞" ? 99 : t.quantity,
    available_on: t.available_on,
    discount: t.discount ? R.mapObjIndexed((discount, name) => ({
      name,
      discount
    }), t.discount || {}) : undefined
  }), gameDef.trains)
};

// Copy logos
logos.forEach(logo => {
  fs.copyFileSync(`./src/data/logos/${logo.file}.svg`,
                  `./build/render/${gamename}/18xx.games/${newFilename}/${logo.name}.svg`);
});

fs.writeFileSync(`./build/render/${gamename}/18xx.games/${exportName}`,
                 template({ game, name: gamename }),
                 { mode: "644" });
