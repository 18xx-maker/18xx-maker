// release-please turns lines of a squash commit body into extra changelog
// entries in two places: a paragraph that starts with `type(scope)!: text`,
// and the trailing footer block (a run of `token: value` lines reaching the
// end of the message, which can start in the middle of the last prose
// paragraph). GitHub appends trailers like `Co-authored-by:` as a final
// paragraph, so the footer reaches into the paragraph before them. GitHub also
// wraps long lines, so a `build:app` or `fix: x` anywhere in a footer line can
// end up at the start of a line. A type at the start of a line inside an
// earlier paragraph is ignored (Dependabot changelogs are full of them).
// Fenced code blocks are left alone, and so are release-please's own changelog
// bullets (`* **test:** text`), which it does not re-read.
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

const paragraphs = (body) => {
  let fenced = false;
  let current = null;
  const found = [];
  body.split(/\r?\n/).forEach((text, i) => {
    if (/^\s*(```|~~~)/.test(text)) {
      fenced = !fenced;
      current = null;
      return;
    }
    if (fenced) return;
    if (text.trim() === "") {
      current = null;
      return;
    }
    if (!current) found.push((current = []));
    current.push({ line: i + 1, text });
  });
  return found;
};

export const findRiskyLines = (body = "") => {
  const paras = paragraphs(body);
  let end = paras.length;
  while (end > 0 && paras[end - 1].every(({ text }) => TRAILER.test(text))) {
    end--;
  }
  const footer = new Set(paras.slice(Math.max(0, end - 1)).flat());
  return paras.flatMap((para) =>
    para.filter(
      (l, j) =>
        !CHANGELOG_BULLET.test(l.text) &&
        ((j === 0 && STARTS.test(l.text)) ||
          (footer.has(l) && RISKY.test(l.text))),
    ),
  );
};
