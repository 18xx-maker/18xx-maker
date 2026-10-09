import "@tests/support/windowStub.js";

import { games } from "@/data";
import {
  createAlert,
  createDeleteGame,
  createSetGame,
  createSetSummaries,
  deleteGame,
  loadGame,
  loadSummaries,
  refreshGame,
  saveGameAs,
} from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

vi.mock("react-i18next", () => ({
  getI18n: () => ({ t: (key) => key }),
}));
vi.mock("@/util/storage/idb", () => ({
  TYPE: "system",
  createGameFile: vi.fn(),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
}));
vi.mock("@/util/storage/opfs", () => ({
  TYPE: "internal",
  saveGameAs: vi.fn(),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
}));

const game = (type, id) => ({
  info: { title: "My Game", designer: "d" },
  meta: { id, type, slug: `${type}:${id}` },
});

const original = { ...capability };
let dispatch;
let state;
const getState = () => state;
const types = () => dispatch.mock.calls.map(([action]) => action);

beforeEach(() => {
  dispatch = vi.fn();
  state = {};
  vi.resetAllMocks();
  Object.assign(capability, {
    electron: false,
    internal: true,
    system: true,
  });
});

afterEach(() => {
  Object.assign(capability, original);
  delete window.api;
});

describe("loadGame", () => {
  it("loads a bundled game", async () => {
    const result = await loadGame("bundled:1889")(dispatch, getState);
    expect(result).toBe(games["1889"]);
    expect(types()).toEqual([
      createSetGame(games["1889"]),
      createAlert(
        "Game Loaded",
        `Bundled game ${games["1889"].info.title} loaded`,
        "success",
      ),
    ]);
  });

  it("a quiet load sets the game without alerts", async () => {
    state = {};
    await loadGame("bundled:1889", true)(dispatch, getState);
    expect(types()).toEqual([createSetGame(games["1889"])]);
  });

  it("a quiet load keeps a game that was opened meanwhile", async () => {
    state = { game: games["1889"] };
    await loadGame("bundled:1889", true)(dispatch, getState);
    expect(types()).toEqual([]);
  });

  it("a quiet load keeps a game opened while its images were read", async () => {
    // Reading the images dispatches them; the user opens a game meanwhile
    dispatch.mockImplementation(() => {
      state = { game: games["1889"], assets: {} };
    });
    await loadGame("bundled:18Test", true)(dispatch, getState);
    expect(types().map((action) => action.type)).toEqual(["SET_ASSETS"]);
  });

  it("a quiet load fails without an alert", async () => {
    await expect(
      loadGame("bundled:nope", true)(dispatch, getState),
    ).rejects.toThrow("not found");
    expect(types()).toEqual([]);
  });

  it.each([
    ["system", idb, "System"],
    ["internal", opfs, "Internal"],
  ])("loads a %s game", async (type, mod, label) => {
    const g = game(type, "abc");
    mod.loadGame.mockResolvedValue(g);

    await expect(loadGame(`${type}:abc`)(dispatch, getState)).resolves.toBe(g);
    expect(mod.loadGame).toHaveBeenCalledWith("abc");
    expect(types()).toEqual([
      createSetGame(g),
      createAlert("Game Loaded", `${label} game My Game loaded`, "success"),
    ]);
  });

  it("loads an electron game through window.api", async () => {
    capability.electron = true;
    const g = game("electron", "abc");
    window.api = { loadGame: vi.fn().mockResolvedValue(g) };

    await loadGame("electron:abc")(dispatch, getState);
    expect(window.api.loadGame).toHaveBeenCalledWith("abc");
    expect(types()).toEqual([
      createSetGame(g),
      createAlert("Game Loaded", "Electron game My Game loaded", "success"),
    ]);
  });

  it.each([
    ["bundled:nope", "Bundled game nope not found", () => {}],
    [
      "system:abc",
      "Your browser doesn't support loading games from your file system",
      () => (capability.system = false),
    ],
    [
      "internal:abc",
      "Your browser doesn't support loading games from the private internal file system",
      () => (capability.internal = false),
    ],
    [
      "electron:abc",
      "Your browser doesn't support loading games from the file system",
      () => {},
    ],
    ["wat:abc", "Unknown game type wat", () => {}],
  ])(
    "%s rejects and dispatches an error alert",
    async (slug, message, setup) => {
      setup();
      await expect(loadGame(slug)(dispatch, getState)).rejects.toThrow(message);
      expect(types()).toEqual([createAlert("Error", message, "error")]);
    },
  );

  it("dispatches the loader's error and rethrows it", async () => {
    const error = new Error("File was not valid");
    error.name = "SyntaxError";
    idb.loadGame.mockRejectedValue(error);

    await expect(loadGame("system:abc")(dispatch, getState)).rejects.toBe(
      error,
    );
    expect(types()).toEqual([
      createAlert("SyntaxError", "File was not valid", "error"),
    ]);
  });
});

describe("deleteGame", () => {
  it.each([
    ["system", idb, "System"],
    ["internal", opfs, "Internal"],
  ])("deletes a %s game", async (type, mod, label) => {
    mod.deleteGame.mockResolvedValue();
    const slug = `${type}:abc`;

    await expect(deleteGame(slug, "My Game")(dispatch)).resolves.toBe(slug);
    expect(mod.deleteGame).toHaveBeenCalledWith("abc");
    expect(types()).toEqual([
      createDeleteGame(slug),
      createAlert(
        "Game Forgotten",
        `${label} game My Game forgotten`,
        "success",
      ),
    ]);
  });

  it("deletes an electron game", async () => {
    capability.electron = true;
    window.api = { deleteGame: vi.fn().mockResolvedValue() };

    await deleteGame("electron:abc", "My Game")(dispatch);
    expect(window.api.deleteGame).toHaveBeenCalledWith("abc");
    expect(types()).toEqual([
      createDeleteGame("electron:abc"),
      createAlert(
        "Game Forgotten",
        "Electron game My Game forgotten",
        "success",
      ),
    ]);
  });

  it.each([
    ["bundled:1889", "Cannot forget bundled game: My Game", () => {}],
    [
      "system:abc",
      "Your browser doesn't support deleting games from your file system",
      () => (capability.system = false),
    ],
    [
      "internal:abc",
      "Your browser doesn't support deleting games from the private internal file system",
      () => (capability.internal = false),
    ],
    [
      "electron:abc",
      "Your browser doesn't support deleting games from the file system",
      () => {},
    ],
    ["wat:abc", "Unknown game type wat", () => {}],
  ])(
    "%s rejects with an error alert and no delete",
    async (slug, message, setup) => {
      setup();
      await expect(deleteGame(slug, "My Game")(dispatch)).rejects.toThrow(
        message,
      );
      expect(types()).toEqual([createAlert("Error", message, "error")]);
      expect(idb.deleteGame).not.toHaveBeenCalled();
      expect(opfs.deleteGame).not.toHaveBeenCalled();
    },
  );

  it("alerts and rethrows when the delete fails", async () => {
    const error = new Error("denied");
    error.name = "NotAllowedError";
    idb.deleteGame.mockRejectedValue(error);

    await expect(deleteGame("system:abc", "T")(dispatch)).rejects.toBe(error);
    expect(types()).toEqual([
      createAlert("NotAllowedError", "denied", "error"),
    ]);
  });
});

describe("refreshGame", () => {
  it.each([
    ["nothing is loaded", undefined],
    ["a bundled game is loaded", { type: "bundled", id: "1889" }],
    ["an internal game is loaded", { type: "internal", id: "abc" }],
  ])("does nothing when %s", (_name, loadedGame) => {
    state = { loadedGame };
    expect(refreshGame()(dispatch, getState)).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(idb.loadGame).not.toHaveBeenCalled();
  });

  it("reloads a system game from the file system", async () => {
    state = { loadedGame: { type: "system", id: "abc" } };
    const g = game("system", "abc");
    idb.loadGame.mockResolvedValue(g);

    await expect(refreshGame()(dispatch, getState)).resolves.toBe(g);
    expect(idb.loadGame).toHaveBeenCalledWith("abc");
    expect(types()).toEqual([
      createSetGame(g),
      createAlert(
        "Game Refreshed",
        "abc refreshed from file system",
        "success",
      ),
    ]);
  });

  it("alerts and rethrows on failure", async () => {
    state = { loadedGame: { type: "system", id: "abc" } };
    const error = new Error("gone");
    idb.loadGame.mockRejectedValue(error);

    await expect(refreshGame()(dispatch, getState)).rejects.toBe(error);
    expect(types()).toEqual([createAlert("Error", "gone", "error")]);
  });
});

describe("loadSummaries", () => {
  it("loads both internal and system summaries", async () => {
    opfs.loadSummaries.mockResolvedValue({ a: 1 });
    idb.loadSummaries.mockResolvedValue({ b: 2 });

    await loadSummaries()(dispatch);
    expect(types()).toEqual([
      createSetSummaries({ internal: { a: 1 }, system: { b: 2 } }),
    ]);
  });

  it("skips unsupported system storage", async () => {
    capability.system = false;
    opfs.loadSummaries.mockResolvedValue({ a: 1 });

    await loadSummaries()(dispatch);
    expect(idb.loadSummaries).not.toHaveBeenCalled();
    expect(types()).toEqual([
      createSetSummaries({ internal: { a: 1 }, system: undefined }),
    ]);
  });

  it("skips unsupported internal storage", async () => {
    capability.internal = false;
    idb.loadSummaries.mockResolvedValue({ b: 2 });

    await loadSummaries()(dispatch);
    expect(opfs.loadSummaries).not.toHaveBeenCalled();
    expect(types()).toEqual([
      createSetSummaries({ internal: undefined, system: { b: 2 } }),
    ]);
  });

  it("keeps the other store when one fails and logs it once", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    opfs.loadSummaries.mockRejectedValue(new Error("opfs down"));
    idb.loadSummaries.mockResolvedValue({ b: 2 });

    await loadSummaries()(dispatch);
    await loadSummaries()(dispatch);

    expect(types()).toEqual([
      createSetSummaries({ system: { b: 2 } }),
      createSetSummaries({ system: { b: 2 } }),
    ]);
    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });

  it("uses window.api on electron and returns the promise", async () => {
    capability.electron = true;
    window.api = { loadSummaries: vi.fn().mockResolvedValue({ e: 1 }) };

    await loadSummaries()(dispatch);
    expect(opfs.loadSummaries).not.toHaveBeenCalled();
    expect(types()).toEqual([createSetSummaries({ e: 1 })]);
  });
});

describe("saveGameAs", () => {
  const bundled = () => ({ ...game("bundled", "1889"), map: { edited: true } });
  const dialog = { title: "Save as", filter: "Game" };
  const run = (options = {}) =>
    saveGameAs({ name: "My Game", dialog, ...options })(dispatch, getState);

  beforeEach(() => {
    state = { game: bundled() };
  });

  it("writes the private file system copy and gives its slug", async () => {
    opfs.saveGameAs.mockResolvedValue("internal:my-game");

    expect(await run()).toBe("internal:my-game");

    expect(opfs.saveGameAs).toHaveBeenCalledWith(
      "My Game",
      expect.stringContaining('"edited": true'),
      { overwrite: false },
    );
    expect(JSON.parse(opfs.saveGameAs.mock.calls[0][1]).meta).toBeUndefined();
    // Only an alert: the page of the new game loads it
    expect(types().map((action) => action.type)).not.toContain("SET_GAME");
    expect(types()[0].alert.type).toBe("success");
  });

  it("passes overwrite on", async () => {
    opfs.saveGameAs.mockResolvedValue("internal:my-game");
    await run({ overwrite: true });
    expect(opfs.saveGameAs.mock.calls[0][2]).toEqual({ overwrite: true });
  });

  it("rethrows a name that is taken or not usable and alerts nothing", async () => {
    for (const code of ["exists", "invalid"]) {
      opfs.saveGameAs.mockRejectedValue(
        Object.assign(new Error("x"), { code }),
      );
      await expect(run()).rejects.toMatchObject({ code });
    }
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("uses the file picker with a file name", async () => {
    Object.assign(capability, {
      system: true,
      apis: { save_file_picker: true },
    });
    idb.createGameFile.mockResolvedValue("system:abc");

    expect(await run({ name: "My Game" })).toBe("system:abc");

    expect(idb.createGameFile).toHaveBeenCalledWith(
      expect.any(String),
      "My Game.json",
    );
    expect(opfs.saveGameAs).not.toHaveBeenCalled();
  });

  it("asks the Electron app with the translated labels", async () => {
    Object.assign(capability, { electron: true });
    window.api = { saveGameAs: vi.fn(async () => "electron:abc") };

    expect(await run()).toBe("electron:abc");

    expect(window.api.saveGameAs).toHaveBeenCalledWith(
      "My Game",
      expect.any(String),
      "Save as",
      "Game",
      undefined,
    );
  });

  it("sends the custom images of the game for the main process to write", async () => {
    Object.assign(capability, { electron: true });
    window.api = { saveGameAs: vi.fn(async () => "electron:abc") };
    const star = '<svg viewBox="0 0 1 1"/>';
    state = {
      game: bundled(),
      assets: {
        "bundled:1889": { icons: { star }, logos: {}, trains: {} },
      },
    };

    await run();

    expect(window.api.saveGameAs.mock.calls[0][4]).toEqual({
      icons: { star },
      logos: {},
      trains: {},
    });
  });

  it("does nothing when the dialog is cancelled", async () => {
    Object.assign(capability, { electron: true });
    window.api = { saveGameAs: vi.fn(async () => undefined) };

    expect(await run()).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("alerts a failure and gives no slug", async () => {
    opfs.saveGameAs.mockRejectedValue(new Error("disk full"));

    expect(await run()).toBeUndefined();

    expect(types()).toHaveLength(1);
    expect(types()[0].alert).toMatchObject({
      type: "error",
      message: "disk full",
    });
  });

  it("does nothing for a game that has a file or without a place to save", async () => {
    state = { game: game("internal", "abc") };
    expect(await run()).toBeUndefined();
    state = { game: bundled() };
    Object.assign(capability, { internal: false, system: false });
    expect(await run()).toBeUndefined();
    expect(opfs.saveGameAs).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
