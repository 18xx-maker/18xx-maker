import { describe, expect, it } from "vitest";

import { editSections } from "@/components/editPanel/sections";

describe("edit panel sections", () => {
  it("are in tab order with the json editor last", () => {
    expect(editSections.map((s) => s.section)).toEqual([
      "info",
      "players",
      "phases",
      "rounds",
      "companies",
      "privates",
      "tokens",
      "trains",
      "hex",
      "market",
      "colors",
      "output",
      "config",
      "json",
    ]);
  });
});
