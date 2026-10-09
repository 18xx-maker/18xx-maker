import "@tests/support/windowStub.js";

import { configureStore } from "@reduxjs/toolkit";

import {
  createAlert,
  createDeleteGame,
  createGameProblemsDone,
  createSetConfig,
  createSetGame,
} from "@/state";

// What gets persisted to localStorage (see state/store.js: storage.init):
//
//   key "config"     JSON of state.config (a diff against defaults.json)
//   key "loadedGame" JSON of state.loadedGame (a game summary)
//
// On startup each key is parsed and deep merged over `initialState` in
// store.js (mergeDeepRight), so stored values win.
//
// BREAKING CHANGES to persisted data, which need a migration (and a test
// below that loads the OLD payload):
//   - renaming/removing a persisted key or adding one that must not be lost
//   - changing a persisted value's shape (config key renames, summary field
//     renames such as slug/type/id, anything defaults.json no longer knows)
//   - changing the serialization away from JSON.stringify per key
// Not breaking: adding new optional config keys or new non persisted slices.

// A payload as written by released versions. DO NOT edit to match new code,
// add a migration instead.
const PAYLOAD = {
  config: JSON.stringify({
    theme: "cmk",
    paper: { width: 595, height: 842 },
    tokens: { layout: "left" },
  }),
  loadedGame: JSON.stringify({
    title: "My Game",
    subtitle: "A subtitle",
    designer: "Someone",
    publisher: "Somewhere",
    id: "123e4567-e89b-12d3-a456-426614174000",
    type: "system",
    slug: "system:123e4567-e89b-12d3-a456-426614174000",
  }),
};

const importStore = async () => {
  vi.resetModules();
  const state = await import("@/state");
  return state;
};

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loading persisted state", () => {
  it("uses defaults when nothing is stored", async () => {
    const { preloadedState } = await importStore();
    expect(preloadedState.config).toEqual({});
    expect(preloadedState.loadedGame).toBeFalsy();
    expect(preloadedState.alert).toEqual({ items: [], seq: 0 });
    expect(preloadedState.errors).toEqual({});
    expect(Object.keys(preloadedState.summaries)).toEqual(["bundled"]);
  });

  it("restores config and loadedGame from the released payload", async () => {
    Object.entries(PAYLOAD).forEach(([key, value]) =>
      window.localStorage.setItem(key, value),
    );
    const { preloadedState, store } = await importStore();

    expect(preloadedState.config).toEqual(JSON.parse(PAYLOAD.config));
    expect(preloadedState.loadedGame).toEqual(JSON.parse(PAYLOAD.loadedGame));
    expect(preloadedState.summaries.bundled).toBeDefined();

    // Same data lands in the live store
    expect(store.getState().config).toEqual(JSON.parse(PAYLOAD.config));
    expect(store.getState().loadedGame).toEqual(JSON.parse(PAYLOAD.loadedGame));
    // game itself is never persisted
    expect(store.getState().game).toBeFalsy();
  });

  it("loads a released payload that has no settings key", async () => {
    Object.entries(PAYLOAD).forEach(([key, value]) =>
      window.localStorage.setItem(key, value),
    );
    const { preloadedState, store } = await importStore();
    expect(preloadedState.settings).toEqual({});
    expect(store.getState().settings).toEqual({});
  });

  it("restores stored settings", async () => {
    window.localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));
    const { preloadedState } = await importStore();
    expect(preloadedState.settings).toEqual({ theme: "dark" });
  });

  it("loads settings stored before sidebarOpen and language existed", async () => {
    window.localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));
    const { store } = await importStore();
    const { settingsReducer, createSetSidebarOpen } =
      await import("@/state/settings");

    expect(store.getState().settings).toEqual({ theme: "dark" });
    // New keys are optional and land next to the old ones
    expect(
      settingsReducer(store.getState().settings, createSetSidebarOpen(false)),
    ).toEqual({ theme: "dark", sidebarOpen: false });
  });

  it("restores and persists the new settings", async () => {
    window.localStorage.setItem(
      "settings",
      JSON.stringify({ sidebarOpen: false, language: "de" }),
    );
    const { store, createSetSidebarOpen } = await importStore();
    expect(store.getState().settings).toEqual({
      sidebarOpen: false,
      language: "de",
    });

    store.dispatch(createSetSidebarOpen(true));
    expect(JSON.parse(window.localStorage.getItem("settings"))).toEqual({
      sidebarOpen: true,
      language: "de",
    });
  });

  it("reads settings stored before openExportFolder existed as off", async () => {
    window.localStorage.setItem(
      "settings",
      JSON.stringify({ theme: "dark", language: "de" }),
    );
    const { store } = await importStore();
    const { selectOpenExportFolder } = await import("@/state/selectors");
    const { createSetOpenExportFolder } = await import("@/state/settings");

    expect(selectOpenExportFolder(store.getState())).toBe(false);
    store.dispatch(createSetOpenExportFolder(true));
    expect(JSON.parse(window.localStorage.getItem("settings"))).toEqual({
      theme: "dark",
      language: "de",
      openExportFolder: true,
    });
  });

  it("reads settings stored before editorKeys existed as normal", async () => {
    window.localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));
    const { store } = await importStore();
    const { selectEditorKeys } = await import("@/state/selectors");
    const { createSetEditorKeys } = await import("@/state/settings");

    expect(selectEditorKeys(store.getState())).toBe("normal");
    store.dispatch(createSetEditorKeys("vim"));
    expect(JSON.parse(window.localStorage.getItem("settings"))).toEqual({
      theme: "dark",
      editorKeys: "vim",
    });
  });

  it("ignores keys that are not persisted", async () => {
    window.localStorage.setItem(
      "alert",
      JSON.stringify({ open: true, title: "Old" }),
    );
    window.localStorage.setItem("errors", JSON.stringify({ a: "b" }));
    window.localStorage.setItem("game", JSON.stringify({ meta: {} }));
    const { preloadedState } = await importStore();
    expect(preloadedState.alert).toEqual({ items: [], seq: 0 });
    expect(preloadedState.errors).toEqual({});
    expect(preloadedState.game).toBeFalsy();
  });

  it("survives corrupt JSON and keeps the other key", async () => {
    window.localStorage.setItem("config", "{not json");
    window.localStorage.setItem("loadedGame", PAYLOAD.loadedGame);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { preloadedState } = await importStore();
    expect(error).toHaveBeenCalledTimes(1);
    expect(preloadedState.config).toEqual({});
    expect(preloadedState.loadedGame.id).toBe(
      "123e4567-e89b-12d3-a456-426614174000",
    );
  });
});

describe("bundled summaries", () => {
  it("are keyed by game id with the exact summary shape", async () => {
    const { preloadedState } = await importStore();
    const { games } = await import("@/data");
    const bundled = preloadedState.summaries.bundled;

    expect(Object.keys(bundled)).toEqual(Object.keys(games));
    const id = Object.keys(games)[0];
    const { title, subtitle, designer, publisher } = games[id].info;
    expect(bundled[id]).toEqual({
      title,
      subtitle,
      designer,
      publisher,
      ...games[id].meta,
    });
  });
});

describe("storage.listen", () => {
  const setup = async () => {
    const { rootReducer } = await importStore();
    const storage = (await import("@/state/storage")).default;
    storage.init("config", "loadedGame");
    const store = configureStore({ reducer: rootReducer });
    storage.listen(store);
    return store;
  };

  const stored = (key) => JSON.parse(window.localStorage.getItem(key));

  it("writes only the persisted keys, as JSON", async () => {
    const store = await setup();
    store.dispatch(createSetConfig({ theme: "cmk" }));

    expect(window.localStorage.getItem("config")).toBe('{"theme":"cmk"}');
    expect(window.localStorage.getItem("loadedGame")).toBeNull();
    expect(window.localStorage.length).toBe(1);
  });

  it("does not persist the transient ui state", async () => {
    const { createSetExportMenuOpen, createSetLoadingGame } =
      await import("@/state/ui");
    const store = await setup();
    store.dispatch(createSetExportMenuOpen(true));
    store.dispatch(createSetLoadingGame("a.json", 1));
    store.dispatch(createGameProblemsDone("a", []));

    expect(window.localStorage.getItem("ui")).toBeNull();
    expect(window.localStorage.getItem("gameProblems")).toBeNull();
    expect(Object.keys(window.localStorage)).toEqual(["config"]);
  });

  it("writes loadedGame as a summary when a game is set", async () => {
    const store = await setup();
    const game = {
      info: { title: "T", subtitle: "S", designer: "D", publisher: "P" },
      meta: { id: "a", type: "system", slug: "system:a" },
    };
    store.dispatch(createSetGame(game));
    expect(stored("loadedGame")).toEqual({
      title: "T",
      subtitle: "S",
      designer: "D",
      publisher: "P",
      id: "a",
      type: "system",
      slug: "system:a",
    });
    expect(window.localStorage.getItem("game")).toBeNull();
    expect(window.localStorage.getItem("summaries")).toBeNull();
  });

  // storage.js removes the key only for `=== undefined`, which is what the
  // slice reducers currently return when the game is deleted
  it("removes the stored loadedGame when the game is deleted", async () => {
    const store = await setup();
    store.dispatch(
      createSetGame({
        info: { title: "T" },
        meta: { id: "a", type: "system", slug: "system:a" },
      }),
    );
    expect(window.localStorage.getItem("loadedGame")).not.toBeNull();

    store.dispatch(createDeleteGame("system:a"));
    expect(window.localStorage.getItem("loadedGame")).toBeNull();

    const { preloadedState } = await importStore();
    expect(preloadedState.loadedGame).toBeFalsy();
  });

  it("does not write when the persisted values did not change", async () => {
    const store = await setup();
    store.dispatch(createSetConfig({ theme: "cmk" }));
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");

    store.dispatch(createAlert("x", "y"));
    store.dispatch({ type: "@@unknown" });

    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
  });

  it("writes synchronously on every change (no debounce)", async () => {
    vi.useFakeTimers();
    try {
      const store = await setup();
      store.dispatch(createSetConfig({ a: 1 }));
      expect(stored("config")).toEqual({ a: 1 });
      store.dispatch(createSetConfig({ a: 2 }));
      expect(stored("config")).toEqual({ a: 2 });
    } finally {
      vi.useRealTimers();
    }
  });

  it("round trips: what listen wrote is what initialState restores", async () => {
    const store = await setup();
    store.dispatch(createSetConfig({ theme: "cmk", paper: { width: 595 } }));
    const { preloadedState } = await importStore();
    expect(preloadedState.config).toEqual({
      theme: "cmk",
      paper: { width: 595 },
    });
  });
});
