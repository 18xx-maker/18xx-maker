// Fails when the production web build (dist/site/assets) grows past the
// budget. Run `pnpm build` first. Sizes are gzip bytes of all .js and .css
// files, measured on the build at the time the budget was set (see BASELINE),
// with about 10% headroom: raise a budget on purpose, in the PR that needs it.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const dir = path.join(import.meta.dirname, "..", "dist", "site", "assets");

const BASELINE = { js: 4409546, css: 170989 };
const BUDGET = { js: 4850000, css: 190000 };

if (!fs.existsSync(dir)) {
  console.error(`${dir} not found, run pnpm build first`);
  process.exit(2);
}

const sizes = { js: 0, css: 0 };
for (const file of fs.readdirSync(dir)) {
  const type = path.extname(file).slice(1);
  if (!(type in sizes)) continue;
  sizes[type] += zlib.gzipSync(fs.readFileSync(path.join(dir, file))).length;
}

let failed = false;
for (const type of Object.keys(sizes)) {
  const ok = sizes[type] <= BUDGET[type];
  failed ||= !ok;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${type}: ${sizes[type]} gzip bytes ` +
      `(baseline ${BASELINE[type]}, budget ${BUDGET[type]})`,
  );
}
process.exit(failed ? 1 : 0);
