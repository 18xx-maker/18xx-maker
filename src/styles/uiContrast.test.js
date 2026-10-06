import { readFileSync } from "node:fs";

// The text of a deprecated field is small text: AA asks for 4.5:1 on the
// backgrounds it is shown on. The brighter --warning-foreground (icons) is not
// enough.
const css = readFileSync(new URL("./ui.css", import.meta.url), "utf8");

const block = (selector) =>
  css.slice(css.indexOf(selector), css.indexOf("}", css.indexOf(selector)));
const token = (source, name) =>
  source
    .match(new RegExp(`--${name}:\\s*([\\d.]+) ([\\d.]+)% ([\\d.]+)%`))
    .slice(1)
    .map(Number);

const luminance = ([h, s, l]) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const channel = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("warning text", () => {
  it.each([
    ["light", ":root {"],
    ["dark", ".dark {"],
  ])("has AA contrast on the %s background and muted", (_, selector) => {
    const source = block(selector);
    const text = token(source, "warning-text");
    expect(contrast(text, token(source, "background"))).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(text, token(source, "muted"))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("selected lines", () => {
  it.each([
    ["light", ":root {"],
    ["dark", ".dark {"],
  ])("keep the text readable on the %s background", (_, selector) => {
    const source = block(selector);
    const line = token(source, "line-selected");
    expect(contrast(token(source, "foreground"), line)).toBeGreaterThanOrEqual(
      4.5,
    );
    // Different from the active line and the selection
    expect(line).not.toEqual(token(source, "accent"));
  });
});
