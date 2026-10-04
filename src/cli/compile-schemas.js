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

  // Tokens of a game share the properties of the token component. Draft-07
  // cannot add properties to a closed object, so the variants are written out.
  const withProperties = (description, properties, required = []) => ({
    ...tiles.definitions.token,
    description,
    ...(required.length > 0 ? { required } : {}),
    properties: { ...tiles.definitions.token.properties, ...properties },
  });
  tiles = assocPath(
    ["definitions", "gameToken"],
    withProperties("A token of the game: how many to print, and the token.", {
      quantity: {
        description:
          "How many of this token to print. ∞ needs print, to say how many.",
        oneOf: [
          { type: "integer", minimum: 0 },
          { type: "string", enum: ["∞"] },
        ],
      },
      print: {
        description: "How many of this token to print, overrides quantity.",
        type: "integer",
        minimum: 0,
      },
    }),
    tiles,
  );
  tiles = assocPath(
    ["definitions", "roundToken"],
    withProperties(
      "A token on the round tracker: the round and its token.",
      {
        name: {
          description: "The name of the round, its label.",
          type: "string",
        },
        small: {
          description: "Draw the round token smaller.",
          type: "boolean",
        },
      },
      ["name"],
    ),
    tiles,
  );

  const json = JSON.stringify(tiles);
  format(json, { filepath: "tiles.defs.json" }).then((prettyJson) => {
    fs.writeFileSync(
      path.join(import.meta.dirname, "../schemas/tiles.defs.json"),
      prettyJson,
    );
  });
};
export default command;
