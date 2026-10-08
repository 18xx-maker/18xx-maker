import {
  ELEMENT_KEYS,
  addElement,
  addTrack,
  countOf,
  duplicateElement,
  elementAt,
  elementPoint,
  elementsOf,
  moveElement,
  normalizeSide,
  removeElement,
  removedSides,
  replaceElement,
  rotateHex,
  rotateSide,
  setElementKey,
  setHexKey,
  setTrackEnds,
  sidePoint,
  toggleRemovedBorder,
  touchesSide,
  trackBetween,
  trackEnds,
} from "@/components/hexEditor/hexModel";

const games = import.meta.glob("../../data/games/*.json", {
  eager: true,
  import: "default",
});
const tiles = import.meta.glob("../../data/tiles/*.json", {
  eager: true,
  import: "default",
});

describe("elements", () => {
  const hex = {
    color: "plain",
    mystery: { keep: true },
    track: [{ side: 1, type: "straight" }, { side: 2 }],
    cities: [{ size: 2 }],
    offBoardRevenue: { revenues: [] },
    hexes: ["A1"],
  };

  it("lists the elements in the order of the editor", () => {
    expect(elementsOf(hex).map(({ key, index }) => `${key}:${index}`)).toEqual([
      "track:0",
      "track:1",
      "cities:0",
      "offBoardRevenue:0",
    ]);
    expect(countOf(hex, "track")).toBe(2);
    expect(elementAt(hex, "cities", 0)).toEqual({ size: 2 });
    expect(elementsOf(undefined)).toEqual([]);
  });

  it("lists an element written alone", () => {
    expect(elementsOf({ cities: { size: 1 } })).toEqual([
      { key: "cities", index: 0, element: { size: 1 } },
    ]);
  });

  it("adds at the end of a list and keeps the key order", () => {
    const next = addElement(hex, "cities", { size: 1 });
    expect(next.cities).toEqual([{ size: 2 }, { size: 1 }]);
    expect(Object.keys(next)).toEqual(Object.keys(hex));
    expect(hex.cities).toHaveLength(1);
  });

  it("adds a key that the hex does not have after the others", () => {
    const next = addElement(hex, "labels", { label: "A" });
    expect(Object.keys(next).at(-1)).toBe("labels");
    expect(addElement({}, "offBoardRevenue", { rows: 1 })).toEqual({
      offBoardRevenue: { rows: 1 },
    });
  });

  it("turns an element written alone into a list when one is added", () => {
    expect(addElement({ cities: { size: 1 } }, "cities", { size: 2 })).toEqual({
      cities: [{ size: 1 }, { size: 2 }],
    });
  });

  it("sets a property of an element without anything else", () => {
    const next = setElementKey(hex, "cities", 0, "name", { name: "X" });
    expect(next.cities).toEqual([{ size: 2, name: { name: "X" } }]);
    expect(next.track).toBe(hex.track);
    expect(Object.keys(next)).toEqual(Object.keys(hex));
  });

  it("keeps the order of the properties of an element", () => {
    const one = { cities: [{ b: 1, a: 2 }] };
    expect(
      Object.keys(setElementKey(one, "cities", 0, "b", 5).cities[0]),
    ).toEqual(["b", "a"]);
  });

  it("drops a property when the value is undefined", () => {
    expect(setElementKey(hex, "track", 0, "type", undefined).track[0]).toEqual({
      side: 1,
    });
  });

  it("gives the same object back for a change that changes nothing", () => {
    expect(setElementKey(hex, "cities", 0, "size", 2)).toBe(hex);
    expect(setElementKey(hex, "cities", 0, "name", undefined)).toBe(hex);
    expect(replaceElement(hex, "cities", 0, { size: 2 })).toBe(hex);
    expect(replaceElement(hex, "cities", 5, { size: 2 })).toBe(hex);
    expect(setElementKey(hex, "cities", 5, "size", 1)).toBe(hex);
    expect(removeElement(hex, "cities", 5)).toBe(hex);
    expect(moveElement(hex, "track", 0, 0)).toBe(hex);
    expect(moveElement(hex, "track", 7, 0)).toBe(hex);
    expect(duplicateElement(hex, "track", 9)).toBe(hex);
    expect(setHexKey(hex, "color", "plain")).toBe(hex);
    expect(setHexKey(hex, "half", undefined)).toBe(hex);
    expect(rotateHex(hex, 0)).toBe(hex);
    expect(rotateHex(hex, 6)).toBe(hex);
  });

  it("does not expand a text or number element it does not change", () => {
    const short = { labels: ["A", 5], values: [3] };
    expect(setElementKey(short, "labels", 0, "color", undefined)).toBe(short);
    expect(removeElement(short, "labels", 1)).toEqual({
      labels: ["A"],
      values: [3],
    });
    expect(moveElement(short, "labels", 0, 1).labels).toEqual([5, "A"]);
    expect(duplicateElement(short, "values", 0).values).toEqual([3, 3]);
  });

  it("expands a text or number element only to set a property of it", () => {
    expect(
      setElementKey({ labels: ["A"] }, "labels", 0, "color", "red").labels,
    ).toEqual([{ label: "A", color: "red" }]);
    expect(
      setElementKey({ values: [3] }, "values", 0, "angle", 30).values,
    ).toEqual([{ value: 3, angle: 30 }]);
  });

  it("removes an element, and the list when it was the last", () => {
    expect(removeElement(hex, "track", 0).track).toEqual([{ side: 2 }]);
    const without = removeElement(hex, "cities", 0);
    expect("cities" in without).toBe(false);
    expect(Object.keys(without)).toEqual(
      Object.keys(hex).filter((key) => key !== "cities"),
    );
    expect("offBoardRevenue" in removeElement(hex, "offBoardRevenue", 0)).toBe(
      false,
    );
    expect(
      "cities" in removeElement({ cities: { size: 1 } }, "cities", 0),
    ).toBe(false);
  });

  it("keeps a list that was empty before and not emptied by an edit", () => {
    const empty = { cities: [], track: [{ side: 1 }] };
    expect(setElementKey(empty, "track", 0, "side", 1)).toBe(empty);
    expect(removeElement(empty, "track", 0).cities).toEqual([]);
    expect("track" in removeElement(empty, "track", 0)).toBe(false);
  });

  it("moves and duplicates", () => {
    expect(moveElement(hex, "track", 0, 1).track).toEqual([
      { side: 2 },
      { side: 1, type: "straight" },
    ]);
    expect(moveElement(hex, "track", 1, -4).track[0]).toEqual({ side: 2 });
    const copy = duplicateElement(hex, "track", 0);
    expect(copy.track).toHaveLength(3);
    expect(copy.track[1]).toEqual(copy.track[0]);
    expect(copy.track[1]).not.toBe(copy.track[0]);
    expect(duplicateElement(hex, "offBoardRevenue", 0)).toBe(hex);
  });

  it("sets and drops a property of the hex", () => {
    expect(setHexKey(hex, "color", "red").color).toBe("red");
    expect(setHexKey(hex, "half", "top").half).toBe("top");
    expect("color" in setHexKey(hex, "color", undefined)).toBe(false);
  });
});

describe("sides", () => {
  it("wraps the sides around", () => {
    expect(normalizeSide(7)).toBe(1);
    expect(normalizeSide(0)).toBe(6);
    expect(normalizeSide(-4)).toBe(2);
    expect(rotateSide(5, 3)).toBe(2);
  });

  it("finds the sides a track touches", () => {
    expect(trackEnds({ side: 1, type: "straight" })).toEqual([1, 4]);
    expect(trackEnds({ side: 5, type: "sharp" })).toEqual([5, 6]);
    expect(trackEnds({ side: 6, type: "gentle" })).toEqual([6, 2]);
    expect(trackEnds({ side: 3, type: "offboard" })).toEqual([3]);
    expect(trackEnds({ side: 3 })).toEqual([3]);
    expect(trackEnds({})).toEqual([]);
    expect(trackEnds(undefined)).toEqual([]);
    expect(trackEnds({ side: 9 })).toEqual([]);
    expect(touchesSide({ side: 1, type: "straight" }, 4)).toBe(true);
    expect(touchesSide({ side: 1 }, 4)).toBe(false);
  });

  it("makes the track that joins two sides, from either", () => {
    expect(trackBetween(1, 4)).toEqual({ side: 1, type: "straight" });
    expect(trackBetween(4, 1)).toEqual({ side: 4, type: "straight" });
    expect(trackBetween(1, 2)).toEqual({ side: 1, type: "sharp" });
    expect(trackBetween(2, 1)).toEqual({ side: 1, type: "sharp" });
    expect(trackBetween(1, 3)).toEqual({ side: 1, type: "gentle" });
    expect(trackBetween(3, 1)).toEqual({ side: 1, type: "gentle" });
    expect(trackBetween(6, 1)).toEqual({ side: 6, type: "sharp" });
    expect(trackBetween(1, 1)).toBeNull();
    for (const a of [1, 2, 3, 4, 5, 6]) {
      for (const b of [1, 2, 3, 4, 5, 6]) {
        if (a === b) continue;
        expect([...trackEnds(trackBetween(a, b))].sort()).toEqual(
          [a, b].sort(),
        );
      }
    }
  });

  it("changes the sides of a track and keeps the rest of it", () => {
    const track = { gauge: "narrow", side: 1, type: "straight", end: 0.5 };
    expect(setTrackEnds(track, [2, 5])).toEqual({
      gauge: "narrow",
      side: 2,
      type: "straight",
      end: 0.5,
    });
    expect(Object.keys(setTrackEnds(track, [1, 2]))).toEqual(
      Object.keys(track),
    );
    expect(setTrackEnds(track, [4]).side).toBe(4);
    expect(setTrackEnds(track, [3, 3])).toBe(track);
    expect(setTrackEnds(track, [])).toBe(track);
    expect(setTrackEnds(undefined, [1, 4])).toEqual({
      side: 1,
      type: "straight",
    });
  });

  it("adds a track between two sides", () => {
    expect(addTrack({}, 2, 5)).toEqual({
      track: [{ side: 2, type: "straight" }],
    });
    const hex = { color: "plain" };
    expect(addTrack(hex, 2, 2)).toBe(hex);
  });

  it("toggles a removed border", () => {
    const hex = { color: "plain" };
    const one = toggleRemovedBorder(hex, 3);
    expect(one.removeBorders).toEqual([3]);
    expect(toggleRemovedBorder(one, 5).removeBorders).toEqual([3, 5]);
    expect("removeBorders" in toggleRemovedBorder(one, 3)).toBe(false);
    expect(removedSides({ removeBorders: true })).toEqual([1, 2, 3, 4, 5, 6]);
    expect(
      toggleRemovedBorder({ removeBorders: true }, 2).removeBorders,
    ).toEqual([1, 3, 4, 5, 6]);
    expect(removedSides({})).toEqual([]);
  });
});

describe("rotateHex", () => {
  const hex = {
    color: "plain",
    track: [{ side: 6, type: "sharp" }],
    cities: [{ angle: 300, percent: 0.5 }, { x: 5 }],
    borders: [{ side: 5, color: "red" }],
    removeBorders: [2, 6],
    offBoardRevenue: { side: 4, name: { name: "Y" } },
    labels: [{ label: "A", angle: 0, rotation: 30 }],
    towns: { name: { name: "Z" }, side: 1 },
    hexes: ["A1"],
  };

  it("turns the sides and the angles by 60 degrees a step", () => {
    const next = rotateHex(hex, 1);
    expect(next.track).toEqual([{ side: 1, type: "sharp" }]);
    expect(next.cities[0].angle).toBe(0);
    expect(next.cities[1]).toEqual({ x: 5 });
    expect(next.borders[0].side).toBe(6);
    expect(next.removeBorders).toEqual([3, 1]);
    expect(next.offBoardRevenue.side).toBe(5);
    expect(next.labels[0]).toEqual({ label: "A", angle: 60, rotation: 30 });
    expect(next.towns.side).toBe(2);
    expect(next.hexes).toBe(hex.hexes);
    expect(Object.keys(next)).toEqual(Object.keys(hex));
  });

  it("is undone by the opposite turn", () => {
    expect(rotateHex(rotateHex(hex, 2), -2)).toEqual(hex);
    expect(rotateHex(hex, 7)).toEqual(rotateHex(hex, 1));
  });

  it("leaves other values alone", () => {
    const odd = { track: ["x"], removeBorders: true, cities: [null] };
    expect(rotateHex(odd, 1)).toBe(odd);
  });
});

describe("geometry", () => {
  it("puts side 1 at the bottom and goes on clockwise", () => {
    const close = (point, x, y) => {
      expect(point.x).toBeCloseTo(x, 3);
      expect(point.y).toBeCloseTo(y, 3);
    };
    close(sidePoint(1), 0, 75);
    close(sidePoint(2), -64.952, 37.5);
    close(sidePoint(4), 0, -75);
    close(sidePoint(1, 90), -75, 0);
    close(sidePoint(1, 0, 10), 0, 10);
  });

  it("places an element as the map does", () => {
    expect(elementPoint("cities", {}, 0)).toEqual({ x: -14, y: 0 });
    expect(elementPoint("cities", { x: 3, y: 4 }, 0)).toEqual({ x: 3, y: 4 });
    const at = elementPoint("labels", { angle: 90, percent: 1 }, 0);
    expect(at.x).toBeCloseTo(-75, 3);
    expect(at.y).toBeCloseTo(0, 3);
    const side = elementPoint("borders", { side: 1 }, 0);
    expect(side.y).toBeCloseTo(75, 3);
    const track = elementPoint("track", { side: 1, type: "straight" }, 0);
    expect(track.x).toBeCloseTo(0, 3);
    expect(track.y).toBeCloseTo(0, 3);
    expect(elementPoint("track", {}, 0)).toEqual({ x: 0, y: 0 });
    expect(elementPoint("cities", undefined, 4).y).toBe(14);
  });
});

// Opening a hex in the editor and closing it again must not change a byte of
// the game: every hex of the games and every tile, with what the editor does
// that changes nothing, or that is undone
describe("a hex the editor opened and closed", () => {
  const hexes = [
    ...Object.entries(games).flatMap(([file, game]) =>
      (Array.isArray(game.map) ? game.map : game.map ? [game.map] : []).flatMap(
        (map, m) =>
          (map.hexes ?? []).map((hex, i) => [`${file} map ${m} #${i}`, hex]),
      ),
    ),
    ...Object.entries(games).flatMap(([file, game]) =>
      Object.entries(game.tiles ?? {})
        .filter(([, tile]) => tile && typeof tile === "object")
        .map(([id, tile]) => [`${file} tile ${id}`, tile]),
    ),
    ...Object.entries(tiles).flatMap(([file, set]) =>
      Object.entries(set).map(([id, tile]) => [`${file} tile ${id}`, tile]),
    ),
  ];

  it("covers hexes", () => {
    expect(hexes.length).toBeGreaterThan(1000);
  });

  it("is the same object and the same text after no-op changes", () => {
    for (const [name, hex] of hexes) {
      const text = JSON.stringify(hex);
      let next = hex;
      for (const { key, index, element } of elementsOf(hex)) {
        next = replaceElement(next, key, index, structuredClone(element));
        if (element && typeof element === "object") {
          for (const [field, value] of Object.entries(element)) {
            next = setElementKey(next, key, index, field, value);
          }
        }
        next = moveElement(next, key, index, index);
      }
      for (const [field, value] of Object.entries(hex)) {
        next = setHexKey(next, field, value);
      }
      next = rotateHex(next, 0);
      expect([name, next === hex]).toEqual([name, true]);
      expect(JSON.stringify(next)).toBe(text);
    }
  });

  it("is the same text after adding an element and taking it away", () => {
    for (const [name, hex] of hexes) {
      const text = JSON.stringify(hex);
      for (const key of ELEMENT_KEYS) {
        if (Array.isArray(hex[key]) && hex[key].length === 0) continue;
        if (hex[key] !== undefined && !Array.isArray(hex[key])) continue;
        const added = addElement(hex, key, { side: 1 });
        const index = countOf(added, key) - 1;
        const back = removeElement(added, key, index);
        expect([name, key, JSON.stringify(back)]).toEqual([name, key, text]);
      }
    }
  });

  it("is the same text after turning all the way round", () => {
    for (const [name, hex] of hexes) {
      // A negative angle turns to the same place but is written differently
      if (/"angle":-/.test(JSON.stringify(hex))) continue;
      let next = hex;
      for (let i = 0; i < 6; i++) next = rotateHex(next, 1);
      expect([name, JSON.stringify(next)]).toEqual([name, JSON.stringify(hex)]);
    }
  });
});
