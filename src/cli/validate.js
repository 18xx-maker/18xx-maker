import fs, { globSync } from "node:fs";
import path from "node:path";
import util from "node:util";

import chalk from "chalk";
import { compileSchema, draft07 } from "json-schema-library";

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
import { UNVALIDATED_GAMES } from "../util/testGames.js";

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

// Compile each schema once, they all share the tile definitions
const compiled = {};
const compiledSchema = (id) => {
  if (!compiled[id]) {
    compiled[id] = compileSchema(schemas[id], {
      drafts: [draft07],
      remotes: [tileDefs],
    });
  }
  return compiled[id];
};

let validate = (json, file, schemaId) => {
  const id = schemaId || determineSchema(json);

  const { errors: validationErrors } = compiledSchema(id).validate(json);

  return {
    valid: validationErrors.length === 0,
    id,
    file,
    validationErrors,
  };
};

// Test games with schema errors on purpose are not checked
const isSkipped = (file) =>
  UNVALIDATED_GAMES.includes(path.basename(file, ".json")) &&
  path.basename(path.dirname(file)) === "games";

validate.file = (file, schemaId) => {
  if (isSkipped(file)) {
    return { valid: true, skipped: true, id: gameSchema.$id, file };
  }

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

  return validate(json, file, schemaId);
};

// Validates a file against the game schema, even if it does not look like one
export const validateGameFile = (file) => validate.file(file, gameSchema.$id);

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
const displayResult = ({
  valid,
  skipped,
  error,
  validationErrors,
  file,
  id,
}) => {
  const color = error
    ? chalk.red
    : skipped
      ? chalk.gray
      : valid
        ? chalk.green
        : chalk.yellow;

  const result = (
    error ? "error" : skipped ? "skip" : valid ? "valid" : "invalid"
  ).padEnd(6, " ");

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
  chain((file) => globSync(file).map((match) => path.resolve(match))),
);

const command = (files) => process.exit(processFiles(files) ? 0 : 1);
export default command;
