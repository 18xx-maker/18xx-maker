import fs from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { format } from "prettier";

import { assocPath, forEach, forEachObjIndexed, keys } from "ramda";

import { loadJSON, loadSchema } from "#cli/util";
import { resolveSchemaKeys } from "../util/schemaKeys.js";

const command = () => {
  const fields = loadSchema("fields.schema.json");
  const tilesSrc = loadSchema("tiles.src.json");
  let tiles = { ...tilesSrc };

  const elements = {
    "definitions.goods.items.properties": [
      "text",
      "svg",
      "font",
      "position",
      "order",
    ],
    "definitions.labels.items.properties": ["font", "position", "order"],
    "definitions.boomtowns.items.properties": ["position", "order", "revenue"],
    "definitions.cities.items.properties": ["position", "order", "revenue"],
    "definitions.companies.items.properties": ["position", "order"],
    "definitions.divides.items.properties": ["position"],
    "definitions.companyToken.properties": ["position", "order"],
    "definitions.genericToken.properties": [
      "text",
      "position",
      "order",
      "font",
    ],
    "definitions.industries.items.properties": ["position", "order"],
    "definitions.name.properties": ["font", "position", "order"],
    "definitions.offBoardRevenue.properties": ["position", "order", "revenue"],
    "definitions.mediumCities.items.properties": [
      "position",
      "order",
      "revenue",
    ],
    "definitions.centerTowns.items.properties": [
      "position",
      "order",
      "revenue",
    ],
    "definitions.towns.items.properties": ["position", "order", "revenue"],
    "definitions.shapes.items.properties": [
      "text",
      "svg",
      "font",
      "position",
      "order",
    ],
    "definitions.bridges.items.properties": [
      "svg",
      "font",
      "position",
      "order",
    ],
    "definitions.tunnels.items.properties": [
      "svg",
      "font",
      "position",
      "order",
    ],
    "definitions.terrain.items.properties": ["position", "order"],
    "definitions.routeBonuses.items.properties": ["position", "order"],
    "definitions.icons.items.properties": ["position", "order"],
    "definitions.track.items.properties": ["position"],
    "definitions.tunnelEntrances.items.properties": ["position", "order"],
    "definitions.values.items.properties": ["position", "order"],
  };

  forEach((path) => {
    let arrayPath = path.split(".");

    forEach((type) => {
      // align only does something with a mid, so it needs one
      if (type === "position") {
        tiles = assocPath(
          [...arrayPath.slice(0, -1), "dependencies"],
          { align: ["mid"] },
          tiles,
        );
      }
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
    withProperties("schema.tiles.gameToken", {
      quantity: {
        description: "schema.tiles.gameToken.quantity",
        oneOf: [
          { type: "integer", minimum: 0 },
          { type: "string", enum: ["∞"] },
        ],
      },
      print: {
        description: "schema.tiles.gameToken.print",
        type: "integer",
        minimum: 0,
      },
    }),
    tiles,
  );
  tiles = assocPath(
    ["definitions", "roundToken"],
    withProperties(
      "schema.tiles.roundToken",
      {
        name: {
          description: "schema.tiles.roundToken.name",
          type: "string",
        },
        small: {
          description: "schema.tiles.roundToken.small",
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

export const LANGUAGES = ["en", "de", "zh"];
export const PUBLISHED = [
  "companies.schema.json",
  "config.schema.json",
  "game.schema.json",
  "publishers.schema.json",
  "theme.schema.json",
  "tiles.schema.json",
  "tiles.defs.json",
];

const srcDir = path.join(import.meta.dirname, "../schemas");
const localesDir = path.join(import.meta.dirname, "../locales");
const publicDir = path.join(import.meta.dirname, "../../public/schemas");

const ID = /("\$id":\s*"https:\/\/18xx-maker\.com\/schemas\/)/;

// The text of a schema file in a language. The ids of a language other than
// English point into its folder (the relative refs follow). Throws on a key
// without text.
//
// The generated tile definitions are laid out by prettier from compact json,
// so the text moves their line breaks: they are compiled again from the
// resolved schema. The other files keep the layout of their source, the keys
// are replaced in the text.
export const localizeSchemaFile = async (raw, strings, language, generated) => {
  const resolved = resolveSchemaKeys(JSON.parse(raw), strings);
  const folder = language === "en" ? "$1" : `$1${language}/`;
  if (generated) {
    return format(JSON.stringify(resolved).replace(ID, folder), {
      filepath: "schema.json",
    });
  }
  const text = raw.replace(
    /("(?:description|deprecationMessage)": )"(schema\.[\w.-]+)"/g,
    (_, name, key) => `${name}${JSON.stringify(strings[key])}`,
  );
  // A key the replacement missed would leak into the published file
  if (!isDeepStrictEqual(JSON.parse(text), resolved)) {
    throw new Error("A schema key was not replaced");
  }
  return format(text.replace(ID, folder), { filepath: "schema.json" });
};

// Every published schema in every language, English where it always was and
// the other languages in a folder of their own
export const localize = async () => {
  for (const language of LANGUAGES) {
    const strings = loadJSON(path.join(localesDir, `schema.${language}.json`));
    const folder =
      language === "en" ? publicDir : path.join(publicDir, language);
    fs.mkdirSync(folder, { recursive: true });
    for (const file of PUBLISHED) {
      const raw = fs.readFileSync(path.join(srcDir, file), "utf-8");
      fs.writeFileSync(
        path.join(folder, file),
        await localizeSchemaFile(
          raw,
          strings,
          language,
          file === "tiles.defs.json",
        ),
      );
    }
  }
};
