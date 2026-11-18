#!/usr/bin/env node
// Writes tests/timings.json, the seconds per test file that `vitest --shard`
// splits by (scripts/durationSequencer.js), from a vitest JSON report:
//
//   node scripts/test-timings.mjs report.json   # read a report
//   node scripts/test-timings.mjs               # run the suite to make one
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
let report = process.argv[2];
if (!report) {
  report = path.join(
    mkdtempSync(path.join(tmpdir(), "timings-")),
    "report.json",
  );
  execFileSync(
    "pnpm",
    ["exec", "vitest", "run", "--reporter=json", `--outputFile=${report}`],
    { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
  );
}

const timings = {};
for (const { name, startTime, endTime } of JSON.parse(
  readFileSync(report, "utf8"),
).testResults) {
  const file = path.relative(root, name).split(path.sep).join("/");
  if (!existsSync(path.join(root, file))) continue;
  timings[file] = Math.round((endTime - startTime) / 100) / 10;
}

const sorted = Object.fromEntries(
  Object.keys(timings)
    .sort()
    .map((file) => [file, timings[file]]),
);
writeFileSync(
  path.join(root, "tests/timings.json"),
  JSON.stringify(sorted, null, 2) + "\n",
);
console.log(`Wrote ${Object.keys(sorted).length} files to tests/timings.json`);
