import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { breakpoints, down, up } from "./breakpoints";
import styles from "./coexistence.fixture.module.css";

// Same strings theme.breakpoints.up/down produce in MUI v6
describe("breakpoints", () => {
  it("matches the MUI theme values", () => {
    expect(breakpoints).toEqual({
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    });
  });

  it("builds up and down queries like MUI", () => {
    expect(up("sm")).toBe("(min-width:600px)");
    expect(up("lg")).toBe("(min-width:1280px)");
    expect(down("md")).toBe("(max-width:959.95px)");
  });
});

// CSS cannot share breakpoint values, so every @media width in src/ui must be
// one of the breakpoints (or one MUI would produce from them)
describe("literal media queries in src/ui", () => {
  const dir = import.meta.dirname;
  const files = Object.fromEntries(
    readdirSync(dir, { recursive: true })
      .filter((f) => f.endsWith(".css"))
      .map((f) => [`./${f}`, readFileSync(path.join(dir, f), "utf8")]),
  );
  const allowed = new Set(
    Object.values(breakpoints).flatMap((v) => [v, v - 0.05]),
  );

  it("finds the css files", () => {
    expect(Object.keys(files)).toContain("./tokens.css");
  });

  it.each(Object.entries(files))("%s only uses breakpoint widths", (_, css) => {
    const widths = [
      ...String(css).matchAll(/(?:[<>]=?|(?:min|max)-width:)\s*([\d.]+)px/g),
    ];
    widths.forEach(([, px]) => expect(allowed).toContain(Number(px)));
  });
});

// vitest runs with css: false. In the node project a CSS Module import must
// still work, but class names are not meaningful: assert roles and text.
describe("css: false", () => {
  it("does not break CSS Module imports", () => {
    expect(() => styles.chip).not.toThrow();
  });
});
