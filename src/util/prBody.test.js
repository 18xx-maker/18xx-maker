import { describe, expect, it } from "vitest";

import { findRiskyLines } from "./prBody";

describe("findRiskyLines", () => {
  it("flags the wrapped command that broke release notes for 749", () => {
    const body = "run `pnpm build` and `pnpm\nbuild:app` pass, and so on";
    expect(findRiskyLines(body).map((l) => l.line)).toEqual([2]);
  });

  it("flags type prefixes with scope, bang or inline use", () => {
    expect(findRiskyLines("fix(ui): x")).toHaveLength(1);
    expect(findRiskyLines("feat!: x")).toHaveLength(1);
    expect(findRiskyLines("see pnpm test:run")).toHaveLength(1);
  });

  it("ignores fenced code, plain prose and similar words", () => {
    const body = "```shell\npnpm test:run\n```\nThe fix: is not here\nprefix:x";
    expect(findRiskyLines(body).map((l) => l.line)).toEqual([4]);
    expect(findRiskyLines("a fixed: thing, build-app: x")).toEqual([]);
    expect(findRiskyLines()).toEqual([]);
  });
});
