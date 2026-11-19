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
    const body = "```shell\npnpm test:run\n```\nThe fix: is not here\nprefix:x";
    expect(lines(body)).toEqual([4]);
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

  it("flags a type anywhere in the last paragraph", () => {
    expect(lines("intro\n\nsome text\nand pnpm test:run here")).toEqual([4]);
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
