import { loadKnownGames, loadableSummaries } from "@/util/knownGames";

const summaries = {
  bundled: { "18Test": { slug: "18Test", id: "18Test", type: "bundled" } },
  internal: { "internal:a": { slug: "internal:a", id: "a", type: "internal" } },
  system: {
    "system:b": { slug: "system:b", id: "b", type: "system" },
    "internal:a": { slug: "internal:a", id: "a", type: "internal" },
  },
  electron: { "electron:c": { slug: "electron:c", id: "c", type: "electron" } },
};

describe("loadableSummaries", () => {
  it("skips bundled games and lists each slug once", () => {
    expect(loadableSummaries(summaries).map((e) => e.slug)).toEqual([
      "electron:c",
      "internal:a",
      "system:b",
    ]);
  });

  it("lists nothing in render mode", () => {
    expect(loadableSummaries(summaries, true)).toEqual([]);
  });
});

describe("loadKnownGames", () => {
  it("loads games with the loader of their type and skips failures", async () => {
    const loaders = {
      internal: vi.fn(async (id) => ({
        info: { title: "Saved" },
        tiles: { T1: { color: "gray" } },
        id,
      })),
      system: vi.fn(async () => {
        throw new Error("Permission needed");
      }),
    };

    const games = await loadKnownGames(loadableSummaries(summaries), loaders);

    expect(games).toEqual([
      { slug: "internal:a", title: "Saved", tiles: { T1: { color: "gray" } } },
    ]);
    expect(loaders.internal).toHaveBeenCalledWith("a");
    expect(loaders.system).toHaveBeenCalledWith("b");
  });

  it("falls back to the id as title and no tiles", async () => {
    const games = await loadKnownGames(
      [{ slug: "internal:a", id: "a", type: "internal" }],
      { internal: async () => ({}) },
    );
    expect(games).toEqual([{ slug: "internal:a", title: "a", tiles: {} }]);
  });
});
