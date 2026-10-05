// @vitest-environment jsdom

import {
  createSetConfig,
  createSetGame,
  createSetLanguage,
  createSetSettings,
  createSetSidebarOpen,
} from "@/state";

// Render mode (util/renderInput) keeps the state in memory: it must not read
// the app's stored state or write to it.
const STORED = {
  config: JSON.stringify({ theme: "cmk" }),
  loadedGame: JSON.stringify({ id: "x", type: "system", slug: "system:x" }),
  settings: JSON.stringify({ theme: "dark" }),
};

const game = { info: { title: "T" }, meta: { id: "old", type: "bundled" } };

const importState = async (input) => {
  vi.resetModules();
  window.__RENDER_INPUT__ = input;
  return import("@/state");
};

beforeEach(() => {
  window.localStorage.clear();
  Object.entries(STORED).forEach(([key, value]) =>
    window.localStorage.setItem(key, value),
  );
});

afterEach(() => {
  delete window.__RENDER_INPUT__;
  vi.restoreAllMocks();
});

describe("render mode state", () => {
  const input = { id: "18Test", game, config: { paper: { width: 111 } } };

  it("starts without the stored state", async () => {
    const { store, preloadedState } = await importState(input);

    expect(preloadedState.config).toEqual({});
    expect(store.getState().config).toEqual({});
    expect(store.getState().settings).toEqual({});
    expect(store.getState().loadedGame).toBeFalsy();
  });

  it("writes nothing to local storage", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const removeItem = vi.spyOn(Storage.prototype, "removeItem");
    const { store, createDeleteGame } = await importState(input);

    store.dispatch(createSetConfig({ theme: "gmt" }));
    store.dispatch(createSetSettings({ theme: "light" }));
    store.dispatch(createSetSidebarOpen(false));
    store.dispatch(createSetLanguage("de"));
    store.dispatch(createSetGame(game));
    store.dispatch(createDeleteGame("render:18Test"));

    expect(setItem).not.toHaveBeenCalled();
    expect(removeItem).not.toHaveBeenCalled();
    expect(store.getState().config).toEqual({ theme: "gmt" });
    for (const [key, value] of Object.entries(STORED)) {
      expect(window.localStorage.getItem(key)).toBe(value);
    }
  });

  it("detects the language without local storage", async () => {
    window.localStorage.setItem("i18nextLng", "de");
    const input = { id: "18Test", game, config: {} };
    vi.resetModules();
    window.__RENDER_INPUT__ = input;
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const { default: i18n } = await import("@/locales/i18n");
    await i18n.changeLanguage("fr");

    expect(i18n.language).toBe("fr");
    expect(setItem).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("i18nextLng")).toBe("de");
  });

  it("does not read local storage", async () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    await importState(input);

    expect(getItem).not.toHaveBeenCalled();
  });

  it("can create a render store next to the app store", async () => {
    const { createStore } = await importState(undefined);
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    const store = createStore({ render: true });
    store.dispatch(createSetConfig({ theme: "gmt" }));

    expect(store.getState().config).toEqual({ theme: "gmt" });
    expect(setItem).not.toHaveBeenCalled();
  });

  it("never reads or caches the language in local storage", async () => {
    window.localStorage.setItem("i18nextLng", "de");
    const { default: i18n } = await importState(undefined).then(
      () => import("@/locales/i18n"),
    );
    expect(i18n.language).not.toBe("de");

    const setItem = vi.spyOn(Storage.prototype, "setItem");
    await i18n.changeLanguage("fr");
    expect(setItem).not.toHaveBeenCalled();
  });

  it("starts in the stored language", async () => {
    window.localStorage.setItem("settings", JSON.stringify({ language: "es" }));
    const { default: i18n } = await importState(undefined).then(
      () => import("@/locales/i18n"),
    );
    expect(i18n.language).toBe("es");
  });

  it("prefers the language setting to a legacy cached language", async () => {
    window.localStorage.setItem("i18nextLng", "de");
    window.localStorage.setItem("settings", JSON.stringify({ language: "es" }));
    const { default: i18n } = await importState(undefined).then(
      () => import("@/locales/i18n"),
    );
    expect(i18n.language).toBe("es");
  });

  it.for([1, {}, ""])(
    "still loads when the stored language is %j",
    async (language) => {
      window.localStorage.setItem("settings", JSON.stringify({ language }));
      const { default: i18n } = await importState(undefined).then(
        () => import("@/locales/i18n"),
      );
      expect(typeof i18n.language).toBe("string");
      expect(i18n.language).toBeTruthy();
    },
  );

  it("keeps the persisted behavior without render input", async () => {
    const { store } = await importState(undefined);
    expect(store.getState().config).toEqual({ theme: "cmk" });

    store.dispatch(createSetConfig({ theme: "gmt" }));
    expect(window.localStorage.getItem("config")).toBe('{"theme":"gmt"}');
  });
});

describe("render input", () => {
  it("gives the game a render meta, whatever it had", async () => {
    const { store, loadGame } = await importState({
      game,
      config: {},
    });
    const loaded = await loadGame("render:old")(store.dispatch, store.getState);

    // The id of the game's meta is the default id
    expect(loaded.meta).toEqual({
      id: "old",
      type: "render",
      slug: "render:old",
    });
    expect(store.getState().game.meta.slug).toBe("render:old");
  });

  it("loads the given game without looking for it", async () => {
    const { store, loadGame } = await importState({
      id: "abc",
      game,
      config: {},
    });

    await loadGame("render:abc")(store.dispatch, store.getState);
    expect(store.getState().game.info.title).toBe("T");
    expect(store.getState().game.meta.slug).toBe("render:abc");
  });

  it("does not load any other game", async () => {
    const { store, loadGame } = await importState({
      id: "abc",
      game,
      config: {},
    });

    await expect(
      loadGame("render:other")(store.dispatch, store.getState),
    ).rejects.toThrow("Unknown game type render");
    await expect(
      loadGame("1889")(store.dispatch, store.getState),
    ).resolves.toMatchObject({
      meta: { id: "1889" },
    });
  });

  it("reads the input from the Electron preload", async () => {
    vi.resetModules();
    window.api = { renderInput: { id: "e", game, config: {} } };
    try {
      const { getRenderInput } = await import("@/util/renderInput");
      expect(getRenderInput().game.meta.slug).toBe("render:e");
      expect(getRenderInput()).toBe(getRenderInput());
    } finally {
      delete window.api;
    }
  });

  it("is off without input", async () => {
    vi.resetModules();
    const { getRenderInput } = await import("@/util/renderInput");
    expect(getRenderInput()).toBeUndefined();
  });
});
