import { spawnSync } from "node:child_process";
import path from "node:path";

import { loadExportData, loadGameConfig } from "#cli/export";
import { loadGame } from "#cli/util";
import { documents } from "#export/documents";
import { exportJobs } from "#export/names";

const data = { ...loadExportData(), slug: "18Test" };

const list = (changes = {}, configChanges) => {
  const game = { ...loadGame("18Test"), ...changes };
  const config = configChanges
    ? { ...loadGameConfig(game), ...configChanges }
    : loadGameConfig(game);
  return documents(game, config, data);
};

const ids = (docs) => docs.map((doc) => doc.id);
const byId = (docs, id) => docs.find((doc) => doc.id === id);

describe("documents", () => {
  const docs = list();

  it("lists the pdf documents in print order", () => {
    expect(
      docs
        .filter((doc) => doc.formats.includes("pdf") && doc.mode !== "item")
        .map((doc) => doc.basename),
    ).toEqual([
      "background",
      "cards-miniEuroDie",
      "charters",
      "map",
      "map-paginated",
      "market",
      "market-paginated",
      "par",
      "par-paginated",
      "revenue",
      "revenue-paginated",
      "tile-manifest",
      "tiles-die",
      "tokens",
    ]);
  });

  it("gives every document a unique id", () => {
    expect(new Set(ids(docs)).size).toBe(docs.length);
  });

  it("has the route and query of the page", () => {
    expect(byId(docs, "map/paginated")).toMatchObject({
      kind: "map",
      route: "/games/18Test/map",
      query: { paginated: "true" },
      mode: "paginated",
      formats: ["pdf"],
      size: null,
    });
    expect(byId(docs, "tiles/26|T2").route).toBe("/games/18Test/tiles/26%7CT2");
  });

  it("uses the slug in the routes", () => {
    const game = loadGame("18Test");
    const other = documents(game, loadGameConfig(game), {
      ...data,
      slug: "render:18Test",
    });
    expect(
      other.every((doc) => doc.route.startsWith("/games/render:18Test/")),
    ).toBe(true);
  });

  it("has png sizes in inches for single documents and elements", () => {
    expect(byId(docs, "background")).toMatchObject({
      formats: ["pdf", "png"],
      size: { widthIn: 8, heightIn: 10.5 },
      capture: {
        selector: ".printElement",
        viewport: null,
        transparent: false,
      },
    });
    expect(byId(docs, "market").size.widthIn).toBeCloseTo(13.4);
    expect(byId(docs, "tiles/1")).toMatchObject({
      mode: "item",
      formats: ["png"],
      size: { widthIn: 2, heightIn: 2 },
      capture: { transparent: true },
    });
    expect(byId(docs, "tokens/0").size).toEqual({
      widthIn: 2.4,
      heightIn: 0.6,
    });
    expect(byId(docs, "tokens/20").size).toEqual({
      widthIn: 1.2,
      heightIn: 0.6,
    });
    expect(byId(docs, "charters/0").size.heightIn).toBe(5.25);
    // A minor charter is shorter
    expect(byId(docs, "charters/14").size.heightIn).toBe(3.5);
  });

  it("has no png for the sheets and paginated documents", () => {
    for (const id of [
      "cards:miniEuroDie",
      "charters",
      "tokens:free",
      "tiles:die",
      "map/paginated",
    ]) {
      expect(byId(docs, id).formats).toEqual(["pdf"]);
    }
    expect(byId(docs, "tile-manifest").size).toBeNull();
  });

  it("names the elements like the app does", () => {
    expect(byId(docs, "cards/number/1").basename).toBe("card-number-1");
    expect(byId(docs, "cards/private/0").basename).toBe("card-private-1");
    expect(byId(docs, "cards/train/1").basename).toBe("card-train-2-3+1");
    expect(byId(docs, "cards/share/0").basename).toBe("card-share-1-BLRR");
    expect(byId(docs, "charters/0").basename).toBe("charter-1-BLRR");
    expect(byId(docs, "tokens/0").basename).toBe("token-1-BLRR");
    expect(byId(docs, "tokens/20").basename).toBe("token-21");
    expect(byId(docs, "tiles/26|T2").basename).toBe("tile-26_T2");
  });

  it("captures a token inside of the wrapper the page has for it", () => {
    expect(byId(docs, "tokens/0").capture.selector).toBe(
      ".token .printElement",
    );
    expect(byId(docs, "cards/train/0").capture.selector).toBe(".printElement");
  });

  it("has the b18 images last", () => {
    const b18 = docs.filter((doc) => doc.formats.includes("b18"));
    expect(b18.map((doc) => doc.basename)).toEqual([
      "Map",
      "Market",
      "Tokens",
      "Undefined",
      "Yellow",
      "Green",
      "Brown",
      "Offboard",
    ]);
    expect(docs.slice(-b18.length)).toEqual(b18);
  });
});

describe("data checks", () => {
  const kinds = (docs) => [...new Set(docs.map((doc) => doc.kind))];
  const none = {
    companies: undefined,
    map: undefined,
    players: undefined,
    privates: undefined,
    stock: undefined,
    tiles: undefined,
    tokens: undefined,
    trains: undefined,
  };

  it("only has the background and revenue without data", () => {
    expect(
      kinds(list(none).filter((doc) => !doc.formats.includes("b18"))),
    ).toEqual(["background", "revenue"]);
  });

  it("has cards for any of companies, privates, trains or players", () => {
    for (const key of ["companies", "privates", "trains", "players"]) {
      const game = { ...none, [key]: loadGame("18Test")[key] };
      expect(kinds(list(game))).toContain("cards");
    }
    expect(kinds(list(none))).not.toContain("cards");
  });

  it("has tokens for companies or extra tokens", () => {
    expect(kinds(list({ ...none, tokens: ["Round"] }))).toContain("tokens");
    expect(kinds(list({ ...none, companies: [] }))).toContain("tokens");
    expect(kinds(list(none))).not.toContain("tokens");
  });

  it("has charters for companies only", () => {
    expect(kinds(list({ ...none, tokens: ["Round"] }))).not.toContain(
      "charters",
    );
  });

  it("has the market and par when the stock has them", () => {
    const stock = loadGame("18Test").stock;
    expect(
      kinds(list({ ...none, stock: { ...stock, market: undefined } })),
    ).not.toContain("market");
    expect(
      kinds(list({ ...none, stock: { ...stock, par: undefined } })),
    ).not.toContain("par");
    expect(kinds(list({ ...none, stock }))).toEqual(
      expect.arrayContaining(["market", "par"]),
    );
  });

  it("has tile documents for the tiles of a game", () => {
    expect(kinds(list({ ...none, tiles: { 1: 1 } }))).toEqual(
      expect.arrayContaining(["tile-manifest", "tiles", "tile"]),
    );
  });

  it("does not export a token with a quantity of 0", () => {
    const docs = list({
      companies: undefined,
      tokens: [{ quantity: 0 }, "Round", { quantity: 3 }],
    });
    expect(ids(docs).filter((id) => id.startsWith("tokens/"))).toEqual([
      "tokens/0",
      "tokens/1",
    ]);
  });
});

describe("layouts", () => {
  it("has a document for each layout of the config", () => {
    const docs = list({}, { export: { allLayouts: true } });

    const cards = docs.filter((doc) => doc.kind === "cards");
    expect(cards.map((doc) => doc.basename)).toEqual(
      data.layouts.cards.map((layout) => `cards-${layout}`),
    );
    expect(cards[0].query).toEqual({
      "config.cards.layout": data.layouts.cards[0],
    });
    expect(
      docs.filter((doc) => doc.kind === "tokens").map((doc) => doc.basename),
    ).toEqual(data.layouts.tokens.map((layout) => `tokens-${layout}`));
    expect(docs.filter((doc) => doc.kind === "tiles")).toHaveLength(
      data.layouts.tiles.length,
    );
  });
});

describe("map variations", () => {
  it("has the map, and the paginated map, of each variation", () => {
    const map = loadGame("18Test").map;
    const docs = list({ map: [map, map] });

    expect(ids(docs).filter((id) => id.startsWith("map"))).toEqual([
      "map-0",
      "map-0/paginated",
      "map-1",
      "map-1/paginated",
    ]);
    expect(byId(docs, "map-1")).toMatchObject({
      query: { variation: 1 },
      variation: 1,
      basename: "map-1",
    });
    expect(byId(docs, "map-1/paginated")).toMatchObject({
      query: { paginated: "true", variation: 1 },
      basename: "map-1-paginated",
    });
  });
});

describe("sharing with the browser", () => {
  it("has the paths of exportJobs", () => {
    const jobs = exportJobs(loadGame("18Test"), list(), ["pdf", "png"]);
    expect(jobs[0]).toMatchObject({
      format: "pdf",
      path: "18test-background.pdf",
    });
    expect(jobs[1]).toMatchObject({
      format: "png",
      path: "18test-background.png",
    });
  });

  it("runs in Node without the Vite alias", () => {
    const root = path.join(import.meta.dirname, "../..");
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `await import("#export/documents"); await import("#export/b18"); await import("#export/run"); await import("#util/resolveConfig");`,
      ],
      { cwd: root, encoding: "utf-8" },
    );
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });
});
