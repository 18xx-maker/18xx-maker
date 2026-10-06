import { togglePanelSearch } from "@/util/query";

describe("togglePanelSearch", () => {
  it("opens a panel and closes the other", () => {
    expect(togglePanelSearch("?config=true&section=data", "edit")).toBe(
      "edit=true",
    );
    expect(togglePanelSearch("?edit=true&editSection=trains", "config")).toBe(
      "config=true",
    );
  });

  it("forgets the tab of the edit panel when it closes, or config opens", () => {
    expect(togglePanelSearch("?edit=true&editSection=trains", "edit")).toBe("");
    expect(
      togglePanelSearch("?edit=true&editSection=trains&paginated=true", "edit"),
    ).toBe("paginated=true");
  });

  it("opens the edit panel at its first tab", () => {
    expect(togglePanelSearch("?editSection=trains", "edit")).toBe("edit=true");
  });
});
