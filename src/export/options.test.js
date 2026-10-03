import gameSchema from "@/schemas/game.schema.json";
import { MAX_DPI } from "./capture.js";
import {
  DEFAULTS,
  FORMATS,
  LAYOUTS,
  cleanOptions,
  layoutsOfConfig,
  resolveExportOptions,
} from "./options.js";
import { DOCS } from "./select.js";

describe("resolveExportOptions", () => {
  it("has the built in defaults without any layer", () => {
    expect(resolveExportOptions()).toEqual({
      formats: ["pdf"],
      background: "white",
      png: { dpi: 300 },
      b18: { version: "1.0" },
    });
    expect(DEFAULTS.png.dpi).toBe(MAX_DPI);
  });

  it("puts the defaults of the caller on the built in ones", () => {
    expect(
      resolveExportOptions({
        defaults: { background: "transparent", b18: { author: "Me" } },
      }),
    ).toEqual({
      formats: ["pdf"],
      background: "transparent",
      png: { dpi: 300 },
      b18: { version: "1.0", author: "Me" },
    });
  });

  it("puts the game on the defaults and the user on the game", () => {
    const game = {
      formats: ["png", "b18"],
      docs: ["map"],
      layouts: "all",
      background: "white",
      variation: 1,
      png: { dpi: 150 },
      b18: { version: "2.0", author: "Game" },
    };

    expect(resolveExportOptions({ game })).toEqual(game);
    expect(
      resolveExportOptions({
        defaults: { b18: { author: "Default" } },
        game,
        user: {
          formats: ["pdf"],
          layouts: "current",
          background: "transparent",
          png: { dpi: 72 },
          b18: { author: "User" },
        },
      }),
    ).toEqual({
      formats: ["pdf"],
      docs: ["map"],
      layouts: "current",
      background: "transparent",
      variation: 1,
      png: { dpi: 72 },
      b18: { version: "2.0", author: "User" },
    });
  });

  it("lets the user choose the background over the game", () => {
    expect(
      resolveExportOptions({
        game: { background: "transparent" },
        user: { background: "white" },
      }).background,
    ).toBe("white");
    expect(
      resolveExportOptions({ game: { background: "transparent" } }).background,
    ).toBe("transparent");
  });

  it("lets the user choose every variation over the variation of the game", () => {
    const options = resolveExportOptions({
      game: { variation: 1 },
      user: { variation: null },
    });

    expect("variation" in options).toBe(false);
  });

  it("does not let a value that is not set hide the one below", () => {
    const options = resolveExportOptions({
      game: { png: { dpi: 100 }, b18: { version: "9", author: "Game" } },
      user: {
        formats: undefined,
        layouts: undefined,
        png: { dpi: undefined },
        b18: { version: undefined, author: undefined },
      },
    });

    expect(options.formats).toEqual(["pdf"]);
    expect(options.png.dpi).toBe(100);
    expect(options.b18).toEqual({ version: "9", author: "Game" });
  });

  it("skips what is not valid, so a game that was not checked does not fail", () => {
    const options = resolveExportOptions({
      game: {
        formats: ["gif"],
        docs: ["nothing"],
        layouts: "some",
        background: "black",
        variation: -1,
        png: { dpi: 301 },
        b18: { version: "", author: 4 },
      },
    });

    expect(options).toEqual({
      formats: ["pdf"],
      background: "white",
      png: { dpi: 300 },
      b18: { version: "1.0" },
    });
  });
});

describe("cleanOptions", () => {
  it("keeps the valid options and nothing else", () => {
    expect(
      cleanOptions({
        formats: ["pdf", "pdf", "png"],
        docs: ["map", "cards"],
        extra: true,
        paginated: true,
        png: { dpi: 1, other: 1 },
      }),
    ).toEqual({
      formats: ["pdf", "png"],
      docs: ["map", "cards"],
      png: { dpi: 1 },
    });
    expect(cleanOptions(undefined)).toEqual({});
    expect(cleanOptions("pdf")).toEqual({});
    expect(cleanOptions({ png: { dpi: 300.5 } })).toEqual({});
  });
});

describe("layoutsOfConfig", () => {
  it("is the choice of a config, if it has one", () => {
    expect(layoutsOfConfig({ export: { allLayouts: true } })).toBe("all");
    expect(layoutsOfConfig({ export: { allLayouts: false } })).toBe("current");
    expect(layoutsOfConfig({ export: {} })).toBeUndefined();
    expect(layoutsOfConfig({})).toBeUndefined();
    expect(layoutsOfConfig()).toBeUndefined();
  });
});

describe("the schema of the exports field", () => {
  const { properties } = gameSchema.properties.exports;

  it("has the same values as the export code", () => {
    expect(properties.formats.items.enum).toEqual(FORMATS);
    expect(properties.docs.items.enum).toEqual(DOCS);
    expect(properties.layouts.enum).toEqual(LAYOUTS);
    expect(properties.png.properties.dpi.maximum).toBe(MAX_DPI);
  });

  it("describes every option", () => {
    const missing = [];
    const walk = (schema, at) => {
      if (!schema.description) missing.push(at);
      for (const [name, child] of Object.entries(schema.properties || {})) {
        walk(child, `${at}.${name}`);
      }
    };
    walk(gameSchema.properties.exports, "exports");
    expect(missing).toEqual([]);
  });
});
