import fs from "node:fs";
import path from "node:path";

import { format } from "prettier";

import { assocPath, forEach, forEachObjIndexed, keys } from "ramda";

import { loadSchema } from "#cli/util";

const command = () => {
  const fields = loadSchema("fields.schema.json");
  const tilesSrc = loadSchema("tiles.src.json");
  let tiles = { ...tilesSrc };

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
    "definitions.routeBonuses.items.properties": ["position"],
    "definitions.icons.items.properties": ["position"],
    "definitions.track.items.properties": ["position"],
    "definitions.tunnelEntrances.items.properties": ["position"],
    "definitions.values.items.properties": ["position"],
  };

  forEach((path) => {
    let arrayPath = path.split(".");

    forEach((type) => {
      forEachObjIndexed((field, name) => {
        tiles = assocPath([...arrayPath, name], field, tiles);
      }, fields.definitions[type].properties);
    }, elements[path]);
  }, keys(elements));

  const json = JSON.stringify(tiles);
  format(json, { filepath: "tiles.defs.json" }).then((prettyJson) => {
    fs.writeFileSync(
      path.join(import.meta.dirname, "../schemas/tiles.defs.json"),
      prettyJson,
    );
  });
};
export default command;
