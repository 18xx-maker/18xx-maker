import { describe, expect, it } from "vitest";

import { firstSection, gameNav } from "./gameNav";

describe("gameNav", () => {
  it("orders the sections and keys them 1 to 9 then 0", () => {
    expect(gameNav.map(({ key, section }) => [key, section])).toEqual([
      ["1", "map"],
      ["2", "market"],
      ["3", "tokens"],
      ["4", "tiles"],
      ["5", "cards"],
      ["6", "charters"],
      ["7", "par"],
      ["8", "revenue"],
      ["9", "tile-manifest"],
      ["0", "background"],
    ]);
  });

  it("starts on the map, or the market when there is no map", () => {
    const game = { map: {}, stock: { market: {} } };
    expect(firstSection(game)).toBe("map");
    expect(firstSection({ ...game, map: undefined })).toBe("market");
  });

  it("keeps the tiles page for a game without tiles, to add the first one", () => {
    const tiles = gameNav.find(({ section }) => section === "tiles");
    expect(tiles.disabled?.({})).toBeFalsy();
    const manifest = gameNav.find(({ section }) => section === "tile-manifest");
    expect(manifest.disabled({})).toBe(true);
  });
});
