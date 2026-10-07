import { createApi } from "../../electron/preload/api.js";

const fakeIpc = () => ({
  sendSync: vi.fn(() => ({ id: "18Test" })),
  invoke: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
});

describe("the preload api", () => {
  it("gives the app every call", () => {
    const api = createApi({
      ipcRenderer: fakeIpc(),
      webUtils: {},
      argv: [],
    });

    expect(api.export).toBeTypeOf("function");
    expect(api.chooseExportFolder).toBeTypeOf("function");
    expect(api.deleteGame).toBeTypeOf("function");
    expect(api.saveGame).toBeTypeOf("function");
    expect(api.renderInput).toBeUndefined();
    expect(api.newGame).toBeTypeOf("function");
    expect(api.saveGameAs).toBeTypeOf("function");
  });

  it("asks the main process to save a copy with the labels of its dialog", async () => {
    const ipc = fakeIpc();
    ipc.invoke.mockResolvedValue("electron:abc");
    const api = createApi({ ipcRenderer: ipc, webUtils: {}, argv: [] });

    expect(await api.saveGameAs("my-game", "{}", "Save as", "Game")).toBe(
      "electron:abc",
    );
    expect(ipc.invoke).toHaveBeenCalledWith(
      "saveGameAs",
      "my-game",
      "{}",
      "Save as",
      "Game",
    );
  });

  it("asks the main process for a new game with a title only", async () => {
    const ipc = fakeIpc();
    ipc.invoke.mockResolvedValue("electron:abc");
    const api = createApi({ ipcRenderer: ipc, webUtils: {}, argv: [] });

    expect(await api.newGame("My Game")).toBe("electron:abc");
    expect(ipc.invoke).toHaveBeenCalledWith("newGame", "My Game");
  });

  it("gives a capture window only the input of its export", () => {
    const ipc = fakeIpc();
    const api = createApi({
      ipcRenderer: ipc,
      webUtils: {},
      argv: ["electron", "--render-input=abc"],
    });

    expect(api).toEqual({ renderInput: { id: "18Test" } });
    expect(api.saveGame).toBeUndefined();
    expect(api.newGame).toBeUndefined();
    expect(api.saveGameAs).toBeUndefined();
    expect(ipc.sendSync).toHaveBeenCalledWith("getRenderInput", "abc");
  });
});
