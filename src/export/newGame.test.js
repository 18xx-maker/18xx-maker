import { createNewGame } from "../../electron/main/newGame.js";

const setup = ({ isMain = true, dialog = {}, known } = {}) => {
  const files = {};
  const calls = [];
  const fs = {
    writeFileSync: vi.fn((path, text) => {
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
  const handler = createNewGame({
    isMain: () => isMain,
    showSaveDialog,
    saveGamePath,
    slugOfPath: (path) => (path === known?.path ? known.slug : undefined),
    fs,
  });
  return { files, calls, fs, saveGamePath, showSaveDialog, handler };
};

describe("the newGame handler", () => {
  it("writes the template before it registers the file and gives the slug", async () => {
    const { files, calls, saveGamePath, showSaveDialog, handler } = setup();

    expect(await handler({}, "My Game")).toBe("electron:new");

    expect(calls).toEqual(["write", "saveGamePath"]);
    expect(saveGamePath).toHaveBeenCalledWith("/games/my-game.json");
    expect(JSON.parse(files["/games/my-game.json"]).info.title).toBe("My Game");
    expect(showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultPath: "my-game.json",
        filters: [{ name: "18xx-maker Game", extensions: ["json"] }],
      }),
    );
  });

  it("does nothing when the dialog is cancelled", async () => {
    const { fs, saveGamePath, handler } = setup({
      dialog: { canceled: true, filePath: undefined },
    });
    expect(await handler({}, "My Game")).toBeUndefined();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(saveGamePath).not.toHaveBeenCalled();
  });

  it("adds the json extension when the path has none", async () => {
    const { files, handler, saveGamePath } = setup({
      dialog: { filePath: "/games/other" },
    });
    await handler({}, "My Game");
    expect(saveGamePath).toHaveBeenCalledWith("/games/other.json");
    expect(files["/games/other.json"]).toBeDefined();
  });

  it("reuses the slug of a file that is already a game", async () => {
    const { saveGamePath, handler } = setup({
      known: { path: "/games/my-game.json", slug: "electron:old" },
    });
    expect(await handler({}, "My Game")).toBe("electron:old");
    expect(saveGamePath).not.toHaveBeenCalled();
  });

  it("uses a default title and file name for an empty title", async () => {
    const { files, showSaveDialog, handler } = setup();
    await handler({}, "  ");
    expect(showSaveDialog.mock.calls[0][0].defaultPath).toBe("new-game.json");
    expect(JSON.parse(files["/games/my-game.json"]).info.title).toBe(
      "New Game",
    );
  });

  it("rejects a sender that is not the main window", async () => {
    const { fs, showSaveDialog, handler } = setup({ isMain: false });
    await expect(handler({}, "My Game")).rejects.toThrow("not available");
    expect(showSaveDialog).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it("rejects a title that is not a string or is too long", async () => {
    const { showSaveDialog, handler } = setup();
    await expect(handler({}, { path: "/etc/x" })).rejects.toThrow("Invalid");
    await expect(handler({}, undefined)).rejects.toThrow("Invalid");
    await expect(handler({}, "x".repeat(201))).rejects.toThrow("Invalid");
    expect(showSaveDialog).not.toHaveBeenCalled();
  });
});
