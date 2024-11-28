#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import util from "node:util";

import Ajv from "ajv";
import chalk from "chalk";
import { globSync } from "glob";

import { all, chain, compose, identity, map } from "ramda";

import { loadJSON, loadSchema } from "#cli/util";

const ajv = new Ajv({ allErrors: true });

// Load Defs
const tileDefs = loadSchema("tiles.defs.json");

// Load Schemas
const companiesSchema = loadSchema("companies.schema.json");
const configSchema = loadSchema("config.schema.json");
const gameSchema = loadSchema("game.schema.json");
const publishersSchema = loadSchema("publishers.schema.json");
const themeSchema = loadSchema("theme.schema.json");
const tilesSchema = loadSchema("tiles.schema.json");

// Validate and load schemas
ajv.addSchema([
  tileDefs,
  companiesSchema,
  configSchema,
  gameSchema,
  publishersSchema,
  themeSchema,
  tilesSchema,
]);

const determineSchema = (json) => {
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
  const valid = ajv.validate(id, json);

  return {
    valid,
    id,
    file,
    validationErrors: ajv.errors,
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
  let results = id.match(/([a-z]+)\.schema\.json$/);
  return results ? results[1] : id;
};

const displayResult = ({ valid, error, validationErrors, file, id }) => {
  const color = error ? chalk.red : valid ? chalk.green : chalk.yellow;

  const result = (error ? "error" : valid ? "valid" : "invalid").padEnd(7, " ");

  const name = getShortSchemaName(id).padEnd(7, " ");

  const basename = path.basename(file);
  const dirname = path.relative(process.cwd(), path.dirname(file));

  process.stdout.write(
    `${color(result)} ${chalk.cyan(name)} ${basename} ${chalk.gray(dirname)}\n`,
  );

  if (error || validationErrors) {
    let output = util.inspect(error || validationErrors, {
      showHidden: false,
      depth: null,
      colors: true,
      maxArrayLength: null,
      maxStringLength: null,
    });
    process.stdout.write(`\n${output}\n\n`);
  }

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
