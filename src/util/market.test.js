import games from "@/data/games";
import defaults from "@/defaults.json";
import {
  getMarketData,
  getMaxLength,
  getMovementData,
  getParData,
  getRevenueData,
} from "@/util/market";

const config = defaults;

describe("getMaxLength", () => {
  it("should find the longest row", () => {
    expect(getMaxLength([[1], [1, 2, 3], [1, 2]])).toBe(3);
  });

  it("should handle no rows", () => {
    expect(getMaxLength([])).toBe(0);
  });
});

describe("getMarketData", () => {
  it("should size a 2D market by rows and columns", () => {
    const { stock } = games["18Test"];
    const data = getMarketData(stock, config);

    expect(data.type).toBe("2D");
    expect(data.rows).toBe(stock.market.length);
    expect(data.columns).toBe(Math.max(...stock.market.map((r) => r.length)));
    expect(data.width).toBe(70);
    expect(data.height).toBe(85);
    expect(data.totalWidth).toBe(70 * data.columns + 10);
    expect(data.totalHeight).toBe(85 * data.rows + 50);
  });

  it("should expose the pieces of the stock section", () => {
    const { stock } = games["18Test"];
    const data = getMarketData(stock, config);

    expect(data.market).toBe(stock.market);
    expect(data.par).toBe(stock.par);
    expect(data.legend).toBe(stock.legend);
    expect(data.ledges).toEqual([]);
    expect(data.css.width).toBe("0.7in");
    expect(data.css.height).toBe("0.85in");
  });

  it("should size the 2D market of 18Test exactly", () => {
    const data = getMarketData(games["18Test"].stock, config);

    expect([data.rows, data.columns]).toEqual([11, 19]);
    expect(data.totalWidth).toBe(1340);
    expect(data.totalHeight).toBe(985);
    expect(data.humanWidth).toBe("14in");
    expect(data.humanHeight).toBe("10in");
  });

  it("should grow the page to fit a placed movement legend", () => {
    const stock = {
      type: "2D",
      market: [[10]],
      movement: { up: ["Sold out"] },
      display: { movement: { x: 2, y: 3 } },
    };
    const movement = getMovementData(stock.movement);
    const data = getMarketData(stock, config);
    expect(data.totalWidth).toBe(movement.width + 140);
    expect(data.totalHeight).toBe(movement.height + 255 + 50);
    // Not drawn, not counted
    const off = getMarketData(stock, {
      ...config,
      stock: { ...config.stock, display: { movement: false } },
    });
    expect(off.totalWidth).toBe(80);
  });

  it("should wrap and measure the movement legend", () => {
    const data = getMovementData({
      left: ["one two three four five six seven eight nine ten eleven twelve"],
      "2x right": ["x"],
    });
    expect(data.arrows.left).toHaveLength(2);
    expect(data.extras).toEqual(["2x right: x"]);
    expect(data.arrows.left.every((l) => l.length <= 40)).toBe(true);
  });

  it("should size the movement legend exactly", () => {
    const pick = (d) => ({
      width: d.width,
      height: d.height,
      center: d.center,
      topHeight: d.topHeight,
    });
    // An empty legend and one short up line fit the minimum box
    const min = {
      width: 180,
      height: 150,
      center: { x: 90, y: 85 },
      topHeight: 40,
    };
    expect(pick(getMovementData({}))).toEqual(min);
    expect(pick(getMovementData({ up: ["Sold out"] }))).toEqual(min);
    // Three up lines grow the top so the last baseline stays above the box
    const three = getMovementData({ up: ["a", "b", "c"] });
    expect(pick(three)).toEqual({
      width: 180,
      height: 164,
      center: { x: 90, y: 99 },
      topHeight: 54,
    });
    // Text starts 20 under the top: the last baseline is above the Price box
    const lastBaseline = 20 + 2 * three.lineHeight;
    expect(lastBaseline).toBeLessThan(three.topHeight);
    // Long right text widens the box
    expect(pick(getMovementData({ right: ["Paid twice and more"] }))).toEqual({
      ...min,
      width: 259.5,
    });
    // Other keys add a line of text under the compass
    expect(pick(getMovementData({ "2x right": ["Paid twice"] }))).toEqual({
      ...min,
      height: 174,
    });
  });

  it("should size a 1D market in a single row of tall cells", () => {
    const { stock } = games["1867"];
    const data = getMarketData(stock, config);

    expect(data.type).toBe("1D");
    expect(data.rows).toBe(1);
    expect(data.columns).toBe(stock.market.length);
    // The column height setting is 4 cells
    expect(data.height).toBe(4 * 85);
    expect(data.totalWidth).toBe(70 * stock.market.length + 10);
    expect(data.ledges).toBe(stock.ledges);
    // The legend adds room to the bottom of a 1D market
    expect(data.totalHeight).toBe(4 * 85 + 50 + 50);
  });

  it("should size a diagonal market in two rows", () => {
    const stock = { type: "1Diag", market: [1, 2, 3, 4, 5] };
    const data = getMarketData(stock, config);

    expect(data.rows).toBe(2);
    expect(data.columns).toBe(3);
    expect(data.height).toBe(2 * 85);
    expect(data.totalHeight).toBe(2 * 2 * 85 + 50);
  });

  it("should scale cells and drop the title space", () => {
    const stock = {
      type: "2D",
      cell: { width: 2, height: 3 },
      title: false,
      market: [[1, 2], [3]],
    };
    const data = getMarketData(stock, config);

    expect(data.width).toBe(140);
    expect(data.height).toBe(255);
    expect(data.totalWidth).toBe(140 * 2 + 10);
    expect(data.totalHeight).toBe(255 * 2);
  });

  it("should grow to fit a displayed par chart", () => {
    const stock = {
      type: "2D",
      market: [[1, 2]],
      par: { values: [[1], [2], [3], [4], [5], [6], [7], [8]] },
      display: { par: { x: 0, y: 2 } },
    };
    const data = getMarketData(stock, config);
    const par = getParData(stock, config);

    // The par chart is 8 rows tall and starts 2 rows down
    expect(data.totalHeight).toBe(par.totalHeight + 85 * 2 + 50);
    expect(data.totalHeight).toBeGreaterThan(85 + 50);
  });

  it("should grow to fit a par chart displayed to the right", () => {
    const stock = {
      type: "2D",
      market: [[1, 2]],
      par: { values: [[1]] },
      display: { par: { x: 20, y: 0 } },
    };
    const data = getMarketData(stock, config);
    const par = getParData(stock, config);

    // The par chart starts 20 cells (of 70) to the right
    expect(data.totalWidth).toBe(par.totalWidth + 70 * 20);
    expect(data.totalWidth).toBeGreaterThan(70 * 2 + 10);
  });

  it("should offset a par chart by half cells in a diagonal market", () => {
    const stock = {
      type: "1Diag",
      market: [1, 2, 3, 4],
      par: { values: [[1], [2], [3], [4], [5], [6], [7], [8]] },
      display: { par: { x: 0, y: 2 } },
    };
    const data = getMarketData(stock, config);
    const par = getParData(stock, config);

    // A diagonal cell is 2 cells tall but the par chart rows are half that
    expect(data.height).toBe(2 * 85);
    expect(data.totalHeight).toBe(par.totalHeight + 85 * 2 + 50);
    expect(data.totalHeight).toBeGreaterThan(2 * data.height + 50);
  });

  it("should add extra total width and height independently", () => {
    const { stock } = games["18Test"];
    const base = getMarketData(stock, config);
    const data = getMarketData(
      { ...stock, display: { extraTotalWidth: 7, extraTotalHeight: 13 } },
      config,
    );

    expect(data.totalWidth).toBe(base.totalWidth + 7);
    expect(data.totalHeight).toBe(base.totalHeight + 13);
  });

  it("should default unknown types to empty sizes", () => {
    const data = getMarketData({ market: [] }, config);

    expect(data.type).toBe("2D");
    expect(data.rows).toBe(0);
    expect(data.width).toBe(0);
  });
});

describe("getRevenueData", () => {
  it("should default to 100 in rows of 20", () => {
    const data = getRevenueData(undefined, config);

    expect(data.min).toBe(1);
    expect(data.max).toBe(100);
    expect(data.perRow).toBe(20);
    expect(data.rows).toBe(5);
    expect(data.columns).toBe(20);
    expect(data.totalWidth).toBe(20 * 70);
    expect(data.totalHeight).toBe(5 * 85 + 50);
  });

  it("should round up partial rows", () => {
    const data = getRevenueData({ min: 5, max: 41, perRow: 10 }, config);

    expect(data.min).toBe(5);
    expect(data.rows).toBe(5);
    expect(data.totalWidth).toBe(700);
  });

  it("should convert to css", () => {
    const data = getRevenueData({ perRow: 10, max: 10 }, config);

    expect(data.css).toEqual({
      width: "0.7in",
      height: "0.85in",
      totalWidth: "7in",
      totalHeight: "1.35in",
    });
  });
});

describe("getParData", () => {
  it("should size par cells by the default par width", () => {
    const { stock } = games["18Test"];
    const data = getParData(stock, config);

    // 6 values in a single column, par cells are 4 cells wide
    expect(data.rows).toBe(6);
    expect(data.columns).toBe(1);
    expect(data.width).toBe(4 * 70);
    expect(data.height).toBe(85);
    expect(data.totalWidth).toBe(280);
    expect(data.totalHeight).toBe(6 * 85 + 50);
  });

  it("should use par width and height overrides", () => {
    const stock = {
      par: { width: 2, height: 2, values: [[1, 2, 3], [4]] },
    };
    const data = getParData(stock, config);

    expect(data.width).toBe(140);
    expect(data.height).toBe(170);
    expect(data.columns).toBe(3);
    expect(data.rows).toBe(2);
    expect(data.totalWidth).toBe(420);
    expect(data.totalHeight).toBe(2 * 170 + 50);
  });

  it("should tolerate a stock without par or par values", () => {
    for (const stock of [{}, { par: {} }, { title: false, par: {} }]) {
      const data = getParData(stock, config);

      expect(data.values).toEqual([]);
      expect(data.rows).toBe(0);
      expect(data.columns).toBe(1);
      expect(data.par).toEqual({});
    }
    expect(getParData({}, config).totalHeight).toBe(50);
    expect(getParData({ title: false }, config).totalHeight).toBe(0);
  });
});
