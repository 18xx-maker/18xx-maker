#!/usr/bin/env node

const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const map = require("ramda/src/map");
const path = require("path");

let mapFiles = glob.sync("*.json", { cwd: "./src/data/themes/maps" });
let companyFiles = glob.sync("*.json", { cwd: "./src/data/themes/companies" });

let companies = map(file => {
  let dir = path.dirname(file);
  let name = path.basename(file, ".json");
  let object = name.replace(/[-\.]/g, '_');

  return { name, file, dir, object };
}, companyFiles);

let maps = map(file => {
  let dir = path.dirname(file);
  let name = path.basename(file, ".json");
  let object = name.replace(/[-\.]/g, '_');

  return { name, file, dir, object };
}, mapFiles);

const template = Handlebars.compile(
  fs.readFileSync("./src/data/themes/index.js.hb", { encoding: "UTF8" })
);

fs.writeFileSync("./src/data/themes/maps/index.js",
                 template({ themes: maps }),
                 { mode: "644" });
fs.writeFileSync("./src/data/themes/companies/index.js",
                 template({ themes: companies }),
                 { mode: "644" });
