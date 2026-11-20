import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { omit } from "ramda";

import electronConfig from "../electron.vite.config.js";
import { electronCsp } from "./electronCsp.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

const policyOf = (page) =>
  Object.fromEntries(
    page
      .match(/http-equiv="Content-Security-Policy"\s+content="([^"]*)"/)[1]
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .filter((d) => d[0])
      .map(([name, ...values]) => [name, values]),
  );

describe("electron renderer content security policy", () => {
  it("keeps connect-src to the page and the analytics", () => {
    expect(policyOf(electronCsp(html))["connect-src"]).toEqual([
      "'self'",
      "https://analytics.18xx-maker.com",
    ]);
  });

  it("changes nothing else of the website's policy", () => {
    const rest = (page) => omit(["connect-src"], policyOf(page));
    expect(rest(electronCsp(html))).toEqual(rest(html));
  });

  it("fails on a page without a connect-src to rewrite", () => {
    expect(() => electronCsp("<html></html>")).toThrow(/connect-src/);
  });

  it("is applied to the renderer build", async () => {
    const plugin = electronConfig.renderer.plugins
      .flat()
      .find((p) => p?.name === "electron-csp");
    expect(plugin).toBeDefined();
    expect(
      policyOf(await plugin.transformIndexHtml(html))["connect-src"],
    ).toEqual(["'self'", "https://analytics.18xx-maker.com"]);
  });
});
