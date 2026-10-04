import { games } from "@/data";
import defaultConfig from "@/defaults.json";
import { DOCS } from "@/export/select.js";
import { validateRequest } from "@/export/service.js";
import {
  exportDefaults,
  exportPages,
  planExport,
  planSingle,
} from "@/util/exportPlan";

// 18Test as the app has it loaded
const game = {
  ...games["18Test"],
  meta: { id: "18Test", type: "bundled", slug: "18Test" },
};

const layers = (storedConfig = {}) => ({
  defaultConfig,
  userConfig: {},
  storedConfig,
});

const paths = (request) => request.jobs.map(({ path }) => path);

describe("planExport", () => {
  it("exports the layout of the config with current, also when the config exports every layout", () => {
    const request = planExport(game, layers({ export: { allLayouts: true } }), {
      formats: ["pdf"],
      docs: ["cards"],
      layouts: "current",
    });

    expect(paths(request)).toEqual(["18test-cards.pdf"]);
  });

  it("exports every layout with all, also when the config does not", () => {
    const request = planExport(
      game,
      layers({ export: { allLayouts: false } }),
      {
        formats: ["pdf"],
        docs: ["cards"],
        layouts: "all",
      },
    );

    expect(paths(request)).toEqual(
      expect.arrayContaining([
        "18test-cards-free.pdf",
        "18test-cards-miniEuroDie.pdf",
        "18test-cards-dtgDie.pdf",
      ]),
    );
    expect(paths(request)).not.toContain("18test-cards.pdf");
  });

  it("follows the config without a layouts choice", () => {
    const request = planExport(game, layers({ export: { allLayouts: true } }), {
      formats: ["pdf"],
      docs: ["cards"],
    });

    expect(paths(request)).toContain("18test-cards-free.pdf");
  });
});

// The renderer plans, the main process checks and runs: what is planned must be
// a request the main process takes, and survive being sent over IPC
describe("exportPages", () => {
  it("only has pages that can be exported, not the Board18 images", () => {
    expect(exportPages(game, layers()).sort()).toEqual([...DOCS].sort());
  });
});

describe("planned svg requests", () => {
  it("name an svg for each map, market, par, revenue, tile and token", () => {
    const request = planExport(game, layers(), { formats: ["svg"] });
    const names = paths(request);

    expect(names).toEqual(
      expect.arrayContaining([
        "18test-map.svg",
        "18test-market.svg",
        "18test-par.svg",
        "18test-revenue.svg",
        "18test-tile-1.svg",
        "18test-token-1-BLRR.svg",
      ]),
    );
    expect(names.every((name) => name.endsWith(".svg"))).toBe(true);
    expect(names.some((name) => /paginated|cards|charters/.test(name))).toBe(
      false,
    );
  });

  it("only have the documents asked for", () => {
    const request = planExport(game, layers(), {
      formats: ["svg"],
      docs: ["map"],
    });

    expect(paths(request)).toEqual(["18test-map.svg"]);
  });
});

describe("planned requests", () => {
  it("are valid for every format", () => {
    const request = planExport(game, layers(), {
      formats: ["pdf", "png", "svg", "b18"],
      b18: { version: "1.0", author: "Pat" },
    });

    expect(new Set(request.jobs.map(({ format }) => format))).toEqual(
      new Set(["pdf", "png", "svg", "b18"]),
    );
    expect(() => validateRequest(request)).not.toThrow();
    expect(structuredClone(request)).toEqual(request);
  });

  it.each(["pdf", "png"])("are valid for a single %s", (format) => {
    const request = planSingle(
      game,
      layers(),
      { pathname: "/games/18Test/map", search: "?variation=0" },
      format,
    );

    expect(() => validateRequest(request)).not.toThrow();
    expect(structuredClone(request)).toEqual(request);
  });
});

describe("planExport with the exports of a game", () => {
  const exporting = (exports) => ({ ...game, exports });
  const formatsOf = (request) => [
    ...new Set(request.jobs.map(({ format }) => format)),
  ];

  it("takes the options of the game over the defaults of the app", () => {
    const request = planExport(
      exporting({
        formats: ["png", "b18"],
        docs: ["map"],
        png: { dpi: 100 },
        b18: { version: "7", author: "Game" },
      }),
      layers(),
      {},
    );

    expect(formatsOf(request).sort()).toEqual(["b18", "png"]);
    expect(request.dpi).toBe(100);
    expect(request.b18.json).toMatchObject({ version: "7", author: "Game" });
    expect(paths(request)).toContain("18test-map.png");
    expect(paths(request).some((path) => path.includes("card"))).toBe(false);
  });

  it("takes what the user chose over the game", () => {
    const request = planExport(
      exporting({ formats: ["png"], docs: ["map"], png: { dpi: 100 } }),
      layers(),
      { formats: ["pdf"], docs: ["tokens"], dpi: 50 },
    );

    expect(formatsOf(request)).toEqual(["pdf"]);
    expect(request.dpi).toBe(50);
    expect(paths(request)).toEqual(["18test-tokens.pdf"]);
  });

  it("has the paginated pdf of a page that does not fit on the paper", () => {
    const options = { formats: ["pdf"], docs: ["map"] };

    expect(paths(planExport(game, layers(), options))).toEqual([
      "18test-map.pdf",
      "18test-map-paginated.pdf",
    ]);
    expect(
      paths(
        planExport(
          game,
          layers({ paper: { width: 5000, height: 5000, margins: 25 } }),
          options,
        ),
      ),
    ).toEqual(["18test-map.pdf"]);
  });

  it("layers: the config of the user over the game, a choice over both", () => {
    const options = { formats: ["pdf"], docs: ["cards"] };
    const every = (request) => paths(request).includes("18test-cards-free.pdf");

    expect(
      every(planExport(exporting({ layouts: "all" }), layers(), options)),
    ).toBe(true);
    expect(
      every(
        planExport(
          exporting({ layouts: "all" }),
          layers({ export: { allLayouts: false } }),
          options,
        ),
      ),
    ).toBe(false);
    expect(
      every(
        planExport(
          exporting({ layouts: "current" }),
          layers({ export: { allLayouts: false } }),
          { ...options, layouts: "all" },
        ),
      ),
    ).toBe(true);
  });

  it("exports only a variation of the game", () => {
    const variations = {
      ...game,
      map: [game.map, game.map],
      exports: { variation: 1, formats: ["pdf"], docs: ["map"] },
    };

    const request = planExport(variations, layers(), {});

    expect(paths(request).length).toBeGreaterThan(0);
    expect(
      request.jobs.every(
        ({ doc }) => doc.variation === undefined || doc.variation === 1,
      ),
    ).toBe(true);
  });

  it("starts the options panel with them", () => {
    const defaults = exportDefaults(
      exporting({
        formats: ["b18"],
        docs: ["map", "tiles"],
        layouts: "all",
        background: "white",
        png: { dpi: 120 },
        b18: { version: "4", author: "Game" },
      }),
      layers(),
    );

    expect(defaults).toEqual({
      formats: ["b18"],
      docs: ["map", "tiles"],
      layouts: "all",
      background: "white",
      variation: null,
      dpi: 120,
      b18: { version: "4", author: "Game" },
    });
  });

  it("starts the options panel with the defaults of the app without them", () => {
    const defaults = exportDefaults(game, layers());

    expect(defaults).toMatchObject({
      formats: ["pdf"],
      layouts: "current",
      dpi: 300,
      b18: { version: "1.0", author: expect.any(String) },
    });
    expect(defaults.docs).toEqual(exportPages(game, layers()));
  });

  it("plans the background of the game, and the one the user chooses", () => {
    const withGame = { ...game, exports: { background: "transparent" } };

    expect(planExport(game, layers(), {}).background).toBe("white");
    expect(planExport(withGame, layers(), {}).background).toBe("transparent");
    expect(
      planExport(withGame, layers(), { background: "white" }).background,
    ).toBe("white");
    expect(
      planSingle(
        withGame,
        layers(),
        { pathname: "/games/18Test/map", search: "" },
        "png",
      ).background,
    ).toBe("transparent");
  });

  // Only the map, market, par, revenue and tile manifest take the background
  it.each([
    ["map", true],
    ["market", true],
    ["par", true],
    ["revenue", true],
    ["tile-manifest", true],
    ["background", false],
    ["cards/number/1", false],
    ["charters/0", false],
    ["tokens/0", false],
    ["tiles/1", false],
  ])("gives the background to a single png of %s: %s", (page, background) => {
    const { jobs } = planSingle(
      game,
      layers(),
      { pathname: `/games/18Test/${page}`, search: "" },
      "png",
    );
    expect(jobs[0].doc.capture.background).toBe(background);
  });

  it("uses the dpi of the game for a single png", () => {
    const request = planSingle(
      exporting({ png: { dpi: 120 } }),
      layers(),
      { pathname: "/games/18Test/map", search: "" },
      "png",
    );

    expect(request.dpi).toBe(120);
  });
});

describe("planSingle", () => {
  it("names an element after its page, and shows it in render mode", () => {
    const { jobs } = planSingle(
      game,
      layers(),
      { pathname: "/games/18Test/cards/share/0", search: "" },
      "png",
    );

    expect(jobs).toEqual([
      expect.objectContaining({
        format: "png",
        path: "18test-cards-share-0.png",
        doc: expect.objectContaining({
          route: "/games/render:18Test/cards/share/0",
          query: {},
        }),
      }),
    ]);
  });
});

describe("the variation of an export", () => {
  const varied = {
    ...game,
    map: [
      { ...game.map, name: "North" },
      { ...game.map, name: "South" },
    ],
  };
  const maps = (request) =>
    paths(request).filter(
      (p) => p.includes("-map-") && !p.includes("paginated"),
    );

  it("starts as the variation of the game file, every one without it", () => {
    expect(exportDefaults(varied, layers()).variation).toBe(null);
    expect(
      exportDefaults({ ...varied, exports: { variation: 1 } }, layers())
        .variation,
    ).toBe(1);
    // A variation the game does not have
    expect(
      exportDefaults({ ...varied, exports: { variation: 5 } }, layers())
        .variation,
    ).toBe(null);
    expect(
      exportDefaults({ ...game, exports: { variation: 1 } }, layers())
        .variation,
    ).toBe(null);
  });

  it("is the one of the game file, or the one that is chosen, or every one with null", () => {
    const withFile = { ...varied, exports: { variation: 1 } };
    const options = { formats: ["pdf"], docs: ["map"] };

    expect(maps(planExport(withFile, layers(), options))).toEqual([
      "18test-map-1.pdf",
    ]);
    expect(
      maps(planExport(withFile, layers(), { ...options, variation: 0 })),
    ).toEqual(["18test-map-0.pdf"]);
    expect(
      maps(planExport(withFile, layers(), { ...options, variation: null })),
    ).toEqual(["18test-map-0.pdf", "18test-map-1.pdf"]);
  });
});
