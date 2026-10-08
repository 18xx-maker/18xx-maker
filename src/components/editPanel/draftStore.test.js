import {
  clearDrafts,
  getDraft,
  resetDrafts,
  setDraft,
} from "@/components/editPanel/draftStore";

afterEach(resetDrafts);

describe("clearDrafts", () => {
  it("clears the drafts of a prefix and keeps the others", () => {
    setDraft("a#hex:0:B2", "x", "b");
    setDraft("a#hex:1:C3", "y", "b");
    setDraft("a", "game", "b");
    setDraft("a#config", "config", "b");
    expect(clearDrafts("a#hex:")).toBe(true);
    expect(getDraft("a#hex:0:B2")).toBeUndefined();
    expect(getDraft("a#hex:1:C3")).toBeUndefined();
    expect(getDraft("a").text).toBe("game");
    expect(getDraft("a#config").text).toBe("config");
    expect(clearDrafts("a#hex:")).toBe(false);
  });
});
