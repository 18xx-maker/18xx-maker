// @vitest-environment jsdom

import {
  CONFLICT,
  FAILED,
  SAVED,
  createDeleteGame,
  createEditGame,
  createSetGame,
  createStore,
  editGame,
  loadGame,
  receiveGame,
  reloadGame,
  restoreGame,
  revertGame,
  saveGame,
} from "@/state";
import {
  selectGameChanged,
  selectGameChangedFields,
  selectGameHistory,
  selectGameOriginal,
} from "@/state/selectors";
import capability from "@/util/capability";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

vi.mock("react-i18next", () => ({
  getI18n: () => ({ t: (key) => key }),
}));
vi.mock("@/util/storage/idb", () => ({
  TYPE: "system",
  loadGame: vi.fn(),
  peekGame: vi.fn(),
  requestWrite: vi.fn(),
  writeGame: vi.fn(),
}));
vi.mock("@/util/storage/opfs", () => ({
  TYPE: "internal",
  loadGame: vi.fn(),
  peekGame: vi.fn(),
  overwriteGame: vi.fn(),
}));

const game = (type = "internal", id = "a", extra = {}) => ({
  info: { title: "Game A" },
  meta: { id, type, slug: `${type}:${id}` },
  ...extra,
});

const original = { ...capability };
let store;
const state = () => store.getState();

beforeEach(() => {
  vi.resetAllMocks();
  Object.assign(capability, { electron: false, internal: true, system: true });
  store = createStore({ render: true, preloadedState: {} });
});

afterEach(() => {
  Object.assign(capability, original);
  delete window.api;
});

describe("editing", () => {
  it("starts clean: the original is the loaded game", () => {
    store.dispatch(createSetGame(game()));
    expect(selectGameOriginal(state())).toEqual(game());
    expect(selectGameChanged(state())).toBe(false);
    expect(selectGameChangedFields(state())).toEqual([]);
  });

  it("an edit changes the game and leaves the original and summaries", () => {
    store.dispatch(createSetGame(game()));
    const loaded = state().loadedGame;
    store.dispatch(createEditGame(game("internal", "a", { n: 1 })));

    expect(state().game.n).toBe(1);
    expect(selectGameOriginal(state()).n).toBeUndefined();
    expect(selectGameChanged(state())).toBe(true);
    expect(selectGameChangedFields(state())).toEqual(["n"]);
    expect(state().loadedGame).toBe(loaded);
  });

  it("keeps the meta of the game on an edit", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame({ info: { title: "x" } }));
    expect(state().game.meta.slug).toBe("internal:a");
  });

  it("ignores an edit without a game", () => {
    store.dispatch(createEditGame(game()));
    expect(state().game).toBeUndefined();
  });

  it("is clean again when the edit is undone", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(game("internal", "a", { n: 1 })));
    store.dispatch(createEditGame(game()));
    expect(selectGameChanged(state())).toBe(false);
  });

  it("editGame passes the game to the function", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(editGame((g) => ({ ...g, n: 2 })));
    expect(state().game.n).toBe(2);
  });

  it("editGame does nothing without a game", () => {
    store.dispatch(editGame((g) => g));
    expect(state().game).toBeUndefined();
  });

  it("revertGame puts the original back", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(game("internal", "a", { n: 1 })));
    store.dispatch(revertGame());
    expect(selectGameChanged(state())).toBe(false);
    store.dispatch(createDeleteGame("internal:a"));
    store.dispatch(revertGame());
    expect(state().game).toBeUndefined();
  });

  it("setting a game again resets the original, deleting clears it", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(game("internal", "a", { n: 1 })));
    store.dispatch(createSetGame(game()));
    expect(selectGameChanged(state())).toBe(false);

    store.dispatch(createDeleteGame("internal:other"));
    expect(selectGameOriginal(state())).toBeDefined();
    store.dispatch(createDeleteGame("internal:a"));
    expect(selectGameOriginal(state())).toBeUndefined();
    store.dispatch(createSetGame(game()));
    store.dispatch(createSetGame(undefined));
    expect(selectGameOriginal(state())).toBeUndefined();
  });

  it("keepEdits keeps the edits and replaces only the original", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(game("internal", "a", { n: 1 })));
    store.dispatch(
      createSetGame(game("internal", "a", { m: 1 }), { keepEdits: true }),
    );
    expect(state().game.n).toBe(1);
    expect(state().game.m).toBeUndefined();
    expect(selectGameOriginal(state()).m).toBe(1);
    expect(selectGameChangedFields(state())).toEqual(["m", "n"]);
  });
});

describe("loadGame with edits", () => {
  it("does not throw away the edits of the open game", async () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(game("internal", "a", { n: 1 })));
    opfs.loadGame.mockResolvedValue(game());

    await loadGame("internal:a")(store.dispatch, store.getState);

    expect(state().game.n).toBe(1);
  });

  it("loads over a clean game of the same slug", async () => {
    store.dispatch(createSetGame(game()));
    opfs.loadGame.mockResolvedValue(game("internal", "a", { m: 1 }));

    await loadGame("internal:a")(store.dispatch, store.getState);

    expect(state().game.m).toBe(1);
  });
});

describe("history and restore", () => {
  const edited = () => game("internal", "a", { n: 1 });

  it("a save adds what it replaced and makes the edited game the original", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(edited()));
    store.dispatch({
      type: "GAME_SAVED",
      game: state().game,
      previous: game(),
      savedAt: 5,
    });

    expect(selectGameHistory(state())).toEqual([{ savedAt: 5, game: game() }]);
    expect(selectGameChanged(state())).toBe(false);
    expect(state().game.n).toBe(1);
    expect(state().loadedGame.title).toBe("Game A");
  });

  it("restoreGame sets a history game as the edited game", () => {
    store.dispatch(createSetGame(game()));
    store.dispatch(createEditGame(edited()));
    store.dispatch({
      type: "GAME_SAVED",
      game: state().game,
      previous: game(),
      savedAt: 5,
    });
    store.dispatch(restoreGame(0));

    expect(state().game.n).toBeUndefined();
    expect(selectGameChanged(state())).toBe(true);
    expect(selectGameHistory(state())).toHaveLength(1);
    store.dispatch(restoreGame(7));
    expect(state().game.n).toBeUndefined();
  });

  it("history stays for the same game and clears for another or a delete", () => {
    const save = () => {
      store.dispatch(createEditGame(edited()));
      store.dispatch({
        type: "GAME_SAVED",
        game: state().game,
        previous: game(),
        savedAt: 5,
      });
    };
    store.dispatch(createSetGame(game()));
    save();
    store.dispatch(createSetGame(game()));
    expect(selectGameHistory(state())).toHaveLength(1);
    store.dispatch(createDeleteGame("internal:other"));
    expect(selectGameHistory(state())).toHaveLength(1);
    store.dispatch(createSetGame(game("internal", "b")));
    expect(selectGameHistory(state())).toEqual([]);

    store.dispatch(createSetGame(game()));
    save();
    store.dispatch(createDeleteGame("internal:a"));
    expect(selectGameHistory(state())).toEqual([]);

    store.dispatch(createSetGame(game()));
    save();
    store.dispatch(createSetGame(undefined));
    expect(selectGameHistory(state())).toEqual([]);
  });
});

describe("saveGame", () => {
  const open = (type, extra = {}) => {
    store.dispatch(createSetGame(game(type)));
    store.dispatch(createEditGame(game(type, "a", { n: 1, ...extra })));
  };
  const text = (type) =>
    JSON.stringify({ info: { title: "Game A" }, n: 1 }, null, 2) ||
    String(type);

  it("writes an internal game after reading the file", async () => {
    open("internal");
    opfs.peekGame.mockResolvedValue(game("internal"));

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      SAVED,
    );

    expect(opfs.overwriteGame).toHaveBeenCalledWith("a", text());
    expect(selectGameChanged(state())).toBe(false);
    expect(selectGameHistory(state())).toHaveLength(1);
    expect(state().alert).toMatchObject({ type: "success" });
  });

  it("asks for permission first and writes a system game", async () => {
    open("system");
    idb.peekGame.mockResolvedValue(game("system"));

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      SAVED,
    );

    expect(idb.requestWrite).toHaveBeenCalledWith("a");
    expect(idb.writeGame).toHaveBeenCalledWith("a", text());
    expect(idb.requestWrite.mock.invocationCallOrder[0]).toBeLessThan(
      idb.writeGame.mock.invocationCallOrder[0],
    );
  });

  it("writes an electron game through the api with the original", async () => {
    capability.electron = true;
    window.api = {
      saveGame: vi.fn(async () => ({ previous: { info: { title: "Old" } } })),
    };
    open("electron");

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      SAVED,
    );

    expect(window.api.saveGame).toHaveBeenCalledWith("a", text(), {
      info: { title: "Game A" },
    });
    // What the file had is what lands in the history
    expect(selectGameHistory(state())[0].game.info.title).toBe("Old");
    expect(selectGameHistory(state())[0].game.meta.slug).toBe("electron:a");
  });

  it("an electron save that finds the file changed is a conflict", async () => {
    capability.electron = true;
    window.api = { saveGame: vi.fn(async () => ({ conflict: true })) };
    open("electron");

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      CONFLICT,
    );
    expect(selectGameChanged(state())).toBe(true);
    expect(selectGameHistory(state())).toEqual([]);
  });

  it("an electron forced save sends no original", async () => {
    capability.electron = true;
    window.api = { saveGame: vi.fn(async () => ({ previous: null })) };
    open("electron");

    await saveGame({ force: true })(store.dispatch, store.getState);

    expect(window.api.saveGame.mock.calls[0][2]).toBeNull();
    expect(selectGameHistory(state())[0].game.info.title).toBe("Game A");
  });

  it("does not write over a file that changed outside the app", async () => {
    open("internal");
    opfs.peekGame.mockResolvedValue(game("internal", "a", { other: 1 }));

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      CONFLICT,
    );
    expect(opfs.overwriteGame).not.toHaveBeenCalled();
    expect(selectGameChanged(state())).toBe(true);
  });

  it("a forced save overwrites and keeps the replaced file in the history", async () => {
    open("internal");
    opfs.peekGame.mockResolvedValue(game("internal", "a", { other: 1 }));

    await expect(
      saveGame({ force: true })(store.dispatch, store.getState),
    ).resolves.toBe(SAVED);

    expect(opfs.overwriteGame).toHaveBeenCalled();
    expect(selectGameHistory(state())[0].game.other).toBe(1);
  });

  it("a failed write changes nothing and alerts", async () => {
    open("internal");
    opfs.peekGame.mockResolvedValue(game("internal"));
    opfs.overwriteGame.mockRejectedValue(new Error("disk full"));

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      FAILED,
    );

    expect(selectGameChanged(state())).toBe(true);
    expect(selectGameHistory(state())).toEqual([]);
    expect(state().alert).toMatchObject({
      type: "error",
      message: "disk full",
    });
  });

  it("a denied permission fails without writing", async () => {
    open("system");
    idb.requestWrite.mockRejectedValue(new Error("Permission denied"));

    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      FAILED,
    );
    expect(idb.writeGame).not.toHaveBeenCalled();
  });

  it("refuses bundled games and a missing game", async () => {
    store.dispatch(createSetGame(game("bundled")));
    store.dispatch(createEditGame(game("bundled", "a", { n: 1 })));
    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      FAILED,
    );
    store.dispatch(createDeleteGame("bundled:a"));
    await expect(saveGame()(store.dispatch, store.getState)).resolves.toBe(
      FAILED,
    );
  });
});

describe("reloadGame", () => {
  it.each([
    ["internal", () => opfs.loadGame],
    ["system", () => idb.loadGame],
  ])("replaces the edits with the %s file", async (type, loader) => {
    store.dispatch(createSetGame(game(type)));
    store.dispatch(createEditGame(game(type, "a", { n: 1 })));
    loader().mockResolvedValue(game(type, "a", { m: 1 }));

    await reloadGame()(store.dispatch, store.getState);

    expect(state().game.m).toBe(1);
    expect(selectGameChanged(state())).toBe(false);
  });

  it("reloads an electron game through the api", async () => {
    capability.electron = true;
    window.api = {
      saveGame: vi.fn(),
      loadGame: vi.fn(async () => game("electron", "a", { m: 1 })),
    };
    store.dispatch(createSetGame(game("electron")));

    await reloadGame()(store.dispatch, store.getState);

    expect(state().game.m).toBe(1);
  });

  it("alerts when the file can not be read, bundled games do nothing", async () => {
    store.dispatch(createSetGame(game("internal")));
    opfs.loadGame.mockRejectedValue(new Error("gone"));
    await reloadGame()(store.dispatch, store.getState);
    expect(state().alert).toMatchObject({ type: "error", message: "gone" });

    store.dispatch(createSetGame(game("bundled")));
    await reloadGame()(store.dispatch, store.getState);
    expect(opfs.loadGame).toHaveBeenCalledTimes(1);
  });
});

describe("receiveGame (the file changed outside the app)", () => {
  it("loads a changed file over a clean game with an alert", () => {
    store.dispatch(createSetGame(game("electron")));
    store.dispatch(receiveGame(game("electron", "a", { m: 1 })));
    expect(state().game.m).toBe(1);
    expect(state().alert).toMatchObject({ type: "success" });
  });

  it("ignores the echo of our own save", () => {
    store.dispatch(createSetGame(game("electron")));
    store.dispatch(createEditGame(game("electron", "a", { n: 1 })));
    store.dispatch({
      type: "GAME_SAVED",
      game: state().game,
      previous: game("electron"),
      savedAt: 1,
    });
    store.dispatch({ type: "CLEAR_ALERT" });

    store.dispatch(receiveGame(game("electron", "a", { n: 1 })));

    expect(state().alert).toEqual({ open: false });
    expect(selectGameHistory(state())).toHaveLength(1);
  });

  it("keeps unsaved edits and rebases them on the new file", () => {
    store.dispatch(createSetGame(game("electron")));
    store.dispatch(createEditGame(game("electron", "a", { n: 1 })));
    store.dispatch(receiveGame(game("electron", "a", { m: 1 })));

    expect(state().game.n).toBe(1);
    expect(selectGameOriginal(state()).m).toBe(1);
    expect(selectGameChangedFields(state())).toEqual(["m", "n"]);
  });

  it("loads a game that is not the open one", () => {
    store.dispatch(createSetGame(game("electron")));
    store.dispatch(receiveGame(game("electron", "b")));
    expect(state().game.meta.id).toBe("b");
  });
});
