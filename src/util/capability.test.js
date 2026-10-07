import "@tests/support/windowStub.js";

afterEach(() => {
  delete window.showOpenFilePicker;
  delete window.showSaveFilePicker;
  vi.resetModules();
});

const load = async () => (await import("@/util/capability")).default;

describe("capability", () => {
  it("knows the save file picker apart from the open one", async () => {
    window.showOpenFilePicker = () => {};
    expect((await load()).apis.save_file_picker).toBe(false);

    vi.resetModules();
    window.showSaveFilePicker = () => {};
    const capability = await load();
    expect(capability.apis.save_file_picker).toBe(true);
  });
});
