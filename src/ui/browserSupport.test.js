import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

// The web build targets browserslist "defaults", which still has Firefox ESR
// 115 (no :has()) and Chrome 109 / Safari 15 (no color-mix()). Chrome code can
// use neither as the only way to draw a state.
const dir = import.meta.dirname;
const files = Object.fromEntries(
  readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => [f, readFileSync(path.join(dir, f), "utf8")]),
);

describe("css in src/ui for older browsers", () => {
  it("finds the css files", () => {
    expect(Object.keys(files)).toContain("Checkbox.module.css");
  });

  it.each(Object.entries(files))("%s does not use :has()", (_, css) => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/:has\(/);
  });

  // A declaration with color-mix() needs one for the same property before it,
  // which a browser without color-mix() keeps
  it.each(Object.entries(files))(
    "%s gives color-mix() a fallback",
    (_, css) => {
      const lines = css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\(\s*\n\s*/g, "(")
        .split("\n")
        .map((line) => line.trim());
      lines.forEach((line, i) => {
        const match = line.match(/^([a-z-]+): .*color-mix\(/);
        if (match) {
          expect(lines[i - 1]).toMatch(new RegExp(`^${match[1]}: `));
          expect(lines[i - 1]).not.toMatch(/color-mix\(/);
        }
      });
    },
  );
});
