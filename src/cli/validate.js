import fs from "node:fs";
import path from "node:path";
import util from "node:util";

import chalk from "chalk";
import { globSync } from "glob";
import jsl from "json-schema-library";

import {
  addIndex,
  all,
  chain,
  compose,
  forEach,
  identity,
  map,
  replace,
} from "ramda";

import { loadJSON, loadSchema } from "#cli/util";

const { Draft07 } = jsl;

// Load Defs
const tileDefs = loadSchema("tiles.defs.json");

// Load Schemas
const draftSchema = loadSchema("draft07.schema.json");
const companiesSchema = loadSchema("companies.schema.json");
const configSchema = loadSchema("config.schema.json");
const gameSchema = loadSchema("game.schema.json");
const publishersSchema = loadSchema("publishers.schema.json");
const themeSchema = loadSchema("theme.schema.json");
const tilesSchema = loadSchema("tiles.schema.json");

const jsonSchema = new Draft07();
jsonSchema.addRemoteSchema(tileDefs["$id"], tileDefs);

const schemas = {};
forEach(
  (schema) => {
    schemas[schema["$id"]] = schema;
  },
  [
    draftSchema,
    companiesSchema,
    configSchema,
    gameSchema,
    publishersSchema,
    themeSchema,
    tilesSchema,
  ],
);

const determineSchema = (json) => {
  // Schemas themselves have a "$schema" field
  if (json["$schema"]) {
    return json["$schema"];
  }

  // Games have an info object first thing
  if (json.info) {
    return gameSchema.$id;
  }

  // Theme files have a colors field
  if (json.colors) {
    return themeSchema.$id;
  }

  // Config files have a theme setting
  if (json.theme) {
    return configSchema.$id;
  }

  // Company files have a "companies" field
  if (json.companies) {
    return companiesSchema.$id;
  }

  // Publishers file will have self published
  if (json.self && json.self.name && json.self.name === "Self Published") {
    return publishersSchema.$id;
  }

  // Tiles are just collections of tiles so they are the default
  return tilesSchema.$id;
};

let validate = (json, file) => {
  const id = determineSchema(json);

  jsonSchema.setSchema(schemas[id]);
  const validationErrors = jsonSchema.validate(json);

  return {
    valid: validationErrors.length === 0,
    id,
    file,
    validationErrors,
  };
};

validate.file = (file) => {
  if (!fs.existsSync(file)) {
    return {
      valid: false,
      id: "unknown",
      file,
      error: "file not found",
    };
  }

  let json;

  try {
    json = loadJSON(file);
  } catch (err) {
    return {
      valid: false,
      id: "unknown",
      file,
      error: err.message,
    };
  }

  return validate(json, file);
};

const getShortSchemaName = (id) => {
  let draft = id.match(/json-schema\.org/);
  if (draft) {
    return "schema";
  }
  let results = id.match(/([a-z]+)\.schema\.json$/);
  return results ? results[1] : id;
};

const fixObject = replace(/`[^`]+` \(object\)/g, chalk.yellow("(object)"));
const fixArray = replace(/`[^`]+` \(array\)/g, chalk.green("(array)"));
const fixValueObject = replace(/`\{[^`]+\}`/g, chalk.yellow("(object)"));
const fixValueArray = replace(/`\[[^`]+\]`/g, chalk.green("(array)"));
const fixOther = replace(/`([^`]+)`/g, chalk.blueBright("$1"));
const displayMessage = compose(
  fixOther,
  fixValueObject,
  fixValueArray,
  fixObject,
  fixArray,
);
const displayPointer = (pointer) => {
  return chalk.magentaBright(pointer);
};
const displayErrors = (errors = [], level = 0) => {
  if (errors.length === 0) return;
  addIndex(forEach)((error, index) => {
    const padding = (chalk.white(".") + chalk.gray("...")).repeat(level);
    process.stdout.write(
      `${padding}${displayPointer(error.data.pointer)} ${displayMessage(error.message)}\n`,
    );
    displayErrors(error.data && error.data.errors, level + 1);

    if (level === 0 && index === errors.length - 1) {
      process.stdout.write("\n");
    }
  }, errors);
};
const displayResult = ({ valid, error, validationErrors, file, id }) => {
  const color = error ? chalk.red : valid ? chalk.green : chalk.yellow;

  const result = (error ? "error" : valid ? "valid" : "invalid").padEnd(6, " ");

  const name = getShortSchemaName(id).padEnd(11, " ");

  const basename = path.basename(file);
  const dirname = path.relative(process.cwd(), path.dirname(file));

  process.stdout.write(
    `${color(result)} ${chalk.cyan(name)} ${basename} ${chalk.gray(dirname)}\n`,
  );

  if (error) {
    let output = util.inspect(error, {
      showHidden: false,
      depth: null,
      colors: true,
      maxArrayLength: null,
      maxStringLength: null,
    });
    process.stdout.write(`\n${output}\n\n`);
  }

  displayErrors(validationErrors);

  return valid;
};

const processFiles = compose(
  all(identity),
  map(displayResult),
  map(validate.file),
  chain((file) => globSync(file, { posix: true, absolute: true })),
);

const command = (files) => process.exit(processFiles(files) ? 0 : 1);
export default command;
