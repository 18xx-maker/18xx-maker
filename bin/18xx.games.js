const Handlebars = require("handlebars");
const R = require('ramda');
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
util.setupGame(filename);

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
  let named = R.find(p => p.name, possibles);
  if (named) {
    return named.name.name;
  }
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

const game = {
  bank: gameDef.bank,
  currency: gameDef.info.currency.replace('#', '%d'),
  cert_limit: R.map(p => ({ player: p.number, limit: (gameDef.certLimit || p.certLimit)}), gameDef.players),
  starting_cash: R.map(p => ({ player: p.number, cash: (gameDef.capital || p.capital)}), gameDef.players),
  tiles: R.mapObjIndexed((t,id) => ({id, quantity: (t.quantity ? t.quantity : t)}), gameDef.tiles),
  location_names: findNames((gameDef.map || {}).hexes || []),
  privates: R.map(p => ({
    name: p.name,
    value: p.price,
    revenue: p.revenue,
    abbrev: p.name.replace(/[^A-Z&]/g, ''),
    description: p.description.replace(/'/g, '\\\'')
  }), gameDef.privates),
  companies: R.map(c => ({
    abbrev: c.abbrev,
    name: c.name,
    logo: c.logo ? `${filename}/${c.logo}` : "",
    tokens: R.map(t => ({ label: R.is(Number, t) ? t : 0 }), c.tokens),
    color: colors[c.color]
  }), companies),
  market: R.map(r => ({
    row: R.map(cell => ({
      value: cell ? `${cell.value ? cell.value : cell}${cell.par ? 'p' : ''}${cell.legend ? ['y', 'o', 'b'][cell.legend] : ''}` : '-'
    }), r)
  }), gameDef.stock.market)
};

fs.writeFileSync(`./build/render/${filename}/g_${filename}.rb`,
                 template({ game, filename }),
                 { mode: "644" });
