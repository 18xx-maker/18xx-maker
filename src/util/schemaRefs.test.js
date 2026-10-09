import "../../tests/support/windowStub.js";

import fs from "node:fs";
import path from "node:path";

import { path as getIn } from "ramda";

import { ASSETS } from "@/components/schemaForm/AssetPicker";
import {
  resolveAllOf,
  schemaAt,
  widgetOf,
} from "@/components/schemaForm/resolve";

import appEn from "@/locales/en.json";
import en from "@/locales/schema.en.json";
import schema from "@/schemas/game.schema.json";
import { resolveSchemaKeys } from "@/util/schemaKeys";
import { annotatedPaths, refOptions, refPaths } from "@/util/schemaRefs";

const ref = { from: "companies", key: "abbrev", label: "name" };

describe("refPaths", () => {
  const find = (paths, keys) =>
    paths.find((p) => p.path.join(".") === keys.join("."));

  it("finds an annotated property", () => {
    const paths = refPaths({
      type: "object",
      properties: { company: { type: "string", "x-ref": ref } },
    });
    expect(paths).toEqual([{ path: ["company"], ref }]);
  });

  it("follows $ref, items, oneOf and anyOf", () => {
    const root = {
      type: "object",
      definitions: { name: { type: "string", "x-ref": ref } },
      properties: {
        list: {
          type: "array",
          items: {
            type: "object",
            properties: {
              viaRef: { $ref: "#/definitions/name" },
              viaOneOf: {
                oneOf: [{ type: "null" }, { $ref: "#/definitions/name" }],
              },
              viaAnyOf: { anyOf: [{ $ref: "#/definitions/name" }] },
            },
          },
        },
      },
    };
    const paths = refPaths(root);
    expect(paths.map((p) => p.path.join("."))).toEqual([
      "list.*.viaRef",
      "list.*.viaOneOf",
      "list.*.viaAnyOf",
    ]);
  });

  it("gives the property and its items for a string or a list of strings", () => {
    const paths = refPaths(schema);
    expect(find(paths, ["trains", "*", "rust"])).toBeDefined();
    expect(find(paths, ["trains", "*", "rust", "*"])).toBeDefined();
    expect(find(paths, ["privates", "*", "company"])?.ref).toEqual(ref);
  });

  it("does not loop on a schema that refers to itself", () => {
    const root = {
      definitions: {
        node: {
          type: "object",
          properties: {
            child: { $ref: "#/definitions/node" },
            name: { type: "string", "x-ref": ref },
          },
        },
      },
      $ref: "#/definitions/node",
    };
    expect(refPaths(root)).toEqual([{ path: ["name"], ref }]);
  });
});

describe("refOptions", () => {
  it("lists the companies by abbreviation with the name as label", () => {
    const game = {
      companies: [
        { abbrev: "PRR", name: "Pennsylvania" },
        { abbrev: "NYC" },
        { abbrev: "PRR", name: "Again" },
        { name: "No abbrev" },
      ],
    };
    expect(refOptions(ref, game)).toEqual([
      { value: "PRR", label: "Pennsylvania" },
      { value: "NYC" },
    ]);
  });

  it("lists a list of strings as is, and a nested path", () => {
    expect(
      refOptions({ from: "a.b" }, { a: { b: ["x", "y", "x", ""] } }),
    ).toEqual([{ value: "x" }, { value: "y" }]);
  });

  it("names a number as text", () => {
    expect(
      refOptions({ from: "trains", key: "name" }, { trains: [{ name: 2 }] }),
    ).toEqual([{ value: "2" }]);
  });

  it("has none for a game without the list", () => {
    expect(refOptions(ref, {})).toEqual([]);
    expect(refOptions(ref, { companies: "PRR" })).toEqual([]);
  });

  it("reads the game it gets, so a new item is an option", () => {
    const game = { trains: [{ name: "2" }] };
    const spec = { from: "trains", key: "name" };
    expect(refOptions(spec, game)).toHaveLength(1);
    expect(
      refOptions(spec, { trains: [...game.trains, { name: "3" }] }),
    ).toHaveLength(2);
  });
});

describe("the x-ref annotations of the game schema", () => {
  const paths = refPaths(schema);

  it("has some", () => {
    expect(paths.length).toBeGreaterThan(0);
  });

  it.each(paths.map((p) => [p.path.join("."), p.ref]))(
    "%s names a list of the schema",
    (_, spec) => {
      const list = getIn(
        spec.from.split(".").flatMap((key) => ["properties", key]),
        schema,
      );
      expect(list?.type).toBe("array");
      const items = resolveAllOf(list.items, schema);
      expect(Object.keys(items.properties ?? {})).toEqual(
        expect.arrayContaining([spec.key, spec.label].filter(Boolean)),
      );
      // Without a key the items are the names, with one the key names them
      const named = spec.key ? items.properties[spec.key] : items;
      expect(["string", "number", "integer"]).toContain(
        resolveAllOf(named, schema).type,
      );
    },
  );

  it("names the train of a phase, as a string and as a list", () => {
    const train = { from: "trains", key: "name" };
    const find = (keys) =>
      paths.find((p) => p.path.join(".") === keys.join("."));
    expect(find(["phases", "*", "train"])?.ref).toEqual(train);
    expect(find(["phases", "*", "train", "*"])?.ref).toEqual(train);
  });

  it("is the same in the published schema", () => {
    const published = fs.readFileSync(
      path.join(import.meta.dirname, "../../public/schemas/game.schema.json"),
      "utf8",
    );
    expect(JSON.parse(published)).toEqual(resolveSchemaKeys(schema, en));
  });
});

describe("the x-widget annotations of the schemas", () => {
  const leaves = annotatedPaths(schema, "x-widget");

  it("has some", () => {
    expect(leaves.length).toBeGreaterThanOrEqual(6);
  });

  it.each(leaves.map((leaf) => [leaf.path.join("."), leaf.ref]))(
    "%s is a string with a known picker and its texts",
    (keys, widget) => {
      const node = schemaAt(
        schema,
        keys.split(".").map((key) => (key === "*" ? 0 : key)),
      );
      // widgetOf only answers for a string
      expect(widgetOf(node, schema)).toBe(widget);
      expect(Object.keys(ASSETS)).toContain(widget);
      expect(appEn.editPanel.tokenEditor.assets[widget]).toBeDefined();
    },
  );
});
