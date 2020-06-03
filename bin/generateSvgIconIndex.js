#!/usr/bin/env node

const Handlebars = require("handlebars");
const fs = require("fs");
const glob = require("glob");
const path = require("path");

const forEach = require("ramda/src/forEach");
const map = require("ramda/src/map");

let files = glob.sync("**/*.svg", { cwd: "./src/data/icons" });

// Create proper data for template
let svgs = map((file) => {
  let dir = path.dirname(file);
  let group = dir === "." ? undefined : dir;
  let name = path.basename(file, ".svg");
  let object = name.replace(/[-\.]/g, "_");

  let svg = { name, file, dir, object };

  if (group) {
    svg.group = group;
  }

  return svg;
}, files);

const template = Handlebars.compile(
  fs.readFileSync("./src/data/icons/svg.js.hb", { encoding: "UTF8" })
);

forEach((svg) => {
  fs.writeFileSync(
    `./src/data/icons/${svg.dir}/${svg.name}.js`,
    template({ file: svg.file, name: svg.name }),
    { mode: "644" }
  );
}, svgs);

const indexTemplate = Handlebars.compile(
  fs.readFileSync("./src/data/icons/index.js.hb", { encoding: "UTF8" })
);

fs.writeFileSync("./src/data/icons/index.js", indexTemplate({ svgs }), {
  mode: "644",
});
