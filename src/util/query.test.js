import {
  clearHexSearch,
  openConfigSearch,
  openEditSearch,
  searchString,
  selectHexSearch,
  togglePanelSearch,
} from "@/util/query";

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

describe("openConfigSearch", () => {
  it("opens the closed panel on the section", () => {
    expect(openConfigSearch("", "data")).toBe("config=true&section=data");
  });

  it("goes to the section when the panel is open on another", () => {
    expect(openConfigSearch("?config=true&section=tokens", "data")).toBe(
      "config=true&section=data",
    );
  });

  it("closes the edit panel and drops lines and hex, keeps the rest", () => {
    expect(
      openConfigSearch(
        "?edit=true&editSection=hex&hex=A1&lines=1&variation=1&paginated=true",
        "data",
      ),
    ).toBe("variation=1&paginated=true&config=true&section=data");
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

describe("the selected hex", () => {
  it("is selected on the hex tab and drops the lines of the json tab", () => {
    expect(selectHexSearch("?edit=true&editSection=json&lines=3", "C11")).toBe(
      "edit=true&editSection=hex&hex=C11",
    );
    expect(selectHexSearch("?edit=true&hex=A1&variation=1", "B2")).toBe(
      "edit=true&hex=B2&variation=1&editSection=hex",
    );
  });

  it("is cleared alone", () => {
    expect(clearHexSearch("?edit=true&editSection=hex&hex=C11")).toBe(
      "edit=true&editSection=hex",
    );
  });

  it("is dropped when the panel closes, another opens or the tab is chosen", () => {
    const search = "?edit=true&editSection=hex&hex=C11&variation=1";
    expect(togglePanelSearch(search, "edit")).toBe("variation=1");
    expect(togglePanelSearch(search, "config")).toBe("variation=1&config=true");
    expect(openEditSearch(search, "json")).toBe(
      "edit=true&editSection=json&variation=1",
    );
    expect(openEditSearch(search, "hex")).toBe("variation=1");
  });
});

describe("the selected tile", () => {
  it("is dropped with the other selections", () => {
    const search = "?edit=true&editSection=tiles&tile=26%257CT2&variation=1";
    expect(togglePanelSearch(search, "edit")).toBe("variation=1");
    expect(openConfigSearch(search, "data")).toBe(
      "variation=1&config=true&section=data",
    );
    expect(openEditSearch(search, "json")).toBe(
      "edit=true&editSection=json&variation=1",
    );
  });
});
