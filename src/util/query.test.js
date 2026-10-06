import { openEditSearch, togglePanelSearch } from "@/util/query";

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

describe("openEditSearch", () => {
  it("opens the closed panel on the section", () => {
    expect(openEditSearch("", "json")).toBe("edit=true&editSection=json");
    expect(openEditSearch("?config=true&section=data", "json")).toBe(
      "edit=true&editSection=json",
    );
  });

  it("switches an open panel to the section", () => {
    expect(openEditSearch("?edit=true", "json")).toBe(
      "edit=true&editSection=json",
    );
    expect(openEditSearch("?edit=true&editSection=trains", "json")).toBe(
      "edit=true&editSection=json",
    );
  });

  it("closes the panel when it is on the section", () => {
    expect(
      openEditSearch("?edit=true&editSection=json&paginated=true", "json"),
    ).toBe("paginated=true");
  });
});
