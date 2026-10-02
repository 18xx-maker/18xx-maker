import { games } from "@/data";
import defaultConfig from "@/defaults.json";
import { validateRequest } from "@/export/service.js";
import { planExport, planSingle } from "@/util/exportPlan";

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
describe("planned requests", () => {
  it("are valid for every format", () => {
    const request = planExport(game, layers(), {
      formats: ["pdf", "png", "b18"],
      b18: { version: "1.0", author: "Pat" },
    });

    expect(new Set(request.jobs.map(({ format }) => format))).toEqual(
      new Set(["pdf", "png", "b18"]),
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
