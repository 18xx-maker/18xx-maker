import { describe, expect, it } from "vitest";

import { findRiskyLines } from "./prBody";

const lines = (body) => findRiskyLines(body).map((l) => l.line);

describe("findRiskyLines", () => {
  it("flags the wrapped command that broke release notes for 749", () => {
    const body = "run `pnpm build` and `pnpm\nbuild:app` pass, and so on";
    expect(lines(body)).toEqual([2]);
    expect(
      lines(
        "## Summary\n\nSome text.\n\nrun `pnpm build` and `pnpm\nbuild:app` pass",
      ),
    ).toEqual([6]);
  });

  it("flags type prefixes with scope, bang or inline use", () => {
    expect(findRiskyLines("fix(ui): x")).toHaveLength(1);
    expect(findRiskyLines("feat!: x")).toHaveLength(1);
    expect(findRiskyLines("see pnpm test:run")).toHaveLength(1);
  });

  it("ignores fenced code, plain prose and similar words", () => {
    const body = "```shell\npnpm test:run\n```\nprefix:x\nThe fix: is not here";
    expect(lines(body)).toEqual([5]);
    expect(findRiskyLines("a fixed: thing, build-app: x")).toEqual([]);
    expect(findRiskyLines()).toEqual([]);
  });

  it("ignores release-please changelog bullets", () => {
    const bullet =
      "* **test:** drop jsdom from node unit tests ([#902](https://x))";
    expect(findRiskyLines(bullet)).toEqual([]);
    expect(findRiskyLines("* test: x")).toHaveLength(1);
  });

  it("ignores a wrapped type inside a paragraph before the last", () => {
    expect(lines("para one\nfix: mid\nmore text\n\nlast para")).toEqual([]);
    expect(lines("see pnpm test:run here\n\nlast para")).toEqual([]);
  });

  it("flags a paragraph that starts with a type", () => {
    expect(lines("intro\n\nfix: x\nmore\n\nlast para")).toEqual([3]);
    expect(lines("intro\n\n  feat(ui)!: x\n\nlast para")).toEqual([3]);
  });

  it("flags a type anywhere in the last line", () => {
    expect(lines("intro\n\nsome text\nand pnpm test:run here")).toEqual([4]);
    expect(lines("intro\n\nsee pnpm test:run\nlast line")).toEqual([]);
  });

  it("passes a type mid-line followed by lines that are not trailers", () => {
    expect(lines("intro\n\n<li>x fix: thing</li>\n</ul>\n</details>")).toEqual(
      [],
    );
  });

  it("passes the Dependabot changelog shape of 1097", () => {
    const body = [
      "Bumps undici from 7.0.0 to 7.0.1.",
      "<details>",
      "<summary>Commits</summary>",
      "<ul>",
      '<li><a href="https://github.com/x/commit/39f93e1"><code>39f93e1</code></a> fix(fetch): x</li>',
      "</ul>",
      "</details>",
      "<br />",
    ].join("\n");
    expect(findRiskyLines(body)).toEqual([]);
  });

  it("flags a type in the last line before trailers", () => {
    const body =
      "intro\n\nsome text\nand pnpm test:run here\n\nSigned-off-by: a <a@b.c>\nCo-Authored-By: b <b@c.d>";
    expect(lines(body)).toEqual([4]);
  });

  it("flags a trailer-shaped type as the last line", () => {
    expect(lines("intro\n\nsome text\nfix: x")).toEqual([4]);
    expect(lines("intro\n\nsome text\nfix: x\n  more of it")).toEqual([4]);
  });

  it("ignores plain trailers", () => {
    expect(lines("intro\n\nFixes #3")).toEqual([]);
    expect(lines("intro\n\nBREAKING CHANGE: the api moved")).toEqual([]);
    expect(lines("Fixes #3\nBREAKING CHANGE: x")).toEqual([]);
  });

  it("flags the paragraph before trailing trailers", () => {
    const body =
      "intro\n\nwrapped text\nchore: oops\n\nSigned-off-by: a <a@b.c>\nCo-Authored-By: b <b@c.d>";
    expect(lines(body)).toEqual([4]);
    expect(lines("para\nfix: mid\n\nlast\n\nSigned-off-by: a <a@b.c>")).toEqual(
      [],
    );
  });

  it("passes a Dependabot changelog body", () => {
    const body = [
      "Bumps [vite](https://github.com/vitejs/vite) from 7.0.0 to 7.0.1.",
      "<details>",
      "<summary>Commits</summary>",
      "<ul>",
      '<li><a href="https://github.com/x/commit/abc"><code>abc</code></a> fix: thing</li>',
      '<li><a href="https://github.com/x/commit/def"><code>def</code></a> feat(dev): other</li>',
      "</ul>",
      "</details>",
      "<br />",
      "",
      "",
      "[![Dependabot compatibility score](https://x)](https://y)",
      "",
      "<details>",
      "<summary>Dependabot commands and options</summary>",
      "<br />",
      "",
      "- `@dependabot rebase` will rebase this PR",
      "</details>",
    ].join("\n");
    expect(findRiskyLines(body)).toEqual([]);
  });
});
