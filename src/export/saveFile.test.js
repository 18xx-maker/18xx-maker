import {
  MAX_TEXT,
  createSaveGame,
  createSaveGameAs,
  saveGameText,
} from "../../electron/main/saveFile.js";

const memoryFs = (files) => ({
  readFileSync: vi.fn((path) => {
    if (!(path in files)) throw new Error("ENOENT");
    return files[path];
  }),
  writeFileSync: vi.fn((path, text) => {
    files[path] = text;
  }),
});

describe("saveGameText", () => {
  it("writes the text over the file and gives the game it had", () => {
    const files = { "/g.json": '{"a":1}' };
    const result = saveGameText(
      "/g.json",
      '{"a":2}',
      { a: 1 },
      memoryFs(files),
    );
    expect(result).toEqual({ previous: { a: 1 } });
    expect(files["/g.json"]).toBe('{"a":2}');
  });

  it("does not write when the file is not the game the app loaded", () => {
    const files = { "/g.json": '{"a":3}' };
    const fs = memoryFs(files);
    expect(saveGameText("/g.json", '{"a":2}', { a: 1 }, fs)).toEqual({
      conflict: true,
    });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("writes over a changed file when nothing is expected", () => {
    const files = { "/g.json": '{"a":3}' };
    const result = saveGameText("/g.json", '{"a":2}', null, memoryFs(files));
    expect(result).toEqual({ previous: { a: 3 } });
    expect(files["/g.json"]).toBe('{"a":2}');
  });

  it("is a conflict when a game was expected but the file is gone", () => {
    expect(saveGameText("/x.json", "{}", { a: 1 }, memoryFs({}))).toEqual({
      conflict: true,
    });
  });
});

describe("the saveGame handler", () => {
  const setup = (isMain = true) => {
    const files = { "/g.json": '{"a":1}' };
    const afterSave = vi.fn();
    const handler = createSaveGame({
      isMain: () => isMain,
      summaryOf: (id) => (id === "one" ? { path: "/g.json" } : undefined),
      afterSave,
      fs: memoryFs(files),
    });
    return { files, afterSave, handler };
  };

  it("saves the file of the game in the config and re-arms the watcher", () => {
    const { files, afterSave, handler } = setup();
    expect(handler({}, "one", '{"a":2}', { a: 1 })).toEqual({
      previous: { a: 1 },
    });
    expect(files["/g.json"]).toBe('{"a":2}');
    expect(afterSave).toHaveBeenCalledWith("one");
  });

  it("does not re-arm the watcher after a conflict", () => {
    const { afterSave, handler } = setup();
    expect(handler({}, "one", "{}", { a: 9 })).toEqual({ conflict: true });
    expect(afterSave).not.toHaveBeenCalled();
  });

  it("rejects a sender that is not the main window", () => {
    const { files, handler } = setup(false);
    expect(() => handler({}, "one", "{}", null)).toThrow("not available");
    expect(files["/g.json"]).toBe('{"a":1}');
  });

  it("rejects an unknown id and bad arguments", () => {
    const { handler } = setup();
    expect(() => handler({}, "nope", "{}", null)).toThrow("not found");
    expect(() => handler({}, "one", { a: 2 }, null)).toThrow("Invalid");
    expect(() => handler({}, "../x", "{}", null)).toThrow("not found");
  });
});

describe("the saveGameAs handler", () => {
  const setup = ({ isMain = true, dialog = {}, known, existing = [] } = {}) => {
    const files = {};
    const calls = [];
    const fs = {
      writeFileSync: vi.fn((path, text, options) => {
        if (options?.flag === "wx" && existing.includes(path)) {
          throw Object.assign(new Error("exists"), { code: "EEXIST" });
        }
        calls.push("write");
        files[path] = text;
      }),
    };
    const saveGamePath = vi.fn(async () => {
      calls.push("saveGamePath");
      return "electron:new";
    });
    const showSaveDialog = vi.fn(async () => ({
      canceled: false,
      filePath: "/games/my-game.json",
      ...dialog,
    }));
    const handler = createSaveGameAs({
      isMain: () => isMain,
      showSaveDialog,
      saveGamePath,
      slugOfPath: (path) => (path === known?.path ? known.slug : undefined),
      fs,
    });
    return { files, calls, fs, saveGamePath, showSaveDialog, handler };
  };
  const call = (handler, ...args) =>
    handler({}, "my game", "{}", "Save as", "Game", ...args);

  it("writes the text, then registers the file and gives the slug", async () => {
    const { files, calls, saveGamePath, showSaveDialog, handler } = setup();

    expect(await handler({}, "my game", '{"a":1}', "Save as", "Game")).toBe(
      "electron:new",
    );

    expect(calls).toEqual(["write", "saveGamePath"]);
    expect(files["/games/my-game.json"]).toBe('{"a":1}');
    expect(saveGamePath).toHaveBeenCalledWith("/games/my-game.json");
    expect(showSaveDialog).toHaveBeenCalledWith({
      title: "Save as",
      defaultPath: "my game.json",
      properties: ["showOverwriteConfirmation", "createDirectory"],
      filters: [{ name: "Game", extensions: ["json"] }],
    });
  });

  it("sanitizes only the suggested name", async () => {
    const { showSaveDialog, files, handler } = setup({
      dialog: { filePath: "/chosen/../x/Odd Name.json" },
    });
    await handler({}, "../../etc/pass:wd.json", "{}", "t", "f");
    expect(showSaveDialog.mock.calls[0][0].defaultPath).toBe("passwd.json");
    // The path of the dialog is used exactly
    expect(Object.keys(files)).toEqual(["/chosen/../x/Odd Name.json"]);
  });

  it("suggests a default name when nothing is usable", async () => {
    const { showSaveDialog, handler } = setup();
    await handler({}, "???", "{}", "t", "f");
    expect(showSaveDialog.mock.calls[0][0].defaultPath).toBe("game.json");
  });

  it("does nothing when the dialog is cancelled", async () => {
    const { fs, saveGamePath, handler } = setup({
      dialog: { canceled: true, filePath: undefined },
    });
    expect(await call(handler)).toBeUndefined();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(saveGamePath).not.toHaveBeenCalled();
  });

  it("adds the extension without overwriting a file that has it", async () => {
    const { files, fs, saveGamePath, handler } = setup({
      dialog: { filePath: "/x/a" },
      existing: ["/x/a.json"],
    });
    await expect(call(handler)).rejects.toThrow("already exists");
    expect(files["/x/a.json"]).toBeUndefined();
    expect(fs.writeFileSync.mock.calls[0][2]).toEqual({ flag: "wx" });
    expect(saveGamePath).not.toHaveBeenCalled();
  });

  it("writes plainly when the dialog path has the extension", async () => {
    const { fs, handler } = setup({ existing: ["/games/my-game.json"] });
    await call(handler);
    expect(fs.writeFileSync.mock.calls[0][2]?.flag).toBeUndefined();
  });

  it("registers a path that is already a game only once", async () => {
    const { saveGamePath, handler } = setup({
      known: { path: "/games/my-game.json", slug: "electron:old" },
    });
    expect(await call(handler)).toBe("electron:old");
    expect(saveGamePath).not.toHaveBeenCalled();
  });

  it("rejects a sender that is not the main window", async () => {
    const { fs, showSaveDialog, handler } = setup({ isMain: false });
    await expect(call(handler)).rejects.toThrow("not available");
    expect(showSaveDialog).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("rejects arguments that are not strings or are too long", async () => {
    const { showSaveDialog, handler } = setup();
    const bad = [
      [{}, "{}", "t", "f"],
      ["n", undefined, "t", "f"],
      ["n", "{}", 1, "f"],
      ["n", "{}", "t", null],
      ["n", "not json", "t", "f"],
      ["n", " ".repeat(MAX_TEXT + 1), "t", "f"],
      ["n", "{}", "x".repeat(201), "f"],
      ["n", "{}", "t", "x".repeat(201)],
    ];
    for (const args of bad) {
      await expect(handler({}, ...args)).rejects.toThrow("Invalid");
    }
    expect(showSaveDialog).not.toHaveBeenCalled();
  });

  it("does not reject a long name, it shortens the suggestion", async () => {
    const { showSaveDialog, handler } = setup();
    await handler({}, "x".repeat(500), "{}", "t", "f");
    expect(showSaveDialog.mock.calls[0][0].defaultPath).toBe(
      `${"x".repeat(100)}.json`,
    );
  });
});
