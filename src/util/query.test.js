import { openEditSearch, searchString, togglePanelSearch } from "@/util/query";

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

describe("lines", () => {
  it("keeps commas as they are in the search", () => {
    expect(searchString(new URLSearchParams("lines=1-4,15&a=b%2Cc"))).toBe(
      "lines=1-4,15&a=b,c",
    );
  });

  it("are dropped by every panel path", () => {
    const search = "?edit=true&editSection=json&lines=1-4,15,16";
    expect(togglePanelSearch(search, "edit")).toBe("");
    expect(togglePanelSearch(search, "config")).toBe("config=true");
    expect(openEditSearch(search, "json")).toBe("");
    expect(openEditSearch(search, "trains")).toBe(
      "edit=true&editSection=trains",
    );
  });
});
