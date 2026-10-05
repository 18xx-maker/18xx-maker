import path from "node:path";

import { gameFolder } from "#export/sink";

describe("gameFolder", () => {
  it("is the game id in the folder", () => {
    expect(gameFolder("out", "18Test")).toBe(path.join("out", "18Test"));
  });

  it("keeps a hostile id inside the folder", () => {
    expect(gameFolder("out", "../evil")).toBe(path.join("out", "__evil"));
    expect(gameFolder("out", "a/b")).toBe(path.join("out", "a_b"));
  });
});
