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

  it("names the capital of a letter typed with Shift only", () => {
    const names = keys("normal", false);
    expect(names).toEqual(
      expect.arrayContaining(["Shift-Alt-f", "Shift-Alt-F", "Mod-F", "Mod-G"]),
    );
    // Mod-f and Mod-g have no capital of their own: Mod-F is the Format key
    // and Mod-G the Previous match, never Search and Next match
    expect(names).toContain("Mod-f");
    expect(names).toContain("Mod-g");
    expect(names).not.toContain("Shift-Mod-G");
  });

  it("binds no key twice", () => {
    for (const mode of ["normal", "emacs", "vim"]) {
      for (const mac of [true, false]) {
        const names = editorBindings(mode, mac)
          .filter(({ scope }) => !scope)
          .map(({ key }) => key);
        expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
      }
    }
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
