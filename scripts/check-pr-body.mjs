// Reads the body from PR_BODY (CI), or from a file: `node
// scripts/check-pr-body.mjs body.md`. With `--commit <file>` the file is a
// commit message: the subject and git's `#` comment lines are skipped.
import { readFileSync } from "node:fs";

import { findRiskyLines } from "../src/util/prBody.js";

const args = process.argv.slice(2);
const commit = args[0] === "--commit";
const file = commit ? args[1] : args[0];

let body = file ? readFileSync(file, "utf8") : process.env.PR_BODY || "";
if (commit) {
  body = body
    .split("\n")
    .map((line, i) => (i === 0 || line.startsWith("#") ? "" : line))
    .join("\n");
}

const risky = findRiskyLines(body);

if (risky.length) {
  for (const { line, text } of risky) {
    console.error(
      `::error::${commit ? "Commit" : "PR"} body line ${line} looks like a commit type: ${text}`,
    );
  }
  console.error(
    "release-please turns a body line that starts with `type: text` into an extra changelog entry, and GitHub wraps long lines. Put commands like `pnpm test:run` in a fenced code block or reword them (see CLAUDE.md, Commit messages).",
  );
  process.exit(1);
}
