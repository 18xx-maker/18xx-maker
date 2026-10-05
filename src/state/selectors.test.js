import { games } from "@/data";
import {
  createConfigSelector,
  selectGame,
  selectGameForSlug,
  selectGameState,
  selectLanguage,
  selectOpenExportFolder,
  selectSidebarOpen,
  selectStoredConfig,
  selectTheme,
} from "@/state/selectors";

const game = (slug, config) => ({ meta: { slug }, config });

describe("config selector", () => {
  const defaults = { a: "default", b: "default", c: "default", d: "default" };
  const user = { b: "user", c: "user", d: "user" };
  const select = createConfigSelector(defaults, user);

  it("layers defaults, user, stored, search then game config", () => {
    const state = { config: { c: "stored", d: "stored" } };
    const g = game("system:x", { e: "game", d: "game" });
    const { config, searchConfig, gameConfig } = select(
      state,
      "?config.d=search&config.e=search&other=1",
      g,
    );

    expect(config).toEqual({
      a: "default",
      b: "user",
      c: "stored",
      d: "game",
      e: "game",
    });
    expect(searchConfig).toEqual({ d: "search", e: "search" });
    expect(gameConfig).toEqual({ e: "game", d: "game" });
  });

  it("lets search override stored and stored override user", () => {
    const state = { config: { c: "stored", d: "stored" } };
    expect(select(state, "?config.d=search").config).toMatchObject({
      b: "user",
      c: "stored",
      d: "search",
    });
  });

  it("works without a game or a user layer", () => {
    const result = createConfigSelector({ a: 1 })(
      { config: {} },
      "",
      undefined,
    );
    expect(result).toEqual({
      config: { a: 1 },
      searchConfig: {},
      gameConfig: {},
    });
  });

  it("keeps a bounded number of results for distinct searches", () => {
    const state = { config: {} };
    const g = game("system:x", {});
    const first = select(state, "?config.d=0", g);
    expect(select(state, "?config.d=0", g)).toBe(first);

    for (let i = 1; i <= 25; i++) select(state, `?config.d=${i}`, g);

    // Evicted: equal, but computed again
    const again = select(state, "?config.d=0", g);
    expect(again).not.toBe(first);
    expect(again).toEqual(first);
  });

  it("returns the identical object for identical inputs", () => {
    const state = { config: { c: "stored" }, game: null };
    const g = game("system:x", { e: "game" });
    const first = select(state, "?config.d=1", g);

    expect(select(state, "?config.d=1", g)).toBe(first);
    // A new game object with the same config object, and unrelated state
    expect(select({ ...state, alerts: [] }, "?config.d=1", { ...g })).toBe(
      first,
    );
  });

  it("recomputes when stored config, search or game config change", () => {
    const state = { config: { c: "stored" } };
    const g = game("system:x", { e: "game" });
    const first = select(state, "", g);

    const byStored = select({ config: { c: "other" } }, "", g);
    expect(byStored).not.toBe(first);
    const bySearch = select({ config: { c: "other" } }, "?config.a=1", g);
    expect(bySearch).not.toBe(byStored);
    const byGame = select(
      { config: { c: "other" } },
      "?config.a=1",
      game("system:x", { e: "changed" }),
    );
    expect(byGame).not.toBe(bySearch);
    expect(byGame.config.e).toBe("changed");
  });
});

describe("game selectors", () => {
  const loaded = game("system:loaded");

  it("reads state directly", () => {
    expect(selectStoredConfig({ config: { x: 1 } })).toEqual({ x: 1 });
    expect(selectGameState({ game: loaded })).toBe(loaded);
  });

  it("selectGame returns the redux game on game pages", () => {
    expect(selectGame({ game: loaded }, true)).toBe(loaded);
    expect(selectGame({ game: null }, true)).toBeNull();
  });

  it("selectGame falls back to the bundled 1889 elsewhere", () => {
    expect(selectGame({ game: loaded }, false)).toBe(games["1889"]);
    expect(selectGame({ game: null }, false)).toBe(games["1889"]);
  });

  it("selectGameForSlug only returns the game when slugs agree", () => {
    const state = { game: loaded };
    expect(selectGameForSlug(state, "system:loaded")).toBe(loaded);
    expect(selectGameForSlug(state, "system:other")).toBeUndefined();
    expect(selectGameForSlug(state, undefined)).toBeUndefined();
    expect(selectGameForSlug({ game: null }, "system:loaded")).toBeUndefined();
  });
});

describe("settings selectors", () => {
  it("ignore a language that is not a language code", () => {
    for (const language of [1, {}, "", null, true]) {
      expect(selectLanguage({ settings: { language } })).toBeUndefined();
    }
  });

  it("are undefined for stored settings that predate them", () => {
    const state = { settings: {} };
    expect(selectTheme(state)).toBeUndefined();
    expect(selectSidebarOpen(state)).toBeUndefined();
    expect(selectLanguage(state)).toBeUndefined();
    expect(selectOpenExportFolder(state)).toBe(false);
  });

  it("read the open export folder setting as on only when it is true", () => {
    expect(selectOpenExportFolder({})).toBe(false);
    for (const openExportFolder of [1, "true", null, false]) {
      expect(selectOpenExportFolder({ settings: { openExportFolder } })).toBe(
        false,
      );
    }
    expect(
      selectOpenExportFolder({ settings: { openExportFolder: true } }),
    ).toBe(true);
  });

  it("read the stored settings", () => {
    const state = {
      settings: { theme: "dark", sidebarOpen: false, language: "de" },
    };
    expect(selectTheme(state)).toBe("dark");
    expect(selectSidebarOpen(state)).toBe(false);
    expect(selectLanguage(state)).toBe("de");
  });
});
