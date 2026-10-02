import { loadExportData, loadGameConfig } from "#cli/export";
import { loadGame } from "#cli/util";
import { b18Images, b18Spec } from "#export/b18";

const data = { ...loadExportData(), slug: "18Test" };
const options = { id: "18Test", version: "1.0", author: "Pat" };

const spec = (changes = {}, extra = {}) => {
  const game = { ...loadGame("18Test"), ...changes };
  return b18Spec(game, loadGameConfig(game), data, { ...options, ...extra });
};

describe("b18Spec", () => {
  it("names the box and its files after the id and version", () => {
    const { names, images, json } = spec();

    expect(names.folder).toBe("board18-18Test-1.0");
    expect(json).toMatchObject({
      bname: "18Test",
      version: "1.0",
      author: "Pat",
    });
    expect(images.map((image) => image.path)).toEqual(
      images.map(
        (image) => `board18-18Test-1.0/18Test-1.0/${image.basename}.png`,
      ),
    );
  });

  it("captures at one pixel per unit in print media", () => {
    const { images } = spec();
    const map = images.find((image) => image.kind === "b18-map");

    expect(map).toMatchObject({
      formats: ["b18"],
      route: "/games/18Test/b18/map",
      query: { print: "true" },
      capture: { selector: null, transparent: false },
    });
    expect(map.capture.viewport.w).toBeGreaterThan(100);
    expect(images.find((image) => image.kind === "b18-market").route).toBe(
      "/games/18Test/market",
    );
  });

  it("makes the tokens and tiles always transparent", () => {
    const { images } = spec();
    expect(
      Object.fromEntries(
        images.map((image) => [image.basename, image.capture.transparent]),
      ),
    ).toMatchObject({
      Map: false,
      Market: false,
      Tokens: true,
      Yellow: true,
    });
  });

  it("leaves the map and market out of a game without them", () => {
    const { json, images } = spec({ map: undefined, stock: undefined });

    expect(json.board).toBeUndefined();
    expect(json.market).toBeUndefined();
    expect(images.map((image) => image.kind)).not.toEqual(
      expect.arrayContaining(["b18-map", "b18-market"]),
    );
    expect(json.tray.map((tray) => tray.type)).toContain("btok");
  });

  it("has no tile trays for a game without tiles", () => {
    const { json, images } = spec({ tiles: undefined });

    expect(json.tray.map((tray) => tray.type)).toEqual(["btok", "mtok"]);
    expect(images.map((image) => image.kind)).toEqual([
      "b18-map",
      "b18-market",
      "b18-tokens",
    ]);
  });

  it("captures a variation of the map", () => {
    const map = loadGame("18Test").map;
    const game = { ...loadGame("18Test"), map: [map, map] };
    const config = loadGameConfig(game);

    const [image] = b18Images(game, config, data, {
      slug: "18Test",
      variation: 1,
    });

    expect(image.query).toEqual({ variation: 1, print: "true" });
  });

  it("makes the tray image paths relative to the box", () => {
    const { json } = spec();
    expect(json.board.imgLoc).toBe("images/18Test-1.0/Map.png");
    expect(json.tray[0].imgLoc).toMatch(/^images\/18Test-1\.0\/\w+\.png$/);
  });
});
