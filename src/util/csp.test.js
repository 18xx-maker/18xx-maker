import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const content = html.match(
  /http-equiv="Content-Security-Policy"\s+content="([^"]*)"/,
)[1];
const policy = Object.fromEntries(
  content
    .split(";")
    .map((d) => d.trim().split(/\s+/))
    .filter((d) => d[0])
    .map(([name, ...values]) => [name, values]),
);

describe("index.html content security policy", () => {
  it("lets the app connect to any configured play server", () => {
    expect(policy["connect-src"]).toEqual(
      expect.arrayContaining([
        "'self'",
        "https:",
        "wss:",
        "http://localhost:*",
        "ws://localhost:*",
        "http://127.0.0.1:*",
        "ws://127.0.0.1:*",
      ]),
    );
  });

  it("keeps scripts to the page's own origin", () => {
    expect(policy["script-src"]).toEqual(["'self'"]);
    expect(content).not.toContain("unsafe-eval");
    expect(policy["default-src"]).toEqual(["'self'"]);
  });
});
