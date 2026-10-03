import { findRiskyLines } from "../src/util/prBody.js";

const risky = findRiskyLines(process.env.PR_BODY || "");

if (risky.length) {
  for (const { line, text } of risky) {
    console.error(
      `::error::PR body line ${line} looks like a commit type: ${text}`,
    );
  }
  console.error(
    "release-please turns a body line that starts with `type: text` into an extra changelog entry, and GitHub wraps long lines. Put commands like `pnpm test:run` in a fenced code block or reword them (see CLAUDE.md, Commit messages).",
  );
  process.exit(1);
}
