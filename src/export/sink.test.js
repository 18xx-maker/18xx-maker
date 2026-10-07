import path from "node:path";

import { gameFolder, insideFolder } from "#export/sink";

describe("gameFolder", () => {
  it("is the game id in the folder", () => {
    expect(gameFolder("out", "18Test")).toBe(path.join("out", "18Test"));
  });

  it("keeps a hostile id inside the folder", () => {
    expect(gameFolder("out", "../evil")).toBe(path.join("out", "__evil"));
    expect(gameFolder("out", "a/b")).toBe(path.join("out", "a_b"));
  });
});

describe("insideFolder", () => {
  const root = path.resolve("out");

  it("keeps a name that only starts with dots", () => {
    expect(insideFolder(root, "..foo")).toBe(path.join(root, "..foo"));
    expect(insideFolder(root, "a/..b/c.png")).toBe(
      path.join(root, "a", "..b", "c.png"),
    );
  });

  it("refuses a path that leaves the folder", () => {
    expect(() => insideFolder(root, "../x")).toThrow("outside of");
    expect(() => insideFolder(root, "a/../../x")).toThrow("outside of");
    expect(() => insideFolder(root, "..")).toThrow("outside of");
    expect(() => insideFolder(root, path.resolve("other"))).toThrow(
      "outside of",
    );
  });
});
