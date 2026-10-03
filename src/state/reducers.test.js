// @vitest-environment jsdom

import {
  CLEAR_ALERT,
  DELETE_GAME,
  RESET_CONFIG,
  RESET_ERRORS,
  SET_ALERT,
  SET_CONFIG,
  SET_DOWNLOAD_PERCENT,
  SET_ERRORS,
  SET_EXPORT_MENU_OPEN,
  SET_EXPORT_SHEET_OPEN,
  SET_GAME,
  SET_LANGUAGE,
  SET_SETTINGS,
  SET_SIDEBAR_OPEN,
  SET_SUMMARIES,
  SET_UPDATE,
  alertReducer,
  clearAlert,
  configReducer,
  createAlert,
  createDeleteGame,
  createDownloadPercent,
  createProgressAlert,
  createResetConfig,
  createResetErrors,
  createSetConfig,
  createSetErrors,
  createSetExportMenuOpen,
  createSetExportSheetOpen,
  createSetGame,
  createSetLanguage,
  createSetSettings,
  createSetSidebarOpen,
  createSetSummaries,
  createUpdate,
  errorsReducer,
  gameReducer,
  loadedGameReducer,
  settingsReducer,
  summariesReducer,
  uiReducer,
  updateReducer,
} from "@/state";

const game = (id = "a", type = "system", title = "Game A") => ({
  info: { title, subtitle: "sub", designer: "des", publisher: "pub", extra: 1 },
  meta: { id, type, slug: `${type}:${id}` },
  map: [],
});

// Deep freeze so any in place mutation by a reducer throws
const frozen = (value) => {
  Object.values(value).forEach((v) => v && typeof v === "object" && frozen(v));
  return Object.freeze(value);
};

describe("action creators", () => {
  it("build the expected actions", () => {
    expect(createAlert("t", "m")).toEqual({
      type: SET_ALERT,
      alert: { title: "t", message: "m", type: "info" },
    });
    expect(createAlert("t", "m", "error").alert.type).toBe("error");
    expect(createProgressAlert("t", "m", 5)).toEqual({
      type: SET_ALERT,
      alert: { title: "t", message: "m", progress: 5 },
    });
    expect(clearAlert()).toEqual({ type: CLEAR_ALERT });
    expect(createSetConfig({ a: 1 })).toEqual({
      type: SET_CONFIG,
      config: { a: 1 },
    });
    expect(createResetConfig()).toEqual({ type: RESET_CONFIG });
    expect(createSetErrors({ a: 1 })).toEqual({
      type: SET_ERRORS,
      errors: { a: 1 },
    });
    expect(createResetErrors()).toEqual({ type: RESET_ERRORS });
    expect(createSetGame(1)).toEqual({ type: SET_GAME, game: 1 });
    expect(createDeleteGame("system:abc")).toEqual({
      type: DELETE_GAME,
      meta: { id: "abc", slug: "system:abc", type: "system" },
    });
    expect(createSetSummaries({ a: 1 })).toEqual({
      type: SET_SUMMARIES,
      summaries: { a: 1 },
    });
    expect(createUpdate({ v: 1 })).toEqual({
      type: SET_UPDATE,
      update: { v: 1 },
    });
    expect(createDownloadPercent(50)).toEqual({
      type: SET_DOWNLOAD_PERCENT,
      downloading: 50,
    });
  });
});

const unknown = { type: "@@unknown" };

describe.each([
  ["alert", alertReducer, { open: false }],
  ["config", configReducer, {}],
  ["errors", errorsReducer, {}],
  ["summaries", summariesReducer, {}],
])("%s reducer", (_name, reducer, initial) => {
  it("has the initial state", () => {
    expect(reducer(undefined, unknown)).toEqual(initial);
  });

  it("returns the same reference for unknown actions", () => {
    const state = frozen({ some: { state: 1 } });
    expect(reducer(state, unknown)).toBe(state);
  });
});

describe.each([
  ["game", gameReducer],
  ["loadedGame", loadedGameReducer],
  ["update", updateReducer],
])("%s reducer", (_name, reducer) => {
  it("starts empty", () => {
    expect(reducer(undefined, unknown)).toBeFalsy();
  });

  it("returns the same reference for unknown actions", () => {
    const state = frozen({ some: { state: 1 } });
    expect(reducer(state, unknown)).toBe(state);
  });
});

describe("alertReducer", () => {
  it.each([
    [
      "SET_ALERT opens with the alert fields",
      { open: false },
      createAlert("T", "M", "success"),
      { open: true, title: "T", message: "M", type: "success" },
    ],
    [
      "SET_ALERT replaces an earlier alert, leaving no stale fields",
      { open: true, title: "Old", message: "Old", type: "error" },
      createProgressAlert("T", "M", 5),
      { open: true, title: "T", message: "M", progress: 5 },
    ],
    [
      "CLEAR_ALERT closes",
      { open: true, title: "T", message: "M" },
      clearAlert(),
      { open: false },
    ],
  ])("%s", (_name, state, action, expected) => {
    expect(alertReducer(frozen(state), action)).toEqual(expected);
  });

  it("does not mutate the alert in the action", () => {
    const action = frozen(createAlert("T", "M"));
    expect(alertReducer(undefined, action).open).toBe(true);
    expect(action.alert).not.toHaveProperty("open");
  });
});

describe.each([
  ["config", configReducer, createSetConfig, createResetConfig],
  ["errors", errorsReducer, createSetErrors, createResetErrors],
])("%s set/reset", (_name, reducer, set, reset) => {
  it("sets a copy of the payload, replacing old state", () => {
    const payload = frozen({ b: { c: 2 } });
    const result = reducer({ a: 1 }, set(payload));
    expect(result).toEqual({ b: { c: 2 } });
    expect(result).not.toBe(payload);
  });

  it("resets to an empty object", () => {
    expect(reducer(frozen({ a: 1 }), reset())).toEqual({});
  });

  it("set with an undefined payload empties the state", () => {
    expect(reducer({ a: 1 }, set(undefined))).toEqual({});
  });
});

describe("gameReducer", () => {
  it("SET_GAME stores a shallow copy", () => {
    const g = frozen(game());
    const result = gameReducer(undefined, createSetGame(g));
    expect(result).toEqual(g);
    expect(result).not.toBe(g);
  });

  it("SET_GAME with no game clears", () => {
    expect(gameReducer(game(), createSetGame(undefined))).toBeFalsy();
  });

  it("DELETE_GAME clears the matching game by id", () => {
    expect(
      gameReducer(frozen(game("a")), createDeleteGame("system:a")),
    ).toBeFalsy();
  });

  it("DELETE_GAME keeps a different game (same reference)", () => {
    const state = frozen(game("a"));
    expect(gameReducer(state, createDeleteGame("system:b"))).toBe(state);
  });

  it("DELETE_GAME with no game stays empty", () => {
    expect(gameReducer(undefined, createDeleteGame("system:b"))).toBeFalsy();
  });
});

describe("loadedGameReducer", () => {
  it("SET_GAME stores the summary (info picks + meta)", () => {
    expect(loadedGameReducer(undefined, createSetGame(game()))).toEqual({
      title: "Game A",
      subtitle: "sub",
      designer: "des",
      publisher: "pub",
      id: "a",
      type: "system",
      slug: "system:a",
    });
  });

  it("SET_GAME replaces the previous loaded game", () => {
    const previous = loadedGameReducer(undefined, createSetGame(game("a")));
    const next = loadedGameReducer(previous, createSetGame(game("b")));
    expect(next.id).toBe("b");
  });

  it("SET_GAME with no game clears", () => {
    expect(loadedGameReducer({ id: "a" }, createSetGame(null))).toBeFalsy();
  });

  it("DELETE_GAME clears when ids match", () => {
    expect(
      loadedGameReducer({ id: "a" }, createDeleteGame("system:a")),
    ).toBeFalsy();
  });

  it("DELETE_GAME keeps the state otherwise", () => {
    const state = frozen({ id: "a" });
    expect(loadedGameReducer(state, createDeleteGame("system:b"))).toBe(state);
    expect(
      loadedGameReducer(undefined, createDeleteGame("system:b")),
    ).toBeFalsy();
  });
});

describe("summariesReducer", () => {
  it("SET_SUMMARIES merges top level types, replacing a type wholesale", () => {
    const state = frozen({
      bundled: { "bundled:x": { id: "x" } },
      system: { "system:old": { id: "old" } },
    });
    const result = summariesReducer(
      state,
      createSetSummaries({ system: { "system:new": { id: "new" } } }),
    );
    expect(result).toEqual({
      bundled: { "bundled:x": { id: "x" } },
      system: { "system:new": { id: "new" } },
    });
    expect(result.bundled).toBe(state.bundled);
  });

  it("SET_SUMMARIES stores undefined types as given", () => {
    const result = summariesReducer(
      {},
      createSetSummaries({ internal: undefined, system: undefined }),
    );
    expect(result).toEqual({ internal: undefined, system: undefined });
  });

  it("SET_GAME with no game leaves the state alone", () => {
    const state = frozen({ bundled: { b: 1 } });
    expect(summariesReducer(state, createSetGame(undefined))).toBe(state);
  });

  it("SET_GAME adds a summary under meta.type/meta.slug", () => {
    const state = frozen({ bundled: { b: 1 } });
    const result = summariesReducer(state, createSetGame(game("a")));
    expect(result.bundled).toBe(state.bundled);
    expect(result.system["system:a"]).toEqual({
      title: "Game A",
      subtitle: "sub",
      designer: "des",
      publisher: "pub",
      id: "a",
      type: "system",
      slug: "system:a",
    });
  });

  it("SET_GAME overwrites an existing summary for the same slug", () => {
    const first = summariesReducer({}, createSetGame(game("a", "system", "X")));
    const second = summariesReducer(
      first,
      createSetGame(game("a", "system", "Y")),
    );
    expect(Object.keys(second.system)).toEqual(["system:a"]);
    expect(second.system["system:a"].title).toBe("Y");
  });

  it("DELETE_GAME removes only that summary", () => {
    const state = frozen({
      bundled: { b: 1 },
      system: { "system:a": { id: "a" }, "system:b": { id: "b" } },
    });
    const result = summariesReducer(state, createDeleteGame("system:a"));
    expect(result.system).toEqual({ "system:b": { id: "b" } });
    expect(result.bundled).toBe(state.bundled);
  });

  it("DELETE_GAME for an unknown summary leaves the state equal", () => {
    const state = frozen({ system: { "system:a": { id: "a" } } });
    expect(summariesReducer(state, createDeleteGame("system:z"))).toEqual(
      state,
    );
    expect(summariesReducer({}, createDeleteGame("internal:z"))).toEqual({});
  });
});

describe("updateReducer", () => {
  it("SET_UPDATE stores the update as is", () => {
    const update = { version: "2.0.0" };
    expect(updateReducer(undefined, createUpdate(update))).toBe(update);
  });

  it("SET_DOWNLOAD_PERCENT adds downloading immutably", () => {
    const state = frozen({ version: "2.0.0" });
    expect(updateReducer(state, createDownloadPercent(40))).toEqual({
      version: "2.0.0",
      downloading: 40,
    });
  });

  it("SET_DOWNLOAD_PERCENT with no update creates one", () => {
    expect(updateReducer(undefined, createDownloadPercent(0))).toEqual({
      downloading: 0,
    });
  });
});

describe("settingsReducer", () => {
  it("defaults to no settings, which means the system theme", () => {
    expect(settingsReducer(undefined, { type: "@@INIT" })).toEqual({});
  });

  it("replaces settings", () => {
    const action = createSetSettings({ theme: "dark" });
    expect(action).toEqual({ type: SET_SETTINGS, settings: { theme: "dark" } });
    expect(settingsReducer(frozen({ theme: "light" }), action)).toEqual({
      theme: "dark",
    });
  });

  it("sets the sidebar and the language next to other settings", () => {
    const open = createSetSidebarOpen(false);
    expect(open).toEqual({ type: SET_SIDEBAR_OPEN, open: false });
    const language = createSetLanguage("de");
    expect(language).toEqual({ type: SET_LANGUAGE, language: "de" });

    const state = [open, language].reduce(
      settingsReducer,
      frozen({ theme: "dark" }),
    );
    expect(state).toEqual({
      theme: "dark",
      sidebarOpen: false,
      language: "de",
    });
  });

  it("ignores other actions", () => {
    const state = frozen({ theme: "light" });
    expect(settingsReducer(state, clearAlert())).toBe(state);
  });
});

describe("uiReducer", () => {
  it("starts with the export menu and sheet closed", () => {
    expect(uiReducer(undefined, { type: "@@INIT" })).toEqual({
      exportMenuOpen: false,
      exportSheetOpen: false,
    });
  });

  it("opens and closes the export menu and sheet independently", () => {
    const menu = createSetExportMenuOpen(true);
    const sheet = createSetExportSheetOpen(true);
    expect(menu).toEqual({ type: SET_EXPORT_MENU_OPEN, open: true });
    expect(sheet).toEqual({ type: SET_EXPORT_SHEET_OPEN, open: true });

    const open = [menu, sheet].reduce(uiReducer, undefined);
    expect(open).toEqual({ exportMenuOpen: true, exportSheetOpen: true });
    expect(uiReducer(frozen(open), createSetExportMenuOpen(false))).toEqual({
      exportMenuOpen: false,
      exportSheetOpen: true,
    });
  });

  it("ignores other actions", () => {
    const state = frozen({ exportMenuOpen: true, exportSheetOpen: false });
    expect(uiReducer(state, clearAlert())).toBe(state);
  });
});
