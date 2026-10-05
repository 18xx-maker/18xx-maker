import { describe, expect, it } from "vitest";

import gameStats from "@/util/gameStats";

const defs = {
  1: { color: "yellow", track: [{ type: "straight", side: 1 }] },
  2: {
    color: "green",
    track: [{ type: "straight", side: 1, gauge: "narrow" }],
  },
};

describe("gameStats", () => {
  it("handles an empty game", () => {
    expect(gameStats({}, defs)).toEqual({
      tiles: { total: 0, colors: [] },
      gauges: [],
      map: { variations: 0, hexes: 0, sizes: [] },
      companies: { total: 0, major: 0, minor: 0 },
      privates: 0,
      trains: { types: 0, total: 0 },
      phases: 0,
      rounds: 0,
    });
  });

  it("counts tiles by color in color order, skipping unknown tiles", () => {
    const stats = gameStats({ tiles: { 2: 3, 1: 2, "1|a": 1, nope: 4 } }, defs);
    expect(stats.tiles.total).toBe(6);
    expect(stats.tiles.colors).toEqual([
      { color: "yellow", types: 2, total: 3 },
      { color: "green", types: 1, total: 3 },
    ]);
  });

  it("combines tile and map gauges", () => {
    const stats = gameStats(
      {
        tiles: { 1: 2, 2: 1 },
        map: {
          hexes: [
            {
              color: "yellow",
              hexes: ["A1", "A3"],
              track: [{ type: "straight", side: 1, gauge: "narrow" }],
            },
            {
              color: "yellow",
              hexes: ["B2"],
              track: [{ type: "straight", side: 1 }],
            },
          ],
        },
      },
      defs,
    );
    expect(stats.gauges).toEqual([
      { gauge: "normal", count: 3 },
      { gauge: "narrow", count: 3 },
    ]);
    expect(stats.map).toEqual({
      variations: 1,
      hexes: 3,
      sizes: [{ width: 3, height: 2 }],
    });
  });

  it("hides gauges when all track is normal", () => {
    expect(gameStats({ tiles: { 1: 2 } }, defs).gauges).toEqual([]);
  });

  it("counts map variations", () => {
    const stats = gameStats(
      { map: [{ hexes: [{ color: "white", hexes: ["A1"] }] }, { copy: 0 }] },
      defs,
    );
    expect(stats.map.variations).toBe(2);
    expect(stats.map.sizes).toHaveLength(2);
  });

  it("counts companies, privates, trains, phases and rounds", () => {
    const stats = gameStats(
      {
        companies: [{ minor: true }, {}, {}],
        privates: [{}, {}],
        trains: [{ quantity: 3 }, {}],
        phases: [{}],
        rounds: [{}, {}],
      },
      defs,
    );
    expect(stats.companies).toEqual({ total: 3, major: 2, minor: 1 });
    expect(stats.privates).toBe(2);
    expect(stats.trains).toEqual({ types: 2, total: 4 });
    expect(stats.phases).toBe(1);
    expect(stats.rounds).toBe(2);
  });
});
