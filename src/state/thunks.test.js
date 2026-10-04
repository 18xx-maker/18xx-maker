// @vitest-environment jsdom

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
} from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import * as opfs from "@/util/opfs";

vi.mock("@/util/idb", () => ({
  TYPE: "system",
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
}));
vi.mock("@/util/opfs", () => ({
  TYPE: "internal",
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
    const result = await loadGame("bundled:1889")(dispatch);
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

    await expect(loadGame(`${type}:abc`)(dispatch)).resolves.toBe(g);
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

    await loadGame("electron:abc")(dispatch);
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
      await expect(loadGame(slug)(dispatch)).rejects.toThrow(message);
      expect(types()).toEqual([createAlert("Error", message, "error")]);
    },
  );

  it("dispatches the loader's error and rethrows it", async () => {
    const error = new Error("File was not valid");
    error.name = "SyntaxError";
    idb.loadGame.mockRejectedValue(error);

    await expect(loadGame("system:abc")(dispatch)).rejects.toBe(error);
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

  it("uses window.api on electron and returns the promise", async () => {
    capability.electron = true;
    window.api = { loadSummaries: vi.fn().mockResolvedValue({ e: 1 }) };

    await loadSummaries()(dispatch);
    expect(opfs.loadSummaries).not.toHaveBeenCalled();
    expect(types()).toEqual([createSetSummaries({ e: 1 })]);
  });
});
