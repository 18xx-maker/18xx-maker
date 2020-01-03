#!/usr/bin/env node

const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const map = require("ramda/src/map");
const path = require("path");

let files = glob.sync("**/*.svg", { cwd: "./src/data/logos" });

// Create proper data for template
let svgs = map(file => {
  let dir = path.dirname(file);
  let group = dir === "." ? undefined : dir;
  let name = path.basename(file, ".svg");

  let svg = { name, file, dir };

  if (group) {
    svg.group = group;
  }

  return svg;
}, files);

const template = Handlebars.compile(
  fs.readFileSync("./src/data/logos/index.js.hb", { encoding: "UTF8" })
);

fs.writeFileSync("./src/data/logos/index.js",
                 template({ svgs }),
                 { mode: "644" });
