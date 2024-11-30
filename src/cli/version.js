import { readFileSync } from "node:fs";
import { join } from "node:path";

// Grab package.json to get our current version
const pkg = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../package.json"), "utf-8"),
);

export default pkg.version;
