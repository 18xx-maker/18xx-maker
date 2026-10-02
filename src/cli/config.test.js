import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stripVTControlCharacters } from "node:util";

// The real config lives in the user's config folder, point it at a temp folder
const paths = vi.hoisted(() => ({ config: "" }));
vi.mock("env-paths", () => ({ default: () => ({ config: paths.config }) }));

let tmp;
let log;

const output = () =>
  log.mock.calls.map((args) => stripVTControlCharacters(args.join(" ")));
const configFile = () => path.join(paths.config, "config.json");
const readConfig = () => JSON.parse(fs.readFileSync(configFile(), "utf-8"));
const importConfig = async () => {
  vi.resetModules();
  return (await import("#cli/config")).default;
};

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-config-"));
  paths.config = path.join(tmp, "nested", "18xx-maker-cli");
  log = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("cli config", () => {
  it("creates an empty config file on first use", async () => {
    const config = await importConfig();
    expect(readConfig()).toEqual({});
    expect(config.get()).toEqual({});
  });

  it("reads an existing config file", async () => {
    fs.mkdirSync(paths.config, { recursive: true });
    fs.writeFileSync(configFile(), '{"b18.author":"Pat"}');

    const config = await importConfig();
    expect(config.get("b18.author")).toBe("Pat");
  });

  it("saves set values to the config file", async () => {
    const config = await importConfig();
    config.set("b18.author", "Pat");
    expect(config.get("b18.author")).toBe("Pat");
    expect(readConfig()).toEqual({ "b18.author": "Pat" });
  });

  it("removes a setting when set to an empty value", async () => {
    const config = await importConfig();
    config.set("b18.author", "Pat");
    config.set("b18.author", "");
    expect(config.get("b18.author")).toBeUndefined();
    expect(readConfig()).toEqual({});
  });

  describe("commands", () => {
    it("set prints the new value", async () => {
      const config = await importConfig();
      config.commands.set("b18.author", "Pat");
      expect(output()).toEqual(["b18.author: Pat"]);
      expect(readConfig()).toEqual({ "b18.author": "Pat" });
    });

    it("get prints the key and value", async () => {
      const config = await importConfig();
      config.set("b18.author", "Pat");
      config.commands.get("b18.author", {});
      expect(output()).toEqual(["b18.author: Pat"]);
    });

    it("get marks missing values as not set", async () => {
      const config = await importConfig();
      config.commands.get("b18.author", {});
      expect(output()).toEqual(["b18.author: Not Set"]);
    });

    it("get prints only the value when raw", async () => {
      const config = await importConfig();
      config.set("b18.author", "Pat");
      config.commands.get("b18.author", { raw: true });
      expect(output()).toEqual(["Pat"]);
    });

    it("list prints every setting with its value and description", async () => {
      const config = await importConfig();
      config.commands.list();
      config.set("b18.author", "Pat");
      config.commands.list();
      expect(output()).toEqual([
        "b18.author Not Set",
        "The default author name to use with b18 boxes\n",
        "b18.author Pat",
        "The default author name to use with b18 boxes\n",
      ]);
    });

    it("file prints the config file path", async () => {
      const config = await importConfig();
      config.commands.file();
      expect(output()).toEqual([configFile()]);
    });
  });
});
