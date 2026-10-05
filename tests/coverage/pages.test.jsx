import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RoundTracker from "@/components/RoundTracker";
import Charters from "@/components/pages/games/ChartersPage";
import TileManifest from "@/components/pages/games/TileManifestPage";
import TileSheet from "@/components/pages/games/TilesPage";
import B18Tiles from "@/components/pages/games/b18/B18TilesPage";

import { games } from "@/data";
import defaults from "@/defaults.json";
import { getTileSheetContext } from "@/util/tiles/tilesheet";

import { renderApp } from "@tests/support/helpers.jsx";
import {
  all,
  attr,
  drawSvg,
  mountElement,
  one,
} from "@tests/support/render.jsx";

const withTiles = (tiles) => ({ ...games["18Test"], tiles });

// The sheet position (index) each tile id was drawn at
const tilePositions = (root, layout) => {
  const c = getTileSheetContext(layout, defaults.paper, defaults.tiles.width);
  const scale = c.hexWidth / 150;
  return Object.fromEntries(
    all(root, "g[clip-path][transform^='translate']").map((g) => {
      const transform = g.getAttribute("transform");
      const index = Array.from({ length: c.perPage }).findIndex(
        (_, i) =>
          transform === `translate(${c.getX(i)} ${c.getY(i)}) scale(${scale})`,
      );
      // Ids are drawn bottom right of each hex
      return [one(g, "text").textContent, index];
    }),
  );
};

describe("tile sheet", () => {
  const straight = (side) => ({
    color: "yellow",
    track: [{ type: "straight", side }],
  });

  it("rotates die tiles so track lines up with the tile above", async () => {
    const { root } = await mountElement(<TileSheet />, {
      game: withTiles({
        1: straight(1),
        2: straight(3),
        3: straight(2),
        4: { color: "yellow", track: [{ type: "offboard", side: 2 }] },
        5: straight(1),
        6: straight(1),
      }),
    });
    expect(
      attr(root, "g[clip-path][transform^='translate'] > g", "transform"),
    ).toEqual([
      "rotate(0)",
      "rotate(60)",
      "rotate(120)",
      "rotate(120)",
      "rotate(60)",
      "rotate(60)",
    ]);
    // Bleed is clipped where a column of the die meets another tile
    expect(
      attr(root, "g[clip-path][transform^='translate']", "clip-path"),
    ).toEqual([
      "url(#hexBleedClipPathDieTop)",
      "url(#hexBleedClipPathDie)",
      "url(#hexBleedClipPathDie)",
      "url(#hexBleedClipPathDie)",
      "url(#hexBleedClipPathDie)",
      "url(#hexBleedClipPathDieBottom)",
    ]);
  });

  it("lets tiles override their clip path and rotation", async () => {
    const { root } = await mountElement(<TileSheet />, {
      game: withTiles({
        1: { color: "yellow", clipPath: false, rotation: 240 },
      }),
    });
    const tile = one(root, "g[clip-path][transform^='translate']");
    expect(tile).toHaveAttribute("clip-path", "url(#hexClipPath)");
    expect(one(tile, "g")).toHaveAttribute("transform", "rotate(240)");
  });

  it("groups tiles by color, gauge and group with gaps between", async () => {
    const { root } = await mountElement(<TileSheet />, {
      game: withTiles({
        1: { color: "grey" },
        2: { color: "gray" },
        3: { color: "green", group: "special" },
        4: { color: "green", group: "special" },
        5: {
          color: "brown",
          track: [
            { type: "straight", gauge: "narrow" },
            { type: "straight", side: 2 },
          ],
        },
        6: { color: "brown", group: "individual" },
      }),
    });
    const positions = tilePositions(root, "die");
    // grey and gray share a group
    expect(Math.abs(positions[1] - positions[2])).toBe(1);
    expect(positions[4] - positions[3]).toBe(1);
    // Mixed gauge and individual tiles stand alone, separated by gaps
    expect(positions).toEqual({ 1: 0, 2: 1, 3: 3, 4: 4, 5: 6, 6: 8 });
  });

  it("packs groups together without gaps", async () => {
    const { root } = await mountElement(<TileSheet />, {
      game: withTiles({
        1: { color: "yellow" },
        2: { color: "green" },
        3: { color: "brown" },
      }),
      config: { tiles: { gaps: false } },
    });
    expect(tilePositions(root, "die")).toEqual({ 1: 0, 2: 1, 3: 2 });
  });

  it("starts transparent die tiles on a new page", async () => {
    const { root } = await mountElement(<TileSheet />, {
      game: withTiles({
        1: { color: "yellow" },
        2: { color: "none" },
      }),
    });
    const pages = all(root, ".TileSheet--Page");
    expect(pages).toHaveLength(2);
    expect(one(pages[1], "text")).toHaveTextContent("2");
  });
});

describe("tile manifest", () => {
  it("skips tiles it cannot find and places tiles by color", async () => {
    const { root } = await mountElement(<TileManifest />, {
      game: withTiles({
        1: { color: "gray" },
        "2|a": { color: "yellow", quantity: 3 },
        nope: 2,
      }),
    });
    const tiles = all(root, ".TileManifest--Tile");
    expect(tiles.map((t) => one(t, ".TileManifest--Id").textContent)).toEqual([
      "1",
      "2 (a)",
      "nope",
    ]);
    expect(tiles.map((t) => t.style.gridColumn)).toEqual([
      "4 / span 1",
      "1 / span 1",
      "4 / span 1",
    ]);
    expect(one(tiles[1], ".TileManifest--Quantity")).toHaveTextContent("3x");
  });
});

describe("tokens page", () => {
  it("lays out tokens on the gsp sheet", async () => {
    renderApp("/games/18Test/tokens?print=true&config.tokens.layout=gsp");
    const [page] = await screen.findAllByTestId("game-18Test-tokens");
    const positions = attr(page, "svg > g", "transform");
    // 12 per row, 64 apart, centered on the 8in wide usable page
    expect(positions.slice(0, 2)).toEqual([
      "translate(48 45)",
      "translate(112 45)",
    ]);
    expect(positions[12]).toBe("translate(48 105)");
  });

  it("prints reversed market tokens per company as configured", async () => {
    const count = async (reverse) => {
      const { unmount } = renderApp(
        `/games/18Test/tokens?print=true&config.tokens.reverseMarketTokens=${reverse}`,
      );
      const pages = await screen.findAllByTestId("game-18Test-tokens");
      const tokens = pages.flatMap((page) => all(page, "svg > g")).length;
      unmount();
      return tokens;
    };
    const none = await count("none");
    // 18Test companies have one market token each, so "one" is all of them
    expect(await count("one")).toBe(none + games["18Test"].companies.length);
    expect(await count("all")).toBe(none + games["18Test"].companies.length);
  });

  it("stacks the pages of the sheet in the pan and zoom editor", async () => {
    const count = async (path, selector) => {
      const { unmount } = renderApp(path);
      const pages = await screen.findAllByTestId("game-18Test-tokens");
      const tokens = pages.flatMap((page) => all(page, selector)).length;
      unmount();
      return tokens;
    };
    const printed = await count(
      "/games/18Test/tokens?print=true",
      ":scope > svg > g",
    );
    expect(printed).toBeGreaterThan(0);
    expect(await count("/games/18Test/tokens", "#editor > svg > g > g")).toBe(
      printed,
    );
  });
});

describe("round tracker", () => {
  const rounds = games["18Test"].rounds;
  const positions = (svg) =>
    attr(svg, "g > g[transform^='translate']", "transform");

  it("lays row-reverse trackers out right to left", async () => {
    const svg = await drawSvg(
      <RoundTracker rounds={rounds} size={50} type="row-reverse" />,
    );
    // Cells are 70 wide so the first round is last
    expect(positions(svg)).toEqual([
      "translate(245 42.5)",
      "translate(175 42.5)",
      "translate(105 42.5)",
      "translate(35 42.5)",
    ]);
  });

  it("lays col trackers out top to bottom", async () => {
    const svg = await drawSvg(
      <RoundTracker rounds={rounds} size={50} type="col" />,
    );
    expect(positions(svg)).toEqual([
      "translate(35 42.5)",
      "translate(35 127.5)",
      "translate(35 212.5)",
      "translate(35 297.5)",
    ]);
    // Arrows join each round to the next
    expect(all(svg, "line")).toHaveLength(3);
  });

  it("lays col-reverse trackers out bottom to top", async () => {
    const svg = await drawSvg(
      <RoundTracker rounds={rounds} size={50} type="col-reverse" />,
    );
    expect(positions(svg)[0]).toBe("translate(35 297.5)");
  });

  it("lays round trackers out in a rotated circle", async () => {
    const svg = await drawSvg(
      <RoundTracker rounds={rounds} size={50} type="round" rotation={90} />,
    );
    const [x, y] = /translate\(([^ ]+) ([^)]+)\)/
      .exec(positions(svg)[0])
      .slice(1)
      .map(Number);
    // Rotated a quarter turn the first round is on the right
    expect(x).toBeCloseTo(75, 5);
    expect(y).toBeCloseTo(0, 5);
    // Round trackers loop, so every round gets an arrow
    expect(all(svg, "line")).toHaveLength(4);
  });

  it("stacks unknown tracker types", async () => {
    const svg = await drawSvg(
      <RoundTracker
        rounds={[{ name: "A" }, { name: "B", small: true }]}
        size={60}
        type="pile"
      />,
    );
    expect(positions(svg)).toEqual(["translate(0 0)", "translate(0 0)"]);
    // Small rounds are a third of the size instead of half
    const outlines = all(svg, "circle[fill='none']");
    expect(outlines.map((c) => c.getAttribute("r"))).toEqual(["30", "20"]);
  });
});

describe("b18 tiles", () => {
  const renderB18 = (info = {}) =>
    mountElement(<B18Tiles />, {
      game: {
        ...withTiles({
          1: { color: "yellow", rotations: [0, 120] },
          2: { color: "yellow", rotations: 2 },
          3: { color: "green" },
        }),
        info: { ...games["18Test"].info, ...info },
      },
      path: "/games/:slug/b18/tiles/:color",
      url: "/games/test/b18/tiles/yellow",
    });

  it("draws the listed or counted rotations of each tile in a color", async () => {
    const { root } = await renderB18();
    const tiles = all(root, ".tile");
    expect(tiles.map((t) => t.className)).toEqual([
      "tile tile-1",
      "tile tile-2",
    ]);
    // Vertical maps turn every rotation by 30
    expect(
      tiles.map((t) => attr(t, "svg > g[transform^='rotate']", "transform")),
    ).toEqual([
      ["rotate(30)", "rotate(150)"],
      ["rotate(30)", "rotate(90)"],
    ]);
    expect(one(root, ".b18")).toHaveStyle({ width: "300px" });
  });

  it("keeps rotations and widens tiles on horizontal maps", async () => {
    const { root } = await renderB18({ orientation: "horizontal" });
    const svg = one(root, ".tile svg");
    expect(svg).toHaveStyle({ width: "116px" });
    expect(svg).toHaveAttribute("viewBox", "-87.6025 -76 175.205 152");
    expect(one(svg, "g")).toHaveAttribute("transform", "rotate(0)");
  });
});

describe("charters page", () => {
  const game = {
    ...games["18Test"],
    companies: games["18Test"].companies.slice(0, 3),
  };
  const spacers = (root) =>
    all(root, ".cutlines").filter((c) => !one(c, ".charter__body"));

  it("pads half width free layouts with half width spacers", async () => {
    const { root } = await mountElement(<Charters />, {
      game,
      config: { charters: { halfWidth: true } },
    });
    // Four half width charters fit on a page, so one spacer
    const [spacer, ...rest] = spacers(root);
    expect(rest).toHaveLength(0);
    expect(spacer).toHaveClass("cutlines--half");
    expect(one(spacer, ".charter")).toHaveClass("charter--half");
  });

  it("adds no blank charter to full width free layouts", async () => {
    // An odd number of majors used to leave a blank charter before the minors
    const { root } = await mountElement(<Charters />, { game });
    expect(spacers(root)).toHaveLength(0);
  });

  it("pads die layouts with spacers", async () => {
    const { root } = await mountElement(<Charters />, {
      game: { ...game, companies: game.companies.slice(0, 2) },
      config: { charters: { layout: "3x1", halfWidth: true } },
    });
    // Three charters fit on a 3x1 page
    const [spacer, ...rest] = spacers(root);
    expect(rest).toHaveLength(0);
    expect(spacer).toHaveClass("cutlines--half");
  });
});
