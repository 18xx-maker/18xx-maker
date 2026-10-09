import { configureStore } from "@reduxjs/toolkit";

import { bundledAssets } from "@/data/gameAssets";
import {
  createDeleteGame,
  createSetAssets,
  createSetGame,
  loadGame,
  rootReducer,
  saveGameAs,
} from "@/state";
import { createStore } from "@/state/store";
import { pngDataUri } from "@/util/assetNames";
import capability from "@/util/capability";
import * as assetStore from "@/util/storage/assets";
import * as opfs from "@/util/storage/opfs";

import { makePng } from "@tests/support/png.js";

const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h5v5z"/></svg>';

const newStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

describe("the assets slice", () => {
  it("keeps the assets by slug and forgets them with the game", () => {
    const store = newStore();
    store.dispatch(createSetAssets("system:a", { icons: { x: SVG } }));
    store.dispatch(createSetAssets("system:b", { icons: {} }));
    expect(Object.keys(store.getState().assets)).toEqual([
      "system:a",
      "system:b",
    ]);
    store.dispatch(createDeleteGame("system:a"));
    expect(Object.keys(store.getState().assets)).toEqual(["system:b"]);
    store.dispatch(createSetAssets("system:b", undefined));
    expect(store.getState().assets).toEqual({});
  });

  it("is never written to local storage", () => {
    window.localStorage.clear();
    const store = createStore();
    store.dispatch(createSetAssets("system:a", { icons: { x: SVG } }));
    store.dispatch(
      createSetGame({
        info: { title: "T" },
        meta: { id: "a", type: "system", slug: "system:a" },
      }),
    );
    const stored = Object.keys(window.localStorage);
    expect(stored).not.toContain("assets");
    for (const key of stored) {
      expect(window.localStorage.getItem(key)).not.toContain("<path");
    }
  });
});

describe("loading a game", () => {
  it("loads the images of a bundled game with it", async () => {
    const store = newStore();
    await store.dispatch(loadGame("18Test"));
    expect(store.getState().assets["18Test"]).toBe(bundledAssets["18Test"]);
    expect(Object.keys(bundledAssets["18Test"].icons)).toContain("star");
    expect(bundledAssets["18Test"].trains.loco).toMatch(
      /^data:image\/png;base64,/,
    );
  });

  it("has no images for a bundled game that has none", async () => {
    const store = newStore();
    await store.dispatch(loadGame("1889"));
    expect(store.getState().assets).toEqual({});
  });

  it("loads the sanitized images of an internal game from IndexedDB", async () => {
    const slug = await opfs.saveGameFile(
      JSON.stringify({ info: { title: "Mine" }, map: { hexes: [] } }),
    );
    await assetStore.putAsset(slug, "icons", "star", SVG);
    await assetStore.putAsset(slug, "trains", "loco", pngDataUri(makePng()));
    try {
      const store = newStore();
      await store.dispatch(loadGame(slug));
      const assets = store.getState().assets[slug];
      expect(assets.icons.star).toBe(SVG);
      expect(assets.trains.loco).toMatch(/^data:image\/png/);
      expect(store.getState().game.meta.slug).toBe(slug);
    } finally {
      await opfs.deleteGame(slug.replace("internal:", ""));
    }
  });
});

describe("save as", () => {
  // Chromium would open its file picker, which a test cannot answer
  const system = capability.system;
  beforeEach(() => {
    capability.system = false;
  });
  afterEach(() => {
    capability.system = system;
  });

  it("copies the images of a bundled game to the new game", async () => {
    const store = newStore();
    await store.dispatch(loadGame("18Test"));
    const name = `copy-${crypto.randomUUID()}`;

    const slug = await store.dispatch(saveGameAs({ name }));

    expect(slug).toMatch(/^internal:/);
    try {
      const copy = await assetStore.listAssets(slug);
      expect(Object.keys(copy.icons)).toEqual(
        Object.keys(bundledAssets["18Test"].icons),
      );
      expect(copy.trains.loco).toBe(bundledAssets["18Test"].trains.loco);
      expect(store.getState().alert).toMatchObject({ type: "success" });

      // Opening the copy shows them
      await store.dispatch(loadGame(slug));
      expect(store.getState().assets[slug].logos.crest).toBe(
        bundledAssets["18Test"].logos.crest,
      );
    } finally {
      await opfs.deleteGame(slug.replace("internal:", ""));
    }
    expect(Object.keys((await assetStore.listAssets(slug)).icons)).toEqual([]);
  });

  it("copies nothing for a game without images", async () => {
    const store = newStore();
    await store.dispatch(loadGame("1889"));
    const slug = await store.dispatch(
      saveGameAs({ name: `copy-${crypto.randomUUID()}` }),
    );
    try {
      expect(await assetStore.listAssets(slug)).toEqual({
        icons: {},
        logos: {},
        trains: {},
      });
    } finally {
      await opfs.deleteGame(slug.replace("internal:", ""));
    }
  });
});
