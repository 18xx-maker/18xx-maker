const Handlebars = require("handlebars");
const R = require('ramda');
const converter = require('number-to-words');
const fs = require("fs");
const path = require('path');

require("@babel/register");

const gutil = require('../src/util');
const util = require('../src/render/util');

const gameDefs = require('../src/data/games').default;
const filename = process.argv[2] || "1830";
const gameDef = gameDefs[filename];
const companies = gutil.compileCompanies(gameDef);
const gmt = require('../src/data/themes/companies/gmt.json');
const rob = require('../src/data/themes/companies/rob.json');
const colors = {
  ...rob.colors,
  ...gmt.colors
};

util.setup();
util.setup18xxGame(filename);

// Build data
const template = Handlebars.compile(
  fs.readFileSync("./src/export/18xx.games.rb.hb", { encoding: "UTF8" })
);

// Takes a hex and returns the first name we can find on it
const findName = hex => {
  let possibles = [...hex.cities || [],
                   ...hex.centerTowns || [],
                   ...hex.towns || [],
                   hex.offBoardRevenue ? [hex.offBoardRevenue] : []
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

const game = {
  bank: gameDef.bank,
  currency: gameDef.info.currency.replace('#', '%d'),
  cert_limit: R.map(p => ({ player: p.number, limit: (gameDef.certLimit || p.certLimit)}), gameDef.players),
  starting_cash: R.map(p => ({ player: p.number, cash: (gameDef.capital || p.capital)}), gameDef.players),
  tiles: R.mapObjIndexed((t,id) => ({id, quantity: (t.quantity ? t.quantity : t)}), gameDef.tiles),
  location_names: findNames((gameDef.map || {}).hexes || []),
  phases: R.map(p => ({
    name: isNaN(parseInt(p.name)) ? p.name : converter.toWords(parseInt(p.name)).toUpperCase()
  }), gameDef.phases || []),
  privates: R.map(p => ({
    name: p.name,
    value: p.price,
    revenue: R.is(Array, p.revenue) ? p.revenue[0] : p.revenue,
    abbrev: p.name.replace(/[^A-Z&]/g, ''),
    description: (p.description || "").replace(/'/g, '\\\'')
  }), gameDef.privates),
  companies: R.map(c => ({
    floatPercent: c.floatPercent || gameDef.floatPercent,
    abbrev: c.abbrev,
    name: c.name,
    logo: c.logo ? `${filename}/${c.logo}` : "",
    tokens: R.map(t => ({ label: R.is(Number, t) ? t : 0 }), c.tokens),
    home: findHome(c.abbrev, ((gameDef.map || {}).hexes || [])),
    color: colors[c.color]
  }), companies),
  market: R.map(r => ({
    row: R.map(cell => ({
      value: cell ? `${cell.value ? cell.value : cell}${cell.par ? 'p' : ''}${cell.legend ? ['y', 'o', 'b'][cell.legend] : ''}` : '#{}'
    }), r)
  }), gameDef.stock.market),
  trains: R.map(t => ({
    name: t.name,
    distance: t.distance || (isNaN(parseInt(t.name)) ? 999 : parseInt(t.name)),
    price: t.price,
    rusts_on: t.rusts_on,
    num: t.quantity === "∞" ? 99 : t.quantity,
    available_on: t.available_on,
    discount: t.discount ? R.mapObjIndexed((discount, name) => ({
      name,
      discount
    }), t.discount || {}) : undefined
  }), gameDef.trains)
};

// Get proper filename
let match = filename.match(/^([0-9]*)(.*)$/);
let exportName = "g";
if (match[1] !== '') {
  exportName += `_${match[1]}`;
}
if (match[2] !== '') {
  exportName += `_${match[2].toLowerCase()}`;
}
exportName += '.rb';

console.log(`Outputing as ${exportName}`);

fs.writeFileSync(`./build/render/${filename}/18xx.games/${exportName}`,
                 template({ game, filename }),
                 { mode: "644" });
