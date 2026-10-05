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
    expect(ipc.sendSync).toHaveBeenCalledWith("getRenderInput", "abc");
  });
});
