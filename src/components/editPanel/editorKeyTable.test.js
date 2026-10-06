import { keyTable } from "@/components/editPanel/editorKeyTable";

describe("editor key table", () => {
  it("binds every key once in a mode", () => {
    for (const table of Object.values(keyTable)) {
      const keys = Object.values(table).flat();
      expect(keys.length > 0).toBe(true);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("has the same actions to do in each mode, bar folding and finding", () => {
    for (const action of ["format", "apply", "nextProblem", "prevProblem"]) {
      for (const table of Object.values(keyTable)) {
        expect(table[action]?.length).toBeGreaterThan(0);
      }
    }
  });
});
