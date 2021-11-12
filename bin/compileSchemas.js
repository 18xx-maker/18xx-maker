const fs = require("fs");
const path = require("path");

const { assocPath, forEach, forEachObjIndexed, keys } = require("ramda");

const fields = require("../src/schemas/fields.schema.json");
let tiles = require("../src/schemas/tiles.schema.src.json");

const elements = {
  "definitions.goods.items.properties": ["text", "svg", "font", "position"],
  "definitions.labels.items.properties": ["font", "position"],
  "definitions.boomtowns.items.properties": ["position", "revenue"],
  "definitions.cities.items.properties": ["position", "revenue"],
  "definitions.companies.items.properties": ["position"],
  "definitions.divides.items.properties": ["position"],
  "definitions.companyToken.properties": ["position"],
  "definitions.genericToken.properties": ["text", "position", "font"],
  "definitions.industries.items.properties": ["position"],
  "definitions.name.properties": ["font", "position"],
  "definitions.offBoardRevenue.properties": ["position", "revenue"],
  "definitions.mediumCities.items.properties": ["position", "revenue"],
  "definitions.centerTowns.items.properties": ["position", "revenue"],
  "definitions.towns.items.properties": ["position", "revenue"],
  "definitions.shapes.items.properties": ["text", "svg", "font", "position"],
  "definitions.bridges.items.properties": ["svg", "font", "position"],
  "definitions.tunnels.items.properties": ["svg", "font", "position"],
  "definitions.terrain.items.properties": ["position"],
  "definitions.routeBonus.items.properties": ["position"],
  "definitions.icons.items.properties": ["position"],
  "definitions.track.items.properties": ["position"],
  "definitions.tunnelEntrances.items.properties": ["position"],
  "definitions.values.items.properties": ["position"],
};

forEach((path) => {
  arrayPath = path.split(".");

  forEach((type) => {
    forEachObjIndexed((field, name) => {
      tiles = assocPath([...arrayPath, name], field, tiles);
    }, fields.definitions[type].properties);
  }, elements[path]);
}, keys(elements));

fs.writeFileSync(
  path.join("src", "schemas", "tiles.schema.json"),
  JSON.stringify(tiles, null, 2)
);
