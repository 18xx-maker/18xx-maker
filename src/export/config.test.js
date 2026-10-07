import fs from "node:fs";
import os from "node:os";
import path from "node:path";

vi.mock("electron", () => ({
  app: { getPath: () => process.env.TEST_USER_DATA },
}));
vi.mock("../../electron/main/dev.js", () => ({ isDev: false }));

let dir;
let file;

const load = async (content) => {
  if (content !== undefined) fs.writeFileSync(file, content);
  vi.resetModules();
  return import("../../electron/main/config.js");
};

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "config-"));
  file = path.join(dir, "config.json");
  process.env.TEST_USER_DATA = dir;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.chmodSync(dir, 0o755);
  fs.rmSync(dir, { recursive: true, force: true });
});

const ID = "7d7b5b2e-5a4e-4b8b-9d5c-1f2b3c4d5e6f";
const summary = (id, extra = {}) => ({
  id,
  type: "electron",
  slug: `electron:${id}`,
  title: id,
  ...extra,
});
const EMPTY = JSON.stringify({ summaries: {}, recents: [] });

describe("loadConfig", () => {
  it("keeps a valid config as it is", async () => {
    const config = await load(
      JSON.stringify({ summaries: { [ID]: summary(ID) }, recents: [] }),
    );
    expect(config.getConfig().summaries[ID].title).toBe(ID);
    expect(fs.existsSync(`${file}.bak`)).toBe(false);
  });

  it("starts over from invalid JSON, keeping a copy", async () => {
    const config = await load("{ not json");
    expect(config.getConfig()).toEqual({ summaries: {}, recents: [] });
    expect(fs.readFileSync(`${file}.bak`, "utf8")).toBe("{ not json");
    expect(JSON.parse(fs.readFileSync(file, "utf8"))).toEqual({
      summaries: {},
      recents: [],
    });
  });

  it("does not overwrite a copy that is already there", async () => {
    fs.writeFileSync(`${file}.bak`, "first");
    const config = await load("{ not json");
    config.getConfig();
    expect(fs.readFileSync(`${file}.bak`, "utf8")).toBe("first");
  });

  it("does not throw when a folder is where the file should be", async () => {
    fs.mkdirSync(file);
    const config = await load();
    expect(config.getConfig()).toEqual({ summaries: {}, recents: [] });
    expect(fs.statSync(file).isDirectory()).toBe(true);
  });

  it("does not reset a valid config in a folder that can not be written", async () => {
    if (process.getuid?.() === 0) return;
    const text = JSON.stringify({
      summaries: { old: { id: "old" } },
      recents: [],
    });
    fs.writeFileSync(file, text);
    fs.chmodSync(file, 0o444);
    fs.chmodSync(dir, 0o555);
    const config = await load();
    // Cleaned in memory, and the file was neither reset nor backed up
    expect(config.getConfig().summaries).toEqual({});
    expect(fs.existsSync(`${file}.bak`)).toBe(false);
    expect(fs.readFileSync(file, "utf8")).toBe(text);
  });
});

describe("updateConfig", () => {
  it("writes the file whole and leaves no temporary file", async () => {
    const config = await load(EMPTY);
    config.getConfig();
    config.addRecent("T", "electron:x");
    expect(JSON.parse(fs.readFileSync(file, "utf8")).recents).toEqual([
      { title: "T", slug: "electron:x" },
    ]);
    expect(fs.readdirSync(dir)).toEqual(["config.json"]);
  });

  it("falls back to writing in place when the rename fails", async () => {
    const config = await load(EMPTY);
    const rename = vi.spyOn(fs, "renameSync").mockImplementation(() => {
      throw Object.assign(new Error("busy"), { code: "EPERM" });
    });
    config.getConfig();
    config.addRecent("T", "electron:x");
    expect(rename).toHaveBeenCalled();
    expect(JSON.parse(fs.readFileSync(file, "utf8")).recents).toHaveLength(1);
    expect(fs.readdirSync(dir)).toEqual(["config.json"]);
  });

  it("keeps the config as it is when the temporary write fails", async () => {
    const config = await load(EMPTY);
    const write = fs.writeFileSync;
    vi.spyOn(fs, "writeFileSync").mockImplementation((target, ...rest) => {
      if (String(target).endsWith(".tmp")) {
        write(target, "partial");
        throw new Error("disk full");
      }
      return write(target, ...rest);
    });
    config.getConfig();
    expect(() => config.addRecent("T", "electron:x")).toThrow("disk full");
    expect(fs.readdirSync(dir)).toEqual(["config.json"]);
    expect(fs.readFileSync(file, "utf8")).toBe(EMPTY);
  });
});

describe("getSummary", () => {
  it("finds only games of the config, not inherited keys", async () => {
    const config = await load(
      JSON.stringify({ summaries: { [ID]: summary(ID) }, recents: [] }),
    );
    expect(config.getSummary(ID).id).toBe(ID);
    expect(config.getSummary("constructor")).toBeUndefined();
    expect(config.getSummary("__proto__")).toBeUndefined();
    expect(config.getSummary("toString")).toBeUndefined();
  });
});

describe("deleteGame", () => {
  it("forgets a game that is not there without an error", async () => {
    const config = await load(EMPTY);
    config.getConfig();
    expect(() => config.deleteGame("nope")).not.toThrow();
    expect(() => config.deleteGame(undefined)).not.toThrow();
    expect(config.getConfig().summaries).toEqual({});
  });
});

describe("slugOfPath", () => {
  it("finds a game by its path however it is written", async () => {
    const config = await load(
      JSON.stringify({
        summaries: { [ID]: summary(ID, { path: path.join(dir, "g.json") }) },
        recents: [],
      }),
    );
    expect(config.slugOfPath(path.join(dir, "g.json"))).toBe(`electron:${ID}`);
    expect(config.slugOfPath(path.join(dir, "x", "..", "g.json"))).toBe(
      `electron:${ID}`,
    );
    expect(config.slugOfPath(path.join(dir, "h.json"))).toBeUndefined();
  });
});
