#!/usr/bin/env node

const fs = require("fs");

if (!fs.existsSync("./src/config.json")) {
  // Create it with an empty object
  fs.writeFileSync("./src/config.json", "{}");
}
