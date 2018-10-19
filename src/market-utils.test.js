import {
  normalize,
  height,
  width,
  cell,
  value,
  values,
  min,
  max,
  delta
} from "./market-utils";

const tinyMarket = [[20, { label: "$30" }], [null, { label: 10, foo: "bar" }]];

describe("normalize", () => {
  it("should normalize the tiny market", () => {
    expect(normalize(tinyMarket)).toEqual([
      [{ value: 20, label: 20 }, { value: 30, label: "$30" }],
      [null, { value: 10, label: 10, foo: "bar" }]
    ]);
  });
});

const market = [
  [{ value: 10, legend: 0, arrow: "down" }, 20, 30, 40],
  [110, 120, 130, 140, 150],
  [210, 220, 230, 240]
];

describe("width", () => {
  it("should return the proper width", () => {
    expect(width(market)).toEqual(5);
  });
});

describe("height", () => {
  it("should return the proper height", () => {
    expect(height(market)).toEqual(3);
  });
});

describe("cell", () => {
  it("should return the proper cell", () => {
    expect(cell(0, 1, market)).toEqual(110);
    expect(cell(1, 1, market)).toEqual(120);
    expect(cell(1, 0, market)).toEqual(20);
    expect(cell(2, 0, market)).toEqual(30);
    expect(cell(50, 50, market)).toBeUndefined();
    expect(cell(-5, 50, market)).toBeUndefined();
    expect(cell(50, -5, market)).toBeUndefined();
    expect(cell(-5, -5, market)).toBeUndefined();
  });
});

describe("value", () => {
  it("should return undefined for off market", () => {
    expect(value(null)).toBeUndefined();
    expect(value(undefined)).toBeUndefined();
  });

  it("should return the proper value of a simple cell", () => {
    expect(value(market[1][2])).toEqual(130);
  });

  it("should return the proper value of a complex cell", () => {
    expect(value(market[0][0])).toEqual(10);
  });
});

describe("values", () => {
  it("should return all values", () => {
    expect(values(market)).toEqual([
      10,
      20,
      30,
      40,
      110,
      120,
      130,
      140,
      150,
      210,
      220,
      230,
      240
    ]);
  });
});

describe("min", () => {
  it("should return the min value of the market", () => {
    expect(min(market)).toEqual(10);
  });
});

describe("max", () => {
  it("should return the max value of the market", () => {
    expect(max(market)).toEqual(240);
  });
});

describe("delta", () => {
  it("should return the delta for the upper left corner", () => {
    expect(delta(0, 0, market)).toEqual(-91);
  });

  it("should return the delta for the lower left corner", () => {
    expect(delta(0, 2, market)).toEqual(0);
  });

  it("should return the delta for the second cell", () => {
    expect(delta(0, 1, market)).toEqual(-48);
  });
});
