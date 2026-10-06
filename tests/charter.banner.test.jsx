import "@/styles/shell.css";
import "@/styles/page-elements.css";
import "@/styles/charter.css";
import "@/styles/market.css";
import "@/styles/cutlines.css";
import "@/styles/footer.css";
import "@/styles/print-pages.css";
import "@/styles/charter-traincards.css";
import "@/styles/card.css";

import { describe, expect, it } from "vitest";

import Charter from "@/components/Charter";
import charterCss from "@/components/charterCss";

import { games } from "@/data";
import { getCharterData } from "@/util";

import { all, mountElement, one } from "@tests/support/render.jsx";

// Needs the print stylesheet for the layout assertions
describe("Charter banner", () => {
  const company = games["18Test"].companies.find((c) => c.abbrev === "BRR");
  const props = {
    name: "Blue Railroad",
    color: "blue",
    tokens: [0, 40],
    trains: [],
    phases: [{ name: "2" }],
    turns: [{ name: "Ordered", steps: ["First"], ordered: true }],
  };
  const size = (minor, halfWidth) =>
    `.charter, .charter__body { height: ${minor ? 3 : 4.75}in; width: ${halfWidth ? 3.5 : 7.5}in; }`;

  it("prints the banner text and marks the charter", async () => {
    const { root } = await mountElement(
      <Charter {...props} company={{ ...company, banner: "SYSTEM" }} />,
    );
    expect(one(root, ".charter__banner")).toHaveTextContent("SYSTEM");
    expect(one(root, ".charter").className).toContain("charter--banner");
  });

  it("prints nothing without a banner", async () => {
    const { root } = await mountElement(
      <Charter {...props} company={{ ...company, banner: undefined }} />,
    );
    expect(all(root, ".charter__banner")).toHaveLength(0);
    expect(one(root, ".charter").className).not.toContain("charter--banner");
  });

  it.each([
    ["full", false, false, []],
    ["minor", true, false, []],
    ["half width", false, true, []],
    ["half width with loans", false, true, [10, 20, 30, 40, 50, 60, 70, 80]],
    ["full with loans", false, false, [10, 20, 30, 40, 50, 60, 70, 80]],
  ])(
    "sits at the bottom, clear of the contents (%s)",
    async (_, minor, halfWidth, loans) => {
      const { root } = await mountElement(
        <>
          <style>{size(minor, halfWidth)}</style>
          <Charter
            {...props}
            minor={minor}
            halfWidth={halfWidth}
            company={{ ...company, banner: "SYSTEM", loans, minor }}
          />
        </>,
      );
      const charter = one(root, ".charter").getBoundingClientRect();
      const strip = one(root, ".charter__banner").getBoundingClientRect();
      // It bleeds 0.125in past the cut on each side, like the header
      expect(strip.width).toBeCloseTo(charter.width + 24, 0);
      expect(strip.bottom).toBeCloseTo(charter.bottom + 12, 0);
      expect(strip.top).toBeGreaterThan(charter.top);
      for (const sel of [
        ".charter__trains",
        ".charter__treasury",
        ".charter__assets",
        ".charter__loans",
      ]) {
        for (const el of all(root, sel)) {
          // Content must not reach into the strip
          const box = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const bottom = box.bottom - parseFloat(style.paddingBottom || "0");
          const clear = sel === ".charter__loans" ? box.bottom : bottom;
          expect(clear).toBeLessThanOrEqual(strip.top + 0.5);
        }
      }
      for (const el of all(root, "dl")) {
        const dl = el.getBoundingClientRect();
        expect(
          dl.bottom - parseFloat(getComputedStyle(el).paddingBottom),
        ).toBeLessThanOrEqual(strip.top + 0.5);
      }
    },
  );

  it("keeps the size of the charter", async () => {
    const withBanner = await mountElement(
      <Charter {...props} company={{ ...company, banner: "SYSTEM" }} />,
    );
    const a = one(withBanner.root, ".charter").getBoundingClientRect();
    const without = await mountElement(
      <Charter {...props} company={company} />,
    );
    const b = one(without.root, ".charter").getBoundingClientRect();
    expect(a.height).toBeCloseTo(b.height, 1);
    expect(a.width).toBeCloseTo(b.width, 1);
  });

  it("lifts the variant above the strip", async () => {
    const { root } = await mountElement(
      <>
        <style>{size(false, false)}</style>
        <Charter
          {...props}
          variant="blue"
          company={{ ...company, banner: "SYSTEM" }}
        />
      </>,
    );
    const strip = one(root, ".charter__banner").getBoundingClientRect();
    const variant = one(root, ".charter__variant").getBoundingClientRect();
    expect(variant.bottom).toBeLessThanOrEqual(strip.top + 0.5);
  });

  it.each([
    [12.5, 0],
    [30, 0],
    [30, 2],
  ])(
    "reaches the edge of the bleed (bleed %s, border %s)",
    async (bleed, border) => {
      const data = getCharterData(
        { layout: "free", cutlines: 10, bleed, border },
        { width: 850, height: 1100, margins: 25 },
      );
      const { root } = await mountElement(
        <>
          <style>{charterCss(data, true)}</style>
          <Charter {...props} company={{ ...company, banner: "SYSTEM" }} />
        </>,
      );
      const edge = one(root, ".charter__bleed").getBoundingClientRect();
      const strip = one(root, ".charter__banner").getBoundingClientRect();
      expect(strip.left).toBeCloseTo(edge.left, 0);
      expect(strip.right).toBeCloseTo(edge.right, 0);
      expect(strip.bottom).toBeCloseTo(edge.bottom, 0);
    },
  );

  it("has dark text on a white company, with the border of the header", async () => {
    const { root } = await mountElement(
      <Charter
        {...props}
        color="white"
        company={{ ...company, color: "white", banner: "MINOR" }}
      />,
    );
    const strip = one(root, ".charter__banner");
    const style = getComputedStyle(strip);
    expect(style.borderTopWidth).toBe("2px");
    expect(style.borderTopColor).toBe("rgb(0, 0, 0)");
    expect(style.color).not.toBe("rgb(255, 255, 255)");
  });
});
