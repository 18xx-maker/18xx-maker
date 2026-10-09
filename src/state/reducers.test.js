import "@tests/support/windowStub.js";

import {
  ALERT_DEFAULT,
  CLEAR_ALERT,
  DELETE_GAME,
  RESET_CONFIG,
  RESET_ERRORS,
  SET_ALERT,
  SET_CONFIG,
  SET_DOWNLOAD_PERCENT,
  SET_EDITOR_KEYS,
  SET_ERRORS,
  SET_EXPORT_MENU_OPEN,
  SET_EXPORT_SHEET_OPEN,
  SET_GAME,
  SET_LANGUAGE,
  SET_OPEN_EXPORT_FOLDER,
  SET_PANEL_STATE,
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
  createSetEditorKeys,
  createSetErrors,
  createSetExportMenuOpen,
  createSetExportSheetOpen,
  createSetGame,
  createSetLanguage,
  createSetOpenExportFolder,
  createSetPanelState,
  createSetSettings,
  createSetSidebarOpen,
  createSetSummaries,
  createUpdate,
  errorsReducer,
  gameHistoryReducer,
  gameOriginalReducer,
  gameReducer,
  loadedGameReducer,
  selectAlerts,
  selectLatestAlert,
  settingsReducer,
  summariesReducer,
  uiReducer,
  updateReducer,
} from "@/state";
import { selectPanelState } from "@/state/selectors";

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
    expect(clearAlert("a")).toEqual({ type: CLEAR_ALERT, id: "a" });
    expect(createAlert("t", "m", "error", { sticky: false }).alert).toEqual({
      title: "t",
      message: "m",
      type: "error",
      sticky: false,
    });
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
  ["alert", alertReducer, { items: [], seq: 0 }],
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
  const run = (...actions) => actions.reduce(alertReducer, undefined);

  it("adds a toast with an id and the timing of its type", () => {
    expect(run(createAlert("T", "M", "success")).items).toEqual([
      {
        id: "alert-1",
        title: "T",
        message: "M",
        type: "success",
        sticky: false,
        duration: 5000,
      },
    ]);
    expect(run(createAlert("T", "M", "warning")).items[0].duration).toBe(8000);
  });

  it("makes errors sticky and lets options override the defaults", () => {
    const [error] = run(createAlert("T", "M", "error")).items;
    expect(error).toMatchObject({ sticky: true, duration: undefined });
    const [short] = run(
      createAlert("T", "M", "error", { sticky: false, duration: 1000 }),
    ).items;
    expect(short).toMatchObject({ sticky: false, duration: 1000 });
  });

  it("keeps one sticky progress toast and updates it in place", () => {
    const state = run(
      createAlert("Other", "M", "error"),
      createProgressAlert("T", "1/2", 50),
      createProgressAlert("T", "2/2", 100),
    );
    expect(state.items.map((i) => i.id)).toEqual(["alert-1", "progress"]);
    expect(state.items[1]).toMatchObject({
      type: "info",
      message: "2/2",
      progress: 100,
      sticky: true,
    });
  });

  it("removes the progress toast when a result arrives", () => {
    const state = run(
      createProgressAlert("T", "1/2", 50),
      createAlert("Done", "M", "success"),
    );
    expect(state.items.map((i) => i.title)).toEqual(["Done"]);
  });

  it("keeps the newest three toasts", () => {
    const state = run(
      ...[1, 2, 3, 4].map((n) => createAlert(`T${n}`, "M", "error")),
    );
    expect(state.items.map((i) => i.title)).toEqual(["T2", "T3", "T4"]);
    const withProgress = run(
      ...[1, 2, 3].map((n) => createAlert(`T${n}`, "M", "error")),
      createProgressAlert("P", "M", 1),
    );
    expect(withProgress.items.map((i) => i.title)).toEqual(["T2", "T3", "P"]);
  });

  it("drops the oldest transient toast before a sticky one", () => {
    const state = run(
      createAlert("E", "M", "error"),
      createAlert("A", "M", "info"),
      createAlert("B", "M", "info"),
      createAlert("C", "M", "info"),
    );
    expect(state.items.map((i) => i.title)).toEqual(["E", "B", "C"]);
  });

  it("clears by id and clears all", () => {
    const state = run(createAlert("A", "M"), createAlert("B", "M"));
    expect(
      alertReducer(state, clearAlert("alert-2")).items.map((i) => i.id),
    ).toEqual(["alert-1"]);
    expect(alertReducer(state, clearAlert()).items).toEqual([]);
  });

  it("does not reuse an id after a toast is cleared", () => {
    const state = run(
      createAlert("A", "M"),
      clearAlert("alert-1"),
      createAlert("B", "M"),
    );
    expect(state.items[0].id).toBe("alert-2");
  });

  it("does not mutate the action or the state", () => {
    const action = frozen(createAlert("T", "M"));
    const state = frozen(run(createAlert("A", "M")));
    expect(alertReducer(state, action).items).toHaveLength(2);
    expect(action.alert).not.toHaveProperty("id");
  });

  it("selects the toasts and the latest one", () => {
    const state = { alert: run(createAlert("A", "M"), createAlert("B", "M")) };
    expect(selectAlerts(state)).toHaveLength(2);
    expect(selectLatestAlert(state).title).toBe("B");
    expect(selectLatestAlert({ alert: ALERT_DEFAULT })).toBeNull();
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

  it("DELETE_GAME clears when slugs match", () => {
    expect(
      loadedGameReducer(
        { id: "a", slug: "system:a" },
        createDeleteGame("system:a"),
      ),
    ).toBeFalsy();
  });

  it("DELETE_GAME keeps the state otherwise", () => {
    const state = frozen({ id: "a", slug: "system:a" });
    expect(loadedGameReducer(state, createDeleteGame("system:b"))).toBe(state);
    expect(
      loadedGameReducer(undefined, createDeleteGame("system:b")),
    ).toBeFalsy();
  });
});

// An id in the private file system can be the id of a bundled game
describe("games of different types with the same id", () => {
  const bundled = game("1889", "bundled");
  const internal = game("1889", "internal");
  const forget = createDeleteGame("internal:1889");

  it("forgetting one keeps the other open", () => {
    const state = frozen(bundled);
    expect(gameReducer(state, forget)).toBe(state);
    expect(gameOriginalReducer(state, forget)).toBe(state);
    const loaded = frozen({ id: "1889", slug: "1889" });
    expect(loadedGameReducer(loaded, forget)).toBe(loaded);
    const history = frozen([{ savedAt: 1, game: bundled }]);
    expect(gameHistoryReducer(history, forget)).toBe(history);
  });

  it("forgetting the open one clears it", () => {
    expect(gameReducer(frozen(internal), forget)).toBeFalsy();
    expect(gameOriginalReducer(frozen(internal), forget)).toBeFalsy();
    expect(
      loadedGameReducer(frozen({ id: "1889", slug: "internal:1889" }), forget),
    ).toBeFalsy();
    expect(
      gameHistoryReducer(frozen([{ savedAt: 1, game: internal }]), forget),
    ).toEqual([]);
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

  it("stores the open export folder setting only when it is on", () => {
    const on = createSetOpenExportFolder(true);
    expect(on).toEqual({ type: SET_OPEN_EXPORT_FOLDER, open: true });
    const state = settingsReducer(frozen({ theme: "dark" }), on);
    expect(state).toEqual({ theme: "dark", openExportFolder: true });

    // Off removes the key, anything but true is off
    for (const open of [false, undefined, "yes", 1]) {
      expect(settingsReducer(state, createSetOpenExportFolder(open))).toEqual({
        theme: "dark",
      });
    }
  });

  it("stores the editor keys only for vim and emacs", () => {
    const vim = createSetEditorKeys("vim");
    expect(vim).toEqual({ type: SET_EDITOR_KEYS, keys: "vim" });
    const state = settingsReducer(frozen({ theme: "dark" }), vim);
    expect(state).toEqual({ theme: "dark", editorKeys: "vim" });
    expect(settingsReducer(state, createSetEditorKeys("emacs"))).toEqual({
      theme: "dark",
      editorKeys: "emacs",
    });

    // Normal is the default, anything else is not a mode
    for (const keys of ["normal", undefined, "nano", 1]) {
      expect(settingsReducer(state, createSetEditorKeys(keys))).toEqual({
        theme: "dark",
      });
    }
  });

  it("clears the language for anything but a language code", () => {
    const state = frozen({ theme: "dark", language: "de" });
    for (const language of [undefined, 1, {}, ""]) {
      expect(
        settingsReducer(state, createSetLanguage(language)).language,
      ).toBeUndefined();
    }
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
      panel: {},
    });
  });

  it("opens and closes the export menu and sheet independently", () => {
    const menu = createSetExportMenuOpen(true);
    const sheet = createSetExportSheetOpen(true);
    expect(menu).toEqual({ type: SET_EXPORT_MENU_OPEN, open: true });
    expect(sheet).toEqual({ type: SET_EXPORT_SHEET_OPEN, open: true });

    const open = [menu, sheet].reduce(uiReducer, undefined);
    expect(open).toMatchObject({ exportMenuOpen: true, exportSheetOpen: true });
    expect(
      uiReducer(frozen(open), createSetExportMenuOpen(false)),
    ).toMatchObject({ exportMenuOpen: false, exportSheetOpen: true });
  });

  it("keeps the state of the edit panel by key", () => {
    const set = createSetPanelState("cards:a", [{ open: false }]);
    expect(set).toEqual({
      type: SET_PANEL_STATE,
      key: "cards:a",
      value: [{ open: false }],
    });
    const state = [set, createSetPanelState("group:b", true)].reduce(
      uiReducer,
      undefined,
    );
    expect(state.panel).toEqual({
      "cards:a": [{ open: false }],
      "group:b": true,
    });
    expect(selectPanelState({ ui: state }, "group:b")).toBe(true);
    expect(selectPanelState({ ui: state }, "none")).toBeUndefined();
    expect(selectPanelState({}, "none")).toBeUndefined();
  });

  it("forgets the state of the edit panel when the game is replaced", () => {
    const state = frozen({
      exportMenuOpen: true,
      exportSheetOpen: false,
      panel: { "group:legend": true },
    });
    expect(uiReducer(state, createSetGame(game()))).toEqual({
      ...state,
      panel: {},
    });
    expect(uiReducer(state, createDeleteGame("system:a"))).toEqual({
      ...state,
      panel: {},
    });
    expect(uiReducer(state, createSetGame(game(), { keepEdits: true }))).toBe(
      state,
    );
  });

  it("ignores other actions", () => {
    const state = frozen({ exportMenuOpen: true, exportSheetOpen: false });
    expect(uiReducer(state, clearAlert())).toBe(state);
  });
});
