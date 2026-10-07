import { createLoadGame, loadErrorCode } from "../../electron/main/loadGame.js";

const setup = ({ summary = { path: "/g.json" }, load } = {}) => {
  const deps = {
    summaryOf: vi.fn(() => summary),
    loadGame: vi.fn(load ?? (async () => ({ game: true }))),
    watch: vi.fn(),
    stopWatching: vi.fn(),
    deleteGame: vi.fn(),
  };
  return { deps, handler: createLoadGame(deps) };
};

const errorWith = (props) => Object.assign(new Error("boom"), props);

describe("loadErrorCode", () => {
  it("goes by the code or the class of the error, not its message", () => {
    expect(loadErrorCode(errorWith({ code: "ENOENT" }))).toBe("missing");
    expect(loadErrorCode(new SyntaxError("Unexpected token"))).toBe("invalid");
    expect(loadErrorCode(new Error("ENOENT: no such file"))).toBe("unreadable");
    expect(loadErrorCode(errorWith({ code: "EACCES" }))).toBe("unreadable");
    expect(loadErrorCode(undefined)).toBe("unreadable");
  });
});

describe("the loadGame channel", () => {
  it("loads the game and watches its file", async () => {
    const { deps, handler } = setup();
    expect(await handler({}, "abc")).toEqual({ game: true });
    expect(deps.watch).toHaveBeenCalledWith("abc");
  });

  it("rejects a game that is not known, forgetting nothing", async () => {
    const { deps, handler } = setup({ summary: null });
    await expect(handler({}, "abc")).rejects.toThrow("not found");
    await expect(handler({}, 5)).rejects.toThrow("not found");
    expect(deps.loadGame).not.toHaveBeenCalled();
    expect(deps.deleteGame).not.toHaveBeenCalled();
  });

  it("forgets a game whose file is gone", async () => {
    const { deps, handler } = setup({
      load: async () => {
        throw errorWith({ code: "ENOENT" });
      },
    });
    await expect(handler({}, "abc")).rejects.toThrow("game-load:missing");
    expect(deps.stopWatching).toHaveBeenCalledWith("abc");
    expect(deps.deleteGame).toHaveBeenCalledWith("abc");
    expect(deps.watch).not.toHaveBeenCalled();
  });

  it("keeps a game whose file is not valid or can not be read", async () => {
    const invalid = setup({
      load: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    });
    await expect(invalid.handler({}, "abc")).rejects.toThrow(
      "game-load:invalid",
    );
    const locked = setup({
      load: async () => {
        throw errorWith({ code: "EBUSY" });
      },
    });
    await expect(locked.handler({}, "abc")).rejects.toThrow(
      "game-load:unreadable",
    );
    for (const { deps } of [invalid, locked]) {
      expect(deps.deleteGame).not.toHaveBeenCalled();
    }
  });
});
