import fs from "node:fs";
import path from "node:path";

import compile from "#cli/compile-schemas";

// Never overwrite the real generated schema
vi.mock("node:fs", async (importOriginal) => {
  const real = await importOriginal();
  const mocked = { ...real.default, writeFileSync: vi.fn() };
  return { ...mocked, default: mocked };
});

const schemas = path.join(import.meta.dirname, "../schemas");
const readSchema = (name) =>
  JSON.parse(fs.readFileSync(path.join(schemas, name), "utf-8"));

describe("compile-schemas", () => {
  let calls;
  let file;
  let written;

  beforeAll(async () => {
    compile();
    // Prettier formats asynchronously
    await vi.waitFor(() => {
      if (fs.writeFileSync.mock.calls.length === 0) {
        throw new Error("tiles.defs.json not written yet");
      }
    });
    calls = fs.writeFileSync.mock.calls.length;
    [file, written] = fs.writeFileSync.mock.calls[0];
  });

  it("writes tiles.defs.json once, next to the other schemas", () => {
    expect(calls).toBe(1);
    expect(file).toBe(path.join(schemas, "tiles.defs.json"));
  });

  it("writes prettier formatted json", () => {
    expect(written).toMatch(/^\{\n {2}"/);
    expect(written.endsWith("\n")).toBe(true);
  });

  it("adds the shared field properties to each tile element", () => {
    const fields = readSchema("fields.schema.json").definitions;
    const defs = JSON.parse(written).definitions;

    expect(defs.cities.items.properties).toMatchObject({
      ...fields.position.properties,
      ...fields.revenue.properties,
    });
    expect(defs.goods.items.properties).toMatchObject({
      ...fields.text.properties,
      ...fields.svg.properties,
      ...fields.font.properties,
      ...fields.position.properties,
    });
    expect(defs.name.properties).toMatchObject(fields.font.properties);
  });

  it("keeps the source tile definitions", () => {
    const src = readSchema("tiles.src.json");
    const defs = JSON.parse(written);
    expect(defs.$id).toBe(src.$id);
    expect(Object.keys(defs.definitions)).toEqual([
      ...Object.keys(src.definitions),
      "gameToken",
      "roundToken",
    ]);
  });

  it("derives the game and round tokens from the token", () => {
    const { token, gameToken, roundToken } = JSON.parse(written).definitions;
    const extra = (derived) =>
      Object.keys(derived.properties).filter((key) => !token.properties[key]);

    expect(extra(gameToken)).toEqual(["quantity", "print"]);
    expect(extra(roundToken)).toEqual(["name", "small"]);
    expect(roundToken.required).toEqual(["name"]);
    expect(gameToken.additionalProperties).toBe(false);
    expect(roundToken.additionalProperties).toBe(false);
  });

  it("matches the committed tiles.defs.json", () => {
    expect(JSON.parse(written)).toEqual(readSchema("tiles.defs.json"));
  });
});
