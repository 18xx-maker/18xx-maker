const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const fs = require("node:fs");

// Load Defs
const tileDefs = require("../schemas/tiles.defs.json");

// Load Schemas
const companiesSchema = require("../schemas/companies.schema.json");
const configSchema = require("../schemas/config.schema.json");
const gameSchema = require("../schemas/game.schema.json");
const publishersSchema = require("../schemas/publishers.schema.json");
const themeSchema = require("../schemas/theme.schema.json");
const tilesSchema = require("../schemas/tiles.schema.json");

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
    json = require(file);
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

module.exports = validate;
