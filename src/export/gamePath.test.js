import fs from "node:fs";
import os from "node:os";
import path from "node:path";

vi.mock("electron", () => ({
  app: { getPath: () => process.env.TEST_USER_DATA },
  dialog: {},
  BrowserWindow: vi.fn(),
  Menu: {},
  shell: {},
}));
vi.mock("../../electron/main/dev.js", () => ({ isDev: false }));
vi.mock("../../electron/main/window.js", () => ({ getMainWindow: () => null }));

let dir;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "game-"));
  process.env.TEST_USER_DATA = dir;
  vi.resetModules();
});

afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("saveGamePath", () => {
  it("makes one summary of a file, however many times it is added", async () => {
    const { saveGamePath } = await import("../../electron/main/game.js");
    const { getSummaries } = await import("../../electron/main/config.js");
    const game = path.join(dir, "g.json");
    fs.writeFileSync(game, JSON.stringify({ info: { title: "One" } }));

    const slug = await saveGamePath(game);
    fs.writeFileSync(game, JSON.stringify({ info: { title: "Two" } }));
    // The same file, written another way
    const again = await saveGamePath(path.join(dir, "x", "..", "g.json"));

    expect(again).toBe(slug);
    const summaries = Object.values(getSummaries());
    expect(summaries).toHaveLength(1);
    // The summary has the info of the file as it is now
    expect(summaries[0]).toMatchObject({ title: "Two", path: game });
  });

  it("gives another file its own summary", async () => {
    const { saveGamePath } = await import("../../electron/main/game.js");
    const { getSummaries } = await import("../../electron/main/config.js");
    for (const name of ["a.json", "b.json"]) {
      fs.writeFileSync(path.join(dir, name), JSON.stringify({ info: {} }));
      await saveGamePath(path.join(dir, name));
    }
    expect(Object.keys(getSummaries())).toHaveLength(2);
  });
});

describe("loadGame", () => {
  it("rejects a game that was forgotten, without a TypeError", async () => {
    const { loadGame } = await import("../../electron/main/game.js");
    await expect(loadGame("gone")).rejects.toThrow("not found");
  });
});
