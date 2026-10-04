import fs from "node:fs";

import { FONT_ALIASES, serializeSvg, svgExpression } from "./svg.js";

describe("FONT_ALIASES", () => {
  const css = fs.readFileSync("src/styles/fonts.css", "utf-8");

  it("has every family fonts.css defines, with the font it falls back to", () => {
    const defined = new Set(
      [...css.matchAll(/font-family: "([^"]+)"/g)].map((m) => m[1]),
    );

    expect(new Set(Object.keys(FONT_ALIASES))).toEqual(defined);
    for (const [alias, { family }] of Object.entries(FONT_ALIASES)) {
      // The family is one of the local() names of the alias
      const block = css
        .split("@font-face")
        .find((face) => face.includes(`font-family: "${alias}"`));
      expect(block).toContain(`local("${family} Regular")`);
    }
  });
});

describe("svgExpression", () => {
  it("calls the function of the page with the selector and the aliases", () => {
    const expression = svgExpression('.a"b');

    expect(expression.startsWith("(function serializeSvg(")).toBe(true);
    expect(expression).toContain('(".a\\"b", {');
    expect(expression).toContain('"display":{"family":"Bitter"');
  });

  it("is plain javascript: a function that stands alone", () => {
    expect(() => new Function(`return ${svgExpression(".x")}`)).not.toThrow();
    expect(serializeSvg.length).toBe(2);
  });
});
