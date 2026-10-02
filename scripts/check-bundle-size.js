// Fails when the production web build (dist/site/assets) grows past the
// budget. Run `pnpm build` first. Sizes are gzip bytes of .js and .css files,
// measured on the build at the time the budget was set (see BASELINE), with
// about 10% headroom: raise a budget on purpose, in the PR that needs it.
//
// The app (everything except the data-* and logos-* chunks, which hold game
// data and logo images) is budgeted tightly so chrome and library changes
// show up. The data chunks have their own looser budget.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const dir = path.join(import.meta.dirname, "..", "dist", "site", "assets");

const BASELINE = { app: 579_919, data: 4_000_616 };
const BUDGET = { app: 640_000, data: 4_400_000 };

if (!fs.existsSync(dir)) {
  console.error(`${dir} not found, run pnpm build first`);
  process.exit(2);
}

const sizes = { app: 0, data: 0 };
for (const file of fs.readdirSync(dir)) {
  if (!/\.(js|css)$/.test(file)) continue;
  const group = /^(data|logos)-/.test(file) ? "data" : "app";
  sizes[group] += zlib.gzipSync(fs.readFileSync(path.join(dir, file))).length;
}

let failed = false;
for (const group of Object.keys(sizes)) {
  const ok = sizes[group] <= BUDGET[group];
  failed ||= !ok;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${group}: ${sizes[group]} gzip bytes ` +
      `(baseline ${BASELINE[group]}, budget ${BUDGET[group]})`,
  );
}
process.exit(failed ? 1 : 0);
