#!/usr/bin/env node
import fs from "fs";

if (!fs.existsSync("./src/config.json")) {
  // Create it with an empty object
  fs.writeFileSync("./src/config.json", "{}");
}
