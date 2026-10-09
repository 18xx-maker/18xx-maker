/* eslint-disable testing-library/no-node-access -- the svg files are parsed and read as documents */
import { screen } from "@testing-library/react";
import { cdp } from "vitest/browser";

import { uniqBy } from "ramda";

import { games } from "@/data";
import defaultConfig from "@/defaults.json";
import { FONT_ALIASES, serializeSvg } from "@/export/svg.js";
import { planExport } from "@/util/exportPlan";

import { renderApp } from "@tests/support/helpers.jsx";

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

  it("draws a custom logo of the game inside the file, with its colors written out", async () => {
    // The token of the second company of 18Test, which has the crest logo
    const job = planExport(game, layers, { formats: ["svg"] }).jobs.find(
      ({ doc }) => doc.id === "tokens/1",
    );
    const { text, error } = await exportSvg(job);

    expect(error).toBeUndefined();
    expect(text).toContain("M20 15h60v35");
    expect(text).not.toMatch(/custom\/|<script|\sclass=|\sstyle=/);
    const crest = parse(text).querySelector('path[d^="M20 15h60v35"]');
    // The color-main class took the light blue of the company
    // eslint-disable-next-line jest-dom/prefer-to-have-attribute -- an element of the parsed file is not an HTMLElement
    expect(crest.getAttribute("fill")).toBe("rgb(44, 141, 205)");
  });

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

  describe("of a page", () => {
    // The svg file of the element x of a page made of html and css
    const fromPage = (html, css = "") => {
      document.body.innerHTML = `<style>${css}</style>${html}`;
      const result = serializeSvg("#x", FONT_ALIASES);
      document.body.innerHTML = "";
      return result;
    };
    const svgOf = (html, css) => {
      const { text, error } = fromPage(html, css);
      expect(error).toBeUndefined();
      // A node of this page, which the matchers know
      return {
        text,
        doc: document.importNode(parse(text).documentElement, true),
      };
    };

    it("fails on an image that is not embedded, in the svg or in what it uses", () => {
      expect(
        fromPage('<svg id="x"><image href="http://a.test/b.png"/></svg>').error,
      ).toMatch(/image that is not embedded/);
      expect(
        fromPage('<svg id="x"><image href="data:text/html,x"/></svg>').error,
      ).toMatch(/not embedded/);
      expect(
        fromPage(
          `<svg style="display:none"><defs><image id="i" href="http://a.test/b.png"/></defs></svg>
           <svg id="x"><use href="#i"/></svg>`,
        ).error,
      ).toMatch(/uses an image that is not embedded/);
      expect(
        fromPage(
          `<svg style="display:none"><symbol id="i"><image xlink:href="data:image/png;base64,AAAA"/></symbol></svg>
           <svg id="x"><use href="#i"/></svg>`,
        ).error,
      ).toBeUndefined();
    });

    describe("font families", () => {
      const family = (value) =>
        svgOf(
          '<svg id="x" width="10" height="10"><text id="t">a</text></svg>',
          `#x { font-family: ${value}; }`,
        ).doc.getAttribute("font-family");

      it("replaces the alias display, and quoted serif and sans-serif", () => {
        expect(family("display, serif")).toBe("Bitter, serif");
        expect(family('"serif"')).toBe("Yrsa, serif");
        expect(family("'sans-serif'")).toBe("Lato, sans-serif");
      });

      it("keeps a generic family that is not quoted", () => {
        expect(family("serif")).toBe("serif");
        expect(family("Arial, sans-serif")).toBe("Arial, sans-serif");
      });

      it("falls back to serif when there is no generic family", () => {
        expect(family("Arial")).toBe("Arial, serif");
      });

      it("quotes a name with spaces", () => {
        expect(family('"Open Sans"')).toBe('"Open Sans", serif');
      });

      it("removes quotes and control characters from a name", () => {
        const { text, doc } = svgOf(
          '<svg id="x" width="10" height="10"><text>a</text></svg>',
          "#x { font-family: 'A\\\"B\\1 C'; }",
        );

        expect(doc).toHaveAttribute("font-family", "ABC, serif");
        expect(text).not.toContain("\u0001");
      });
    });

    it("copies what the svg uses from outside of it, and what that uses", () => {
      const { doc } = svgOf(
        `<svg style="display:none"><defs>
           <linearGradient id="g"><stop offset="0" style="stop-color: red"/></linearGradient>
           <clipPath id="c"><rect id="r" width="5" height="5"/></clipPath>
           <symbol id="s"><rect width="2" height="2" fill="url(#g)"/></symbol>
           <path id="unused" d="M0 0"/>
         </defs></svg>
         <svg id="x" width="10" height="10">
           <g clip-path="url(#c)"><use href="#s"/></g>
         </svg>`,
      );

      const ids = [...doc.querySelectorAll("[id]")].map((node) => node.id);
      expect(ids.sort()).toEqual(["c", "g", "r", "s"]);
      expect(doc.firstElementChild.localName).toBe("defs");
      expect(doc.querySelector("stop")).toHaveAttribute(
        "stop-color",
        "rgb(255, 0, 0)",
      );
    });

    it("copies a fill that links to a defined element once", () => {
      const { doc } = svgOf(
        `<svg style="display:none"><defs><pattern id="p" width="1" height="1"/></defs></svg>
         <svg id="x" width="10" height="10">
           <rect width="1" height="1" fill="url('#p')"/><rect width="1" height="1" fill="url(#p)"/>
         </svg>`,
      );

      expect(doc.querySelectorAll("#p")).toHaveLength(1);
      expect(doc.querySelector("rect")).toHaveAttribute("fill", "url(#p)");
    });

    it("hides an element that is not displayed, but not a definition", () => {
      const { doc } = svgOf(
        `<svg id="x" width="10" height="10"><defs><clipPath id="c"/></defs>
           <g class="hidden"><rect width="1" height="1"/></g></svg>`,
        ".hidden { display: none; } clipPath { display: none; }",
      );

      expect(doc.querySelector("g")).toHaveAttribute("display", "none");
      expect(doc.querySelector("clipPath")).not.toHaveAttribute("display");
    });

    it("writes a link as href and as xlink:href", () => {
      const { doc } = svgOf(
        `<svg id="x" width="10" height="10"><rect id="a" width="1" height="1"/><use href="#a"/></svg>`,
      );

      const use = doc.querySelector("use");
      expect(use).toHaveAttribute("href", "#a");
      expect(use.getAttributeNS("http://www.w3.org/1999/xlink", "href")).toBe(
        "#a",
      );
    });

    it("does not put -- in the comment of the fonts", () => {
      const { text } = svgOf(
        '<svg id="x" width="10" height="10"><text style="font-family: \'A--B\'">a</text></svg>',
      );

      const comment = text.match(/<!--(.*)-->/s)[1];
      expect(comment).toContain("A-B");
      expect(comment).not.toContain("--");
    });

    describe("transforms of the stylesheet", () => {
      it("turns around the point of a transform-origin in a transform-box", () => {
        // A box of 40 by 20 at 10, 20: its center is 30, 30
        const { doc } = svgOf(
          `<svg id="x" width="100" height="100"><g id="t" transform="rotate(30)"
            style="transform-box: fill-box; transform-origin: center">
            <rect x="10" y="20" width="40" height="20"/></g></svg>`,
        );

        expect(doc.querySelector("g")).toHaveAttribute(
          "transform",
          "translate(30 30) rotate(30) translate(-30 -30)",
        );
      });

      it("copies the transform of a stylesheet that has no attribute", () => {
        const { doc } = svgOf(
          `<svg id="x" width="100" height="100"><g class="t">
            <rect width="10" height="10"/></g></svg>`,
          ".t { transform: translate(5px, 6px); }",
        );

        expect(doc.querySelector("g")).toHaveAttribute(
          "transform",
          "matrix(1, 0, 0, 1, 5, 6)",
        );
      });

      it("does not add the origin of the viewBox to a transform attribute", () => {
        const { doc } = svgOf(
          `<svg id="x" width="100" height="100" viewBox="-50 -50 100 100"><g transform="rotate(30 5 5)">
            <rect width="10" height="10"/></g></svg>`,
        );

        expect(doc.querySelector("g")).toHaveAttribute(
          "transform",
          "rotate(30 5 5)",
        );
      });

      it("leaves a transform attribute as it is without a pivot", () => {
        const { doc } = svgOf(
          `<svg id="x" width="100" height="100"><g transform="rotate(30)">
            <rect width="10" height="10"/></g></svg>`,
        );

        expect(doc.querySelector("g")).toHaveAttribute(
          "transform",
          "rotate(30)",
        );
      });

      it("has the rotated terrain of a hex turn around its own center", async () => {
        const { text } = await exportSvg(
          jobs.find(({ doc }) => doc.kind === "map"),
        );

        const pivots = parse(text).querySelectorAll(
          "g[transform^='translate('][transform*=' rotate(']",
        );
        expect(pivots.length).toBeGreaterThan(0);
      });
    });

    describe("of unsafe content", () => {
      const unsafe = () =>
        svgOf(
          `<svg style="display:none"><defs><a id="d" href="https://evil.test" onclick="x()"><rect width="1" height="1"/></a></defs></svg>
           <svg id="x" width="10" height="10" onload="x()">
             <script>alert(1)</script>
             <rect id="a" width="1" height="1" onclick="x()" onmouseover="x()">
               <animate attributeName="x" to="5"/><set attributeName="x" to="5"/>
             </rect>
             <a href="javascript:alert(1)"><use href="https://evil.test/x.svg#a"/></a>
             <use xlink:href="http://evil.test/x.svg#a"/>
             <use href="#a"/>
             <image href="data:image/png;base64,AAAA" width="1" height="1"/>
             <use href="#d"/>
           </svg>`,
        );

      it("drops event handlers, animations and scripts", () => {
        const { text } = unsafe();

        expect(text).not.toMatch(/\son\w+=/);
        expect(text).not.toMatch(/<(script|animate|set)\b/);
        expect(text).not.toContain("alert(1)");
      });

      it("keeps only links to the file and to embedded images", () => {
        const { text, doc } = unsafe();

        expect(text).not.toMatch(/evil\.test|javascript:/);
        const links = [...doc.querySelectorAll("[href]")].map((node) =>
          node.getAttribute("href"),
        );
        expect(links.every((href) => /^(#|data:image\/)/.test(href))).toBe(
          true,
        );
        expect(links).toContain("#a");
        expect(links).toContain("data:image/png;base64,AAAA");
      });
    });

    it("removes characters that xml does not allow from the text", () => {
      const { doc } = svgOf(
        '<svg id="x" width="10" height="10"><text>a\u0001b\u000Bc\u0007d</text></svg>',
      );

      expect(doc.querySelector("text")).toHaveTextContent("abcd");
    });

    it("has the colors of the print media", async () => {
      const session = cdp();
      await session.send("Emulation.setEmulatedMedia", { media: "print" });
      try {
        const { doc } = svgOf(
          '<svg id="x" width="10" height="10"><rect class="r" width="1" height="1"/></svg>',
          ".r { fill: blue; } @media print { .r { fill: red; } }",
        );

        expect(doc.querySelector("rect")).toHaveAttribute(
          "fill",
          "rgb(255, 0, 0)",
        );
      } finally {
        await session.send("Emulation.setEmulatedMedia", { media: "" });
      }
    });
  });
});
