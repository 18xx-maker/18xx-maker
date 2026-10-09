import { pngDataUri } from "@/util/assetNames";

import { makePng } from "@tests/support/png.js";

const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h5v5z"/></svg>';
const game = {
  info: { title: "T" },
  meta: { id: "x", type: "render", slug: "render:x" },
};

const importState = async (input) => {
  vi.resetModules();
  window.__RENDER_INPUT__ = input;
  return import("@/state");
};

afterEach(() => {
  delete window.__RENDER_INPUT__;
  vi.restoreAllMocks();
});

describe("render mode assets", () => {
  it("starts with the sanitized images it is given, for its game", async () => {
    const { store } = await importState({
      id: "x",
      game,
      config: {},
      assets: {
        icons: { star: SVG, bad: "<html/>" },
        logos: {},
        trains: { loco: pngDataUri(makePng()) },
      },
    });
    const assets = store.getState().assets["render:x"];
    expect(Object.keys(assets.icons)).toEqual(["star"]);
    expect(assets.trains.loco).toMatch(/^data:image\/png/);
  });

  it("loads the game without reading or writing IndexedDB or local storage", async () => {
    const open = vi.spyOn(indexedDB, "open");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { store, loadGame, createSetAssets } = await importState({
      id: "x",
      game,
      config: {},
      assets: { icons: { star: SVG }, logos: {}, trains: {} },
    });
    await store.dispatch(loadGame("render:x"));
    store.dispatch(createSetAssets("render:x", { icons: {} }));
    expect(store.getState().game.meta.slug).toBe("render:x");
    expect(open).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });
});
