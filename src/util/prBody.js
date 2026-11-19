// release-please turns lines of a squash commit body into extra changelog
// entries in two places: a paragraph that starts with `type(scope)!: text`,
// and the footer, a `token: value` line that is followed only by other footer
// lines (trailers like `Co-authored-by:`, blank lines or indented
// continuations) up to the end of the message. The footer here starts at the
// last line that is neither a trailer nor indented: GitHub wraps long lines, so
// a `build:app` or `fix: x` anywhere in that line or the trailers after it can
// end up at the start of a line. A type at the start of a line before it is
// ignored (Dependabot changelogs are full of them). Fenced code blocks are left
// alone, and so are release-please's own changelog bullets (`* **test:**
// text`), which it does not re-read.
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

const STARTS = new RegExp(`^\\s*(${TYPES.join("|")})(\\([^)\\s]*\\))?!?:`);

const CHANGELOG_BULLET = /^\s*[*-]\s+\*\*[^*]+:\*\*\s/;

const TRAILER = /^(?:[\w-]+(?:\([^)]*\))?!?(?::\s|\s#)|BREAKING CHANGE:)/;

const INDENTED = /^\s/;

export const findRiskyLines = (body = "") => {
  let fenced = false;
  let first = true;
  const lines = [];
  body.split(/\r?\n/).forEach((text, i) => {
    if (/^\s*(```|~~~)/.test(text)) {
      fenced = !fenced;
      first = true;
      return;
    }
    if (fenced) return;
    if (text.trim() === "") {
      first = true;
      return;
    }
    lines.push({ line: i + 1, text, first });
    first = false;
  });
  let footer = lines.length - 1;
  while (
    footer >= 0 &&
    (TRAILER.test(lines[footer].text) || INDENTED.test(lines[footer].text))
  ) {
    footer--;
  }
  return lines
    .filter(
      ({ text, first }, i) =>
        !CHANGELOG_BULLET.test(text) &&
        ((first && STARTS.test(text)) || (i >= footer && RISKY.test(text))),
    )
    .map(({ line, text }) => ({ line, text }));
};
