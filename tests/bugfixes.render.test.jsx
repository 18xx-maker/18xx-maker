import { describe, expect, it } from "vitest";

import HexTile from "@/components/Hex";
import Boomtown from "@/components/atoms/Boomtown";
import Id from "@/components/atoms/Id";
import Private from "@/components/cards/Private";
import Train from "@/components/cards/Train";
import ParCell from "@/components/market/ParCell";
import Token from "@/components/tokens/Token";

import {
  all,
  attr,
  drawSvg,
  mountElement,
  one,
} from "@tests/coverage.render.jsx";

// Regression tests for bugs found while writing the Storybook stories

describe("Hex mountains", () => {
  const mountain = { height: 1, side: 1 };

  it("draws every mountain of a list", async () => {
    const one_ = await drawSvg(<HexTile hex={{ mountain }} />);
    const list = await drawSvg(
      <HexTile hex={{ mountain: [mountain, { ...mountain, side: 3 }] }} />,
    );

    const count = (svg) => all(svg, "path").length;
    // A single mountain in a list draws like a mountain on its own, and a
    // second one draws more
    const listOfOne = await drawSvg(<HexTile hex={{ mountain: [mountain] }} />);
    expect(count(listOfOne)).toBe(count(one_));
    expect(count(list)).toBeGreaterThan(count(one_));
  });
});

describe("Boomtown dashes", () => {
  const city = true;

  it("uses a custom dash array", async () => {
    const svg = await drawSvg(
      <Boomtown city={city} strokeDashArray="7 3" size={1} />,
    );
    expect(attr(svg, "circle", "stroke-dasharray")).toContain("7 3");
  });

  it("is solid when not dashed, whatever the dash array", async () => {
    const svg = await drawSvg(
      <Boomtown city={city} strokeDashArray="7 3" dashed={false} size={1} />,
    );
    expect(attr(svg, "circle", "stroke-dasharray")).not.toContain("7 3");
    expect(attr(svg, "circle", "stroke-dasharray")).toContain("1 0");
  });

  it("is dashed by default", async () => {
    const svg = await drawSvg(<Boomtown city={city} size={1} />);
    expect(attr(svg, "circle", "stroke-dasharray")).not.toContain("1 0");
  });
});

describe("Train notes", () => {
  it("shows a note for a train that is both phased and obsolete", async () => {
    const trains = [
      { name: "2", color: "yellow" },
      { name: "3", color: "green" },
      { name: "4", color: "brown" },
    ];
    // Both notes used the same React key, which logs an error and fails here
    const { root } = await mountElement(
      <Train
        train={{ name: "2", color: "yellow", phased: ["3"], obsolete: ["4"] }}
        trains={trains}
      />,
    );

    expect(all(root, ".train__info").map((n) => n.textContent)).toEqual([
      "Phased out by 3",
      "Obsoleted by 4",
    ]);
  });
});

describe("Private revenue", () => {
  it("separates three or more revenues without repeating a key", async () => {
    const { root } = await mountElement(
      <Private name="Private Co" price={40} revenue={[10, 20, 30]} />,
    );

    const revenue = one(root, ".private__revenue");
    expect(revenue).toHaveTextContent(/10.*\/.*20.*\/.*30/);
  });
});

describe("ParCell text", () => {
  it("anchors the text at the start unless rotated", async () => {
    const data = { width: 50, height: 30, par: { color: "yellow" } };
    const svg = await drawSvg(<ParCell cell={{ label: "90" }} data={data} />);

    expect(attr(svg, "text", "text-anchor")).toEqual(["start"]);
  });
});

describe("Tile id", () => {
  it("keeps the colorblind symbol with a display id", async () => {
    const svg = await drawSvg(<Id id="57" displayID="57a" bgColor="yellow" />, {
      search: "?config.tiles.colorblind=true",
    });
    expect(one(svg, "text")).toHaveTextContent("⏷57a");
  });
});

describe("Token star", () => {
  const starFill = (svg) => one(svg, "path[d^='m25,1']").getAttribute("fill");

  it("fills the star with its own color", async () => {
    const blue = await drawSvg(<Token label="S" color="white" star5="blue" />);
    const orange = await drawSvg(
      <Token label="S" color="white" star5="orange" />,
    );

    expect(starFill(blue)).not.toBe(starFill(orange));
  });

  it("moves the label down", async () => {
    const plain = await drawSvg(<Token label="S" color="white" />);
    const star = await drawSvg(<Token label="S" color="white" star5="blue" />);

    const y = (svg) => Number(one(svg, "text").getAttribute("y"));
    expect(y(star)).toBeGreaterThan(y(plain));
  });
});
