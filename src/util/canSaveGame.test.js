import "@tests/support/windowStub.js";

import { canSaveGameAs, saveAsBackend } from "@/util/canSaveGame";
import capability from "@/util/capability";
import * as renderInput from "@/util/renderInput";

const original = { ...capability, apis: { ...capability.apis } };

const set = ({ electron = false, system = false, internal = false } = {}) =>
  Object.assign(capability, {
    electron,
    system,
    internal,
    apis: { ...original.apis, save_file_picker: system },
  });

afterEach(() => {
  Object.assign(capability, original);
  delete window.api;
  vi.restoreAllMocks();
});

describe("canSaveGameAs", () => {
  it("is for bundled games only", () => {
    set({ internal: true });
    expect(canSaveGameAs("bundled")).toBe(true);
    for (const type of ["internal", "system", "electron"]) {
      expect(canSaveGameAs(type)).toBe(false);
    }
  });

  it("needs a place to save", () => {
    set();
    expect(canSaveGameAs("bundled")).toBe(false);
    expect(saveAsBackend("bundled")).toBeUndefined();
  });

  it("is the Electron dialog only when the app has the call", () => {
    set({ electron: true });
    expect(canSaveGameAs("bundled")).toBe(false);
    window.api = { saveGameAs: () => {} };
    expect(saveAsBackend("bundled")).toBe("electron");
  });

  it("is the picker with the file system and a save picker", () => {
    set({ system: true });
    expect(saveAsBackend("bundled")).toBe("picker");
    // A browser with an open picker but no save picker has nothing here
    capability.apis.save_file_picker = false;
    expect(canSaveGameAs("bundled")).toBe(false);
  });

  it("falls back to the private file system", () => {
    set({ internal: true });
    expect(saveAsBackend("bundled")).toBe("internal");
  });

  it("prefers Electron, then the picker, then the private file system", () => {
    set({ electron: true, system: true, internal: true });
    window.api = { saveGameAs: () => {} };
    expect(saveAsBackend("bundled")).toBe("electron");
    delete window.api;
    expect(saveAsBackend("bundled")).toBe("picker");
    capability.apis.save_file_picker = false;
    expect(saveAsBackend("bundled")).toBe("internal");
  });

  it("is never available in render mode", () => {
    set({ electron: true, system: true, internal: true });
    window.api = { saveGameAs: () => {} };
    vi.spyOn(renderInput, "getRenderInput").mockReturnValue({ id: "x" });
    expect(canSaveGameAs("bundled")).toBe(false);
  });
});
