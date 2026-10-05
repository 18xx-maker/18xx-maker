import { describe, expect, it } from "vitest";

import { reorderForBleed } from "./tilesheet.js";

const tile = (id, sides) => ({
  id,
  track: sides.map((side) => ({ type: "stub", side })),
});
const above = (page, i) => (i % 6 === 0 ? null : page[i - 1]);
const ids = (page) => page.map((t) => t && t.id);

describe("reorderForBleed", () => {
  const G = tile("G", [1]);
  const D = tile("D", [2]);
  const blank = tile("blank", []);
  const full = tile("full", [1, 2, 3, 4, 5, 6]);

  it("swaps in a later tile when the current one cannot line up", () => {
    const page = [G, blank, D];
    expect(ids(reorderForBleed(page, () => "g", above))).toEqual([
      "G",
      "D",
      "blank",
    ]);

    // Nothing printed above has track on its bottom, a full tile always bleeds
    const noBottom = [blank, full, D];
    expect(ids(reorderForBleed(noBottom, () => "g", above))).toEqual([
      "blank",
      "D",
      "full",
    ]);
  });

  it("does not move tiles across groups", () => {
    const page = [G, blank, D];
    const group = (t) => (t === D ? "other" : "g");
    expect(ids(reorderForBleed(page, group, above))).toEqual([
      "G",
      "blank",
      "D",
    ]);
  });

  it("leaves pages that already line up alone", () => {
    const page = [G, tile("S", [1, 4]), null, blank];
    expect(reorderForBleed(page, () => "g", above)).toEqual(page);
  });
});
