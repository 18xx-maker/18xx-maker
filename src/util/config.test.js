import { isConfigJson, sniffConfigFile } from "@/util/config";

describe("isConfigJson", () => {
  it("accepts settings from the config schema", () => {
    expect(isConfigJson({ margin: 100 })).toBe(true);
    expect(isConfigJson({ font: { size: "0.2in" }, margin: 100 })).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isConfigJson({})).toBe(false);
    expect(isConfigJson([])).toBe(false);
    expect(isConfigJson(null)).toBe(false);
    expect(isConfigJson("margin")).toBe(false);
    expect(isConfigJson({ margin: 100, unknown: 1 })).toBe(false);
    expect(isConfigJson({ info: { title: "Game" }, margin: 100 })).toBe(false);
  });
});

describe("sniffConfigFile", () => {
  const file = (text, name = "config.json") => new File([text], name);

  it("parses a json file of settings", async () => {
    expect(await sniffConfigFile(file('{"margin": 100}'))).toEqual({
      margin: 100,
    });
  });

  it("ignores games, invalid json, other files and missing files", async () => {
    expect(await sniffConfigFile(file('{"info": {}}'))).toBeUndefined();
    expect(await sniffConfigFile(file("{nope"))).toBeUndefined();
    expect(await sniffConfigFile(file("{}"))).toBeUndefined();
    expect(
      await sniffConfigFile(file('{"margin": 100}', "notes.txt")),
    ).toBeUndefined();
    expect(await sniffConfigFile(undefined)).toBeUndefined();
  });

  it("skips files over the size limit", async () => {
    const big = file('{"margin": 100}');
    Object.defineProperty(big, "size", { value: 2 * 1024 * 1024 });
    expect(await sniffConfigFile(big)).toBeUndefined();
  });
});
