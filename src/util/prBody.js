// release-please reads every line of a squash commit body and turns a line
// that starts with `type: text` into an extra changelog entry. GitHub wraps
// long lines, so a `build:app` or `fix: x` anywhere in prose can end up at the
// start of a line. Fenced code blocks are left alone, and so are release-please's
// own changelog bullets (`* **test:** text`), which it does not re-read.
export const TYPES = [
  "feat",
  "fix",
  "perf",
  "revert",
  "chore",
  "docs",
  "style",
  "refactor",
  "test",
  "build",
  "ci",
];

const RISKY = new RegExp(
  `(?<![\\w-])(${TYPES.join("|")})(\\([^)\\s]*\\))?!?:\\S*`,
);

const CHANGELOG_BULLET = /^\s*[*-]\s+\*\*[^*]+:\*\*\s/;

export const findRiskyLines = (body = "") => {
  let fenced = false;
  const found = [];
  body.split(/\r?\n/).forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return;
    }
    if (!fenced && !CHANGELOG_BULLET.test(line) && RISKY.test(line)) {
      found.push({ line: i + 1, text: line });
    }
  });
  return found;
};
