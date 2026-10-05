import {
  b18Names,
  docPath,
  exportJobs,
  fileName,
  formatFolder,
  safeName,
} from "#export/names";

describe("safeName", () => {
  it("keeps normal names", () => {
    expect(safeName("C&O")).toBe("C&O");
    expect(safeName("MÖJ")).toBe("MÖJ");
  });

  it("replaces path separators and reserved characters", () => {
    expect(safeName("A/B")).toBe("A_B");
    expect(safeName("..\\..\\evil")).toBe("__.._evil");
    expect(safeName('a:b*c?"d<e>f|g')).toBe("a_b_c_d_e_f_g");
  });

  it("does not start with a dot", () => {
    expect(safeName("..")).toBe("_");
    expect(safeName(".hidden")).toBe("_hidden");
  });

  it("takes numbers", () => {
    expect(safeName(5)).toBe("5");
  });
});

describe("fileName", () => {
  const game = { info: { title: "Shikoku: 1889" } };

  it("is the slugged title, the document and the extension", () => {
    expect(fileName(game, { basename: "map-paginated" }, "pdf")).toBe(
      "shikoku-1889-map-paginated.pdf",
    );
    expect(fileName(game, { basename: "tile-1" }, "png")).toBe(
      "shikoku-1889-tile-1.png",
    );
  });
});

describe("b18Names", () => {
  it("names the box after the game id and version", () => {
    const names = b18Names("1889", "1.0");
    expect(names).toMatchObject({
      name: "1889-1.0",
      folder: "board18-1889-1.0",
      zip: "board18-1889-1.0.zip",
      json: "board18-1889-1.0/1889-1.0.json",
    });
    expect(names.image("Map")).toBe("board18-1889-1.0/1889-1.0/Map.png");
    expect(names.imgLoc("Map")).toBe("images/1889-1.0/Map.png");
  });
});

describe("docPath", () => {
  it("is the route without a query", () => {
    expect(docPath({ route: "/games/1889/map", query: {} })).toBe(
      "/games/1889/map",
    );
  });

  it("adds the query", () => {
    expect(
      docPath({
        route: "/games/1889/map",
        query: { paginated: "true", variation: 1 },
      }),
    ).toBe("/games/1889/map?paginated=true&variation=1");
    expect(
      docPath({
        route: "/games/1889/cards",
        query: { "config.cards.layout": "die" },
      }),
    ).toBe("/games/1889/cards?config.cards.layout=die");
  });
});

describe("exportJobs", () => {
  const game = { info: { title: "Game" } };
  const docs = [
    { basename: "map", formats: ["pdf", "png"] },
    { basename: "card-1", formats: ["png"] },
    { basename: "Map", formats: ["b18"], path: "box/Map.png" },
  ];

  it("makes a job for each document and format asked for", () => {
    expect(exportJobs(game, docs, ["pdf"]).map((job) => job.path)).toEqual([
      "game-map.pdf",
    ]);
    expect(
      exportJobs(game, docs, ["pdf", "png"]).map((job) => job.path),
    ).toEqual(["game-map.pdf", "game-map.png", "game-card-1.png"]);
  });

  it("uses the path of a document that has one", () => {
    const [job] = exportJobs(game, docs, ["b18"]);
    expect(job).toEqual({ doc: docs[2], format: "b18", path: "box/Map.png" });
  });
});

describe("formatFolder", () => {
  it("puts a file in the folder of its format and leaves a Board 18 box alone", () => {
    expect(
      formatFolder([
        { format: "pdf", path: "a.pdf" },
        { format: "svg", path: "a.svg" },
        { format: "b18", path: "board18-x-1.0/x-1.0/Map.png" },
      ]),
    ).toEqual([
      { format: "pdf", path: "pdf/a.pdf" },
      { format: "svg", path: "svg/a.svg" },
      { format: "b18", path: "board18-x-1.0/x-1.0/Map.png" },
    ]);
  });
});
