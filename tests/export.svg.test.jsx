/* eslint-disable testing-library/no-node-access -- the svg files are parsed and read as documents */
import { screen } from "@testing-library/react";

import { uniqBy } from "ramda";

import { games } from "@/data";
import defaultConfig from "@/defaults.json";
import { FONT_ALIASES, serializeSvg } from "@/export/svg.js";
import { planExport } from "@/util/exportPlan";

import { renderApp } from "@tests/helpers.jsx";

const game = {
  ...games["18Test"],
  meta: { id: "18Test", type: "bundled", slug: "18Test" },
};

const layers = { defaultConfig, userConfig: {}, storedConfig: {} };

// The svg jobs the export plans for 18Test: a map for each variation, the
// market, par, revenue, and a tile and token of each kind
const jobs = uniqBy(
  ({ doc }) => (doc.kind === "map" ? doc.id : doc.kind),
  planExport(game, layers, { formats: ["svg"] }).jobs,
);

const parse = (text) => {
  const parsed = new DOMParser().parseFromString(text, "image/svg+xml");
  expect(parsed.querySelector("parsererror")).toBeNull();
  return parsed;
};

// What the export does in the page, on the page of a job
const exportSvg = async ({ doc }) => {
  const path = doc.route.replace(/^\/games\/[^/]+/, "/games/18Test");
  const query = new URLSearchParams({ ...doc.query, print: "true" });
  renderApp(`${path}?${query}`);
  await screen.findByTestId(
    new RegExp(`^game-18Test-(${doc.kind}|${doc.kind}-?.*)$`),
  );
  const { text, error } = serializeSvg(doc.capture.selector, FONT_ALIASES);
  return { text, error };
};

describe("svg export of 18Test", () => {
  it("plans a file for the map, market, par, revenue, tile and token", () => {
    expect(new Set(jobs.map(({ doc }) => doc.kind))).toEqual(
      new Set(["map", "market", "par", "revenue", "tile", "token"]),
    );
    expect(jobs.every(({ path }) => path.endsWith(".svg"))).toBe(true);
  });

  for (const job of jobs) {
    describe(`${job.doc.id}`, () => {
      it("is a standalone svg file without the page's styles", async () => {
        const { text, error } = await exportSvg(job);

        expect(error).toBeUndefined();
        expect(text.startsWith('<?xml version="1.0"')).toBe(true);
        const svg = parse(text).documentElement;
        expect(svg.localName).toBe("svg");
        expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg");
        expect(text).toContain('xmlns:xlink="http://www.w3.org/1999/xlink"');
        expect(parseFloat(svg.getAttribute("width"))).toBeGreaterThan(0);
        expect(parseFloat(svg.getAttribute("height"))).toBeGreaterThan(0);

        expect(text).not.toMatch(/\sclass=|\sstyle=|<style|data-/);
        expect(text).not.toContain("foreignObject");
        expect(text).not.toMatch(/var\(|currentColor/);
        expect(text).not.toMatch(/font-family="[^"]*\bdisplay\b/);
        expect(text).not.toMatch(/xmlns:xhtml/);
      });

      it("has the color of every shape written on it", async () => {
        const { text } = await exportSvg(job);

        // Colors come from classes of the page, they are attributes here
        expect(text).toMatch(/fill="rgb\(/);
      });

      it("has every id it uses", async () => {
        const { text } = await exportSvg(job);
        const parsed = parse(text);

        const ids = new Set(
          [...parsed.querySelectorAll("[id]")].map((node) => node.id),
        );
        const used = [...text.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
        for (const node of parsed.querySelectorAll("*")) {
          for (const { name, value } of node.attributes) {
            if (/href$/.test(name) && value.startsWith("#")) {
              used.push(value.slice(1));
            }
          }
        }
        expect(used.filter((id) => !ids.has(id))).toEqual([]);
      });
    });
  }

  it("keeps text as text, in real fonts, and lists them", async () => {
    const { text } = await exportSvg(
      jobs.find(({ doc }) => doc.kind === "map"),
    );

    expect(parse(text).querySelector("text")).not.toBeNull();
    expect(text).toMatch(/<!-- .*Bitter.* -->/);
    expect(text).toMatch(/font-family="[^"]*Bitter, serif"/);
  });

  it("puts the sides of a token side by side in one svg", async () => {
    const { text } = await exportSvg(
      jobs.find(({ doc }) => doc.kind === "token"),
    );

    const parsed = parse(text).documentElement;
    const nested = [...parsed.children].filter(
      (node) => node.localName === "svg",
    );
    expect(nested.length).toBeGreaterThan(1);
    expect(nested.every((node) => node.hasAttribute("x"))).toBe(true);
  });

  it("fails clearly without an svg", () => {
    document.body.innerHTML = '<div class="printElement">text</div>';

    expect(serializeSvg(".printElement", FONT_ALIASES).error).toMatch(
      /has no svg/,
    );
    expect(serializeSvg(".nothing", FONT_ALIASES).error).toMatch(
      /The page has no \.nothing/,
    );
    document.body.innerHTML = "";
  });

  it("fails clearly on a foreignObject", () => {
    document.body.innerHTML =
      '<svg id="x"><foreignObject><div>x</div></foreignObject></svg>';

    expect(serializeSvg("#x", FONT_ALIASES).error).toMatch(/foreignObject/);
    document.body.innerHTML = "";
  });
});
