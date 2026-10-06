import resolveCellColor from "./resolveCellColor";

// A color is its name, so the order is what the test sees
const c = (name) => `c:${name}`;
const data = {
  cell: { color: "stock" },
  legend: [{ color: "yellow" }, { color: "orange" }],
  par: { color: "parcolor" },
};

describe("resolveCellColor", () => {
  it("par beats legend, legend beats the cell color, then the stock cell", () => {
    expect(
      resolveCellColor({ par: true, legend: 0, color: "x" }, data, c),
    ).toBe("c:parcolor");
    expect(resolveCellColor({ legend: 1, color: "x" }, data, c)).toBe(
      "c:orange",
    );
    expect(resolveCellColor({ color: "x" }, data, c)).toBe("c:x");
    expect(resolveCellColor({}, data, c)).toBe("c:stock");
    expect(resolveCellColor({}, { legend: [] }, c)).toBe("c:plain");
  });

  it("a par without a par color is gray", () => {
    expect(resolveCellColor({ par: true }, { legend: [] }, c)).toBe("c:gray");
    expect(resolveCellColor({ par: true }, { legend: [], par: {} }, c)).toBe(
      "c:gray",
    );
  });

  it("ignores a legend index that is out of range or not a whole number", () => {
    for (const legend of [2, -1, 1.5, "1", null]) {
      expect(resolveCellColor({ legend, color: "x" }, data, c)).toBe("c:x");
    }
  });
});
