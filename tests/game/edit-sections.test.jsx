import { describe, expect, it } from "vitest";

import { editSections } from "@/components/editPanel/sections";

describe("edit panel sections", () => {
  it("are in tab order with the json editor last", () => {
    expect(editSections.map((s) => s.section)).toEqual([
      "info",
      "players",
      "hex",
      "companies",
      "privates",
      "tokens",
      "trains",
      "phases",
      "market",
      "rounds",
      "colors",
      "output",
      "json",
    ]);
  });
});
