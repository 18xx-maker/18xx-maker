import { describe, expect, it } from "vitest";

import HexTile from "@/components/Hex";
import PageSetup from "@/components/PageSetup";
import OffBoardRevenue from "@/components/atoms/OffBoardRevenue";

import { mapThemes } from "@/data";

import {
  all,
  attr,
  drawSvg,
  mountElement,
  one,
} from "@tests/coverage.render.jsx";

const gmt = mapThemes.gmt.colors;

// Positioned elements are wrapped in a <g> with the computed transform
const positionOf = (node) => {
  let g = node;
  while (
    g &&
    !/^rotate\(\S+ \S+ \S+\) translate/.test(g.getAttribute("transform") || "")
  ) {
    g = g.parentElement;
  }
  return g.getAttribute("transform");
};

describe("Hex", () => {
  it("draws nothing without hex data", async () => {
    const svg = await drawSvg(<HexTile hex={null} />);
    expect(svg.children).toHaveLength(1); // only <defs>
  });

  it("draws offboard track with a border", async () => {
    const svg = await drawSvg(
      <HexTile hex={{ color: "offboard", offBoardTrack: [{ side: 2 }] }} />,
    );
    expect(attr(svg, "path", "d")).toEqual([
      "M8 75 L 8 85 L -8 85 L -8 75 L 0 40 Z",
      "M6 75 L 6 85 L -6 85 L -6 75 L 0 48 Z",
    ]);
    // Offboard track is filled, not stroked
    expect(all(svg, "path")[1]).toHaveAttribute("fill", gmt.track);
  });

  it("draws medium cities over their borders", async () => {
    const svg = await drawSvg(
      <HexTile hex={{ color: "yellow", mediumCities: [{}] }} />,
    );
    expect(attr(svg, "circle", "r")).toEqual(["21", "17", "12"]);
  });

  it("converts old mountain and water fields to terrain", async () => {
    const svg = await drawSvg(
      <HexTile
        hex={{
          color: "plain",
          mountain: { cost: 120 },
          water: [{ cost: 40 }, { cost: 80 }],
        }}
      />,
    );
    const costs = all(svg, "text").map((t) => t.textContent);
    expect(costs).toEqual(["$120", "$40", "$80"]);
    // Each uses its terrain icon, offset by type
    expect(
      all(svg, "svg g[transform$='scale(1)']").map((g) =>
        g.getAttribute("transform"),
      ),
    ).toEqual([
      "translate(0 -8) scale(1)",
      "translate(0 -12) scale(1)",
      "translate(0 -12) scale(1)",
    ]);
  });

  it("draws tunnel entrances over their borders", async () => {
    const svg = await drawSvg(
      <HexTile hex={{ color: "plain", tunnelEntrances: [{ size: 10 }] }} />,
    );
    expect(attr(svg, "circle", "r")).toEqual(["13", "10", "10"]);
    expect(attr(svg, "rect", "width")).toEqual(["36", "30"]);
  });

  it("draws industries and goods", async () => {
    const svg = await drawSvg(
      <HexTile
        hex={{
          color: "plain",
          industries: [{ top: "A", bottom: "B" }],
          goods: [{ text: "G" }],
        }}
      />,
    );
    expect(all(svg, "text").map((t) => t.textContent)).toEqual(["G", "A", "B"]);
    expect(one(svg, "circle[r='18']")).not.toBeNull();
  });

  it("auto positions terrain beside icons around a city", async () => {
    const svg = await drawSvg(
      <HexTile
        hex={{
          color: "plain",
          cities: [{}],
          icons: [{ type: "meat" }],
          terrain: [{ type: "mountain", cost: 60 }],
        }}
      />,
    );
    const cost = all(svg, "text").find((t) => t.textContent === "$60");
    expect(positionOf(cost)).toBe(
      "rotate(330 0 0) translate(0 52.5) rotate(-330 0 0) translate(0 0)",
    );
  });

  it("only auto positions the first value and two labels", async () => {
    const svg = await drawSvg(
      <HexTile
        hex={{
          color: "plain",
          values: [{ value: 10 }, { value: 20 }],
          labels: [{ label: "A" }, { label: "B" }, { label: "C" }],
        }}
      />,
    );
    const at = (text) =>
      positionOf(all(svg, "text").find((t) => t.textContent === text));
    expect(at("10")).toBe(
      "rotate(210 0 0) translate(0 52.5) rotate(-210 0 0) translate(0 0)",
    );
    expect(at("20")).toBe(
      "rotate(0 0 0) translate(0 0) rotate(0 0 0) translate(0 0)",
    );
    expect(at("B")).toBe(
      "rotate(270 0 0) translate(0 52.5) rotate(-270 0 0) translate(0 0)",
    );
    expect(at("C")).toBe(
      "rotate(0 0 0) translate(0 0) rotate(0 0 0) translate(0 0)",
    );
  });

  it("skips hidden elements", async () => {
    const svg = await drawSvg(
      <HexTile
        hex={{
          color: "plain",
          labels: [{ label: "Shown" }, { label: "Hidden", hidden: true }],
        }}
      />,
    );
    expect(all(svg, "text").map((t) => t.textContent)).toEqual(["Shown"]);
  });

  it("shrinks long labels", async () => {
    const svg = await drawSvg(
      <HexTile
        hex={{ color: "plain", labels: [{ label: "A very long label text" }] }}
      />,
    );
    expect(one(svg, "text")).toHaveAttribute("font-size", "12");
  });

  it("rotates orange stripes the other way from red", async () => {
    let svg = await drawSvg(<HexTile hex={{ color: "orange/red" }} />);
    let stripes = one(svg, "line").parentElement;
    expect(stripes).toHaveAttribute("transform", "rotate(60)");
    expect(one(stripes, "line")).toHaveAttribute("stroke", gmt.red);
    svg = await drawSvg(<HexTile hex={{ color: "red/orange" }} />);
    stripes = one(svg, "line").parentElement;
    expect(stripes).toHaveAttribute("transform", "rotate(-60)");
  });
});

describe("OffBoardRevenue", () => {
  it("draws phase labels above or below each revenue", async () => {
    const svg = await drawSvg(
      <OffBoardRevenue
        revenues={[
          { color: "yellow", value: 20, phase: "2", phaseColor: "red" },
          { color: "brown", value: 40, phase: "D" },
        ]}
        reverse
      />,
    );
    const phases = all(svg, "text").filter((t) =>
      ["2", "D"].includes(t.textContent),
    );
    expect(phases.map((t) => t.getAttribute("fill"))).toEqual([
      gmt.red,
      gmt.brown,
    ]);
    // Reversed revenues put the phase above
    expect(phases.map((t) => t.getAttribute("y"))).toEqual(["-20", "-20"]);
  });

  it("stacks rows downward and names the offboard", async () => {
    const svg = await drawSvg(
      <OffBoardRevenue
        rows={2}
        size={20}
        revenues={[
          { color: "yellow", revenue: 20 },
          { color: "green", cost: 30 },
        ]}
        name={{ name: "West" }}
      />,
    );
    // One fill per revenue plus a border per row
    const borders = all(svg, "rect[fill='none']");
    expect(borders.map((r) => r.getAttribute("y"))).toEqual(["-10", "16"]);
    expect(svg).toHaveTextContent("West");
  });
});

describe("PageSetup", () => {
  it("rotates per side margins for landscape pages", async () => {
    const { root } = await mountElement(
      <PageSetup
        landscape
        paper={{
          width: 850,
          height: 1100,
          margins: { top: 10, right: 20, bottom: 30, left: 40 },
        }}
      />,
    );
    expect(one(root, "style")).toHaveTextContent(/size: 11in 8\.5in;/);
    expect(one(root, "style")).toHaveTextContent(
      /margin: 0\.2in 0\.3in 0\.4in 0\.1in;/,
    );
  });

  it("uses per side margins on portrait pages", async () => {
    const { root } = await mountElement(
      <PageSetup
        paper={{
          width: 850,
          height: 1100,
          margins: { top: 10, right: 20, bottom: 30, left: 40 },
        }}
      />,
    );
    expect(one(root, "style")).toHaveTextContent(
      /margin: 0\.1in 0\.2in 0\.3in 0\.4in;/,
    );
  });
});
