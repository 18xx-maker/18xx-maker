import { createSaveGame, saveGameText } from "../../electron/main/saveFile.js";

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
