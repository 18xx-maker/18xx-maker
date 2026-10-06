import { editorBindings } from "@/components/editPanel/editorKeys";

const keys = (mode, mac) => editorBindings(mode, mac).map(({ key }) => key);

describe("editor bindings", () => {
  it("has the normal keys in normal mode on every platform", () => {
    for (const mac of [true, false]) {
      expect(keys("normal", mac)).toEqual(
        expect.arrayContaining(["Mod-s", "Mod-f", "Mod-g", "F8", "Shift-F8"]),
      );
    }
  });

  it("names the capital of a letter typed with Shift", () => {
    expect(keys("normal", false)).toEqual(
      expect.arrayContaining(["Shift-Alt-f", "Shift-Alt-F", "Mod-F"]),
    );
  });

  it("leaves Ctrl to Emacs and Vim, except on macOS", () => {
    for (const mode of ["emacs", "vim"]) {
      expect(keys(mode, false)).not.toContain("Mod-s");
      expect(keys(mode, true)).toContain("Mod-s");
    }
  });

  it("leaves the Escape of Vim to Vim", () => {
    const escape = (mode) =>
      editorBindings(mode, false).find(
        ({ key, scope }) => key === "Escape" && !scope,
      );
    expect(escape("vim").run.name).toBe("closeSearchPanel");
    expect(escape("emacs").run.name).toBe("leave");
  });
});
