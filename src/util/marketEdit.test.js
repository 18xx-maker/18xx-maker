import { getMarketData } from "./market";
import {
  blankRow,
  cellAt,
  cellKeys,
  changeType,
  columnCells,
  columnCount,
  createMarket,
  demoteCell,
  droppedRows,
  duplicateColumn,
  duplicateRow,
  insertColumn,
  insertRow,
  legendUses,
  moveColumn,
  moveRow,
  promoteCell,
  removeColumn,
  removeRow,
  rowsOf,
  setCell,
  setCellField,
} from "./marketEdit";

const game = (stock) => ({ info: { title: "T" }, stock });
const twoD = () =>
  game({
    type: "2D",
    cell: { width: 2 },
    display: { par: { x: 1, y: 1 } },
    market: [[60, 67, 71], [53, 60], [{ value: 46, legend: 1 }], 40],
  });
const oneD = () => game({ type: "1D", market: [10, 20, 30] });
const diag = () => game({ type: "1Diag", market: [1, 2, 3, 4, 5] });
const market = (g) => g.stock.market;

describe("reading the market", () => {
  it("rows are lists, a flat market is one row, a bare cell a row of one", () => {
    expect(rowsOf(twoD().stock)).toEqual([
      [60, 67, 71],
      [53, 60],
      [{ value: 46, legend: 1 }],
      [40],
    ]);
    expect(rowsOf(oneD().stock)).toEqual([[10, 20, 30]]);
    expect(rowsOf({ type: "1D" })).toEqual([[]]);
    expect(rowsOf({ type: "2D" })).toEqual([]);
    expect(rowsOf(undefined)).toEqual([]);
  });

  it("counts the columns, two cells of a 1Diag market make one", () => {
    expect(columnCount(twoD().stock)).toBe(3);
    expect(columnCount(oneD().stock)).toBe(3);
    expect(columnCount(diag().stock)).toBe(3);
    expect(columnCount({ type: "2D", market: [] })).toBe(0);
  });

  it("finds a cell and where it is in the game", () => {
    const { stock } = twoD();
    expect(cellAt(stock, 0, 1)).toBe(67);
    expect(cellAt(stock, 1, 2)).toBeUndefined();
    expect(cellKeys(stock, 0, 1)).toEqual(["stock", "market", 0, 1]);
    expect(cellKeys(stock, 3, 0)).toEqual(["stock", "market", 3]);
    expect(cellKeys(oneD().stock, 0, 2)).toEqual(["stock", "market", 2]);
  });

  it("counts the cells of a legend entry", () => {
    expect(legendUses(twoD().stock, 1)).toBe(1);
    expect(legendUses(twoD().stock, 0)).toBe(0);
  });
});

describe("shorthand", () => {
  it("promotes null, numbers and strings", () => {
    expect(promoteCell(null)).toEqual({});
    expect(promoteCell(undefined)).toEqual({});
    expect(promoteCell(70)).toEqual({ value: 70 });
    expect(promoteCell("Close")).toEqual({ label: "Close" });
    const cell = { value: 1 };
    expect(promoteCell(cell)).toBe(cell);
  });

  it("demotes to the shortest form", () => {
    expect(demoteCell({ value: 70 })).toBe(70);
    expect(demoteCell({ value: 0 })).toBe(0);
    expect(demoteCell({ label: "Close" })).toBe("Close");
    expect(demoteCell({})).toBeNull();
    expect(demoteCell(undefined)).toBeNull();
    expect(demoteCell(null)).toBeNull();
    expect(demoteCell(5)).toBe(5);
    // A string value or a number label is not the shorthand of that
    expect(demoteCell({ value: "70" })).toEqual({ value: "70" });
    expect(demoteCell({ label: 5 })).toEqual({ label: 5 });
    expect(demoteCell({ value: 70, par: true })).toEqual({
      value: 70,
      par: true,
    });
  });

  it("sets and removes a field of a cell, in the shortest form", () => {
    expect(setCellField(70, "par", true)).toEqual({ value: 70, par: true });
    expect(setCellField({ value: 70, par: true }, "par", undefined)).toBe(70);
    expect(setCellField(null, "label", "x")).toBe("x");
    expect(setCellField("x", "value", 5)).toEqual({ label: "x", value: 5 });
    expect(setCellField({ value: 5 }, "value", undefined)).toBeNull();
    expect(setCellField("70", "value", "70")).toEqual({
      label: "70",
      value: "70",
    });
  });
});

describe("setCell", () => {
  it("sets a cell without touching the others or the input", () => {
    const before = twoD();
    const copy = structuredClone(before);
    const next = setCell(before, 1, 1, 61);
    expect(market(next)[1]).toEqual([53, 61]);
    expect(market(next)[0]).toBe(market(before)[0]);
    expect(before).toEqual(copy);
  });

  it("sets a flat cell and a bare cell row", () => {
    expect(market(setCell(oneD(), 0, 1, 25))).toEqual([10, 25, 30]);
    expect(market(setCell(twoD(), 3, 0, 41))[3]).toBe(41);
  });

  it("is the same game for no change or a place that is not there", () => {
    const g = twoD();
    expect(setCell(g, 0, 0, 60)).toBe(g);
    expect(setCell(g, 1, 2, 1)).toBe(g);
    expect(setCell(g, 9, 0, 1)).toBe(g);
    expect(setCell(g, 0, -1, 1)).toBe(g);
    expect(setCell(oneD(), 0, 3, 1).stock.market).toHaveLength(3);
  });
});

describe("rows", () => {
  it("inserts a row of nulls as wide as another, or at the end", () => {
    const g = twoD();
    expect(blankRow(g.stock, 1)).toEqual([null, null]);
    expect(blankRow(g.stock, 9)).toEqual([]);
    expect(market(insertRow(g, 1, [null, null]))[1]).toEqual([null, null]);
    expect(market(insertRow(g, 99, [null])).at(-1)).toEqual([null]);
    expect(market(insertRow(g, -4, [null]))[0]).toEqual([null]);
    // The bare cell row stays bare
    expect(market(insertRow(g, 0, [null])).at(-1)).toBe(40);
  });

  it("removes a row, and the last one leaves an empty market", () => {
    const g = twoD();
    expect(market(removeRow(g, 1))).toHaveLength(3);
    expect(removeRow(g, 9)).toBe(g);
    expect(removeRow(g, -1)).toBe(g);

    const one = game({ type: "2D", market: [[1]] });
    const empty = removeRow(one, 0);
    expect(empty.stock.market).toEqual([]);
    expect(empty.stock.type).toBe("2D");
  });

  it("moves a row, not past the edges", () => {
    const g = twoD();
    expect(market(moveRow(g, 0, 1))[0]).toEqual([53, 60]);
    expect(moveRow(g, 0, 0)).toBe(g);
    expect(moveRow(g, 0, 4)).toBe(g);
    expect(moveRow(g, 4, 0)).toBe(g);
    expect(moveRow(g, -1, 0)).toBe(g);
    expect(moveRow(g, 0, -1)).toBe(g);
  });

  it("duplicates a row after itself with a copy of its cells", () => {
    const g = twoD();
    const next = duplicateRow(g, 2);
    expect(market(next)[3]).toEqual(market(next)[2]);
    expect(market(next)[3][0]).not.toBe(market(next)[2][0]);
    expect(duplicateRow(g, 9)).toBe(g);
  });

  it("does nothing on a flat market", () => {
    const g = oneD();
    expect(insertRow(g, 0, [null])).toBe(g);
    expect(removeRow(g, 0)).toBe(g);
    expect(moveRow(g, 0, 1)).toBe(g);
    expect(duplicateRow(g, 0)).toBe(g);
    expect(removeRow(game(undefined), 0)).toEqual(game(undefined));
  });
});

describe("columns", () => {
  it("inserts a column of nulls where rows are long enough, a triangle stays one", () => {
    const next = insertColumn(twoD(), 2);
    // Row 2 has 1 cell: shorter than the index, skipped. Row 1 has 2: appended.
    expect(market(next)).toEqual([
      [60, 67, null, 71],
      [53, 60, null],
      [{ value: 46, legend: 1 }],
      40,
    ]);
  });

  it("promotes a bare cell row to an array to insert in it", () => {
    expect(market(insertColumn(twoD(), 0))[3]).toEqual([null, 40]);
  });

  it("inserts into a flat market", () => {
    expect(market(insertColumn(oneD(), 1))).toEqual([10, null, 20, 30]);
    expect(market(insertColumn(oneD(), 3))).toEqual([10, 20, 30, null]);
    expect(market(insertColumn(game({ type: "1D", market: [] }), 0))).toEqual([
      null,
    ]);
  });

  it("inserts and removes two cells of a 1Diag market", () => {
    expect(market(insertColumn(diag(), 1))).toEqual([
      1,
      2,
      null,
      null,
      3,
      4,
      5,
    ]);
    expect(market(removeColumn(diag(), 1))).toEqual([1, 2, 5]);
    expect(market(removeColumn(diag(), 2))).toEqual([1, 2, 3, 4]);
    expect(market(moveColumn(diag(), 0, 1))).toEqual([3, 4, 1, 2, 5]);
  });

  it("removes a column from the rows that have it, the last leaves an empty market", () => {
    expect(market(removeColumn(twoD(), 1))).toEqual([
      [60, 71],
      [53],
      [{ value: 46, legend: 1 }],
      40,
    ]);
    const one = game({ type: "1D", market: [5] });
    expect(removeColumn(one, 0).stock.market).toEqual([]);
    expect(removeColumn(game(undefined), 0).stock).toBeUndefined();
    expect(removeColumn(twoD(), -1).stock.market).toEqual(twoD().stock.market);
  });

  it("puts a removed column back where it was", () => {
    const g = twoD();
    const cells = columnCells(g.stock, 1);
    expect(cells).toEqual([[67], [60], undefined, undefined]);
    expect(market(insertColumn(removeColumn(g, 1), 1, cells))).toEqual([
      [60, 67, 71],
      [53, 60],
      [{ value: 46, legend: 1 }],
      40,
    ]);
  });

  it("moves a column in the rows that have both places", () => {
    expect(market(moveColumn(twoD(), 0, 1))).toEqual([
      [67, 60, 71],
      [60, 53],
      [{ value: 46, legend: 1 }],
      40,
    ]);
    expect(market(moveColumn(oneD(), 0, 2))).toEqual([20, 30, 10]);
    // 2 is beyond the shorter rows
    expect(market(moveColumn(twoD(), 0, 2))[1]).toEqual([53, 60]);
    const g = twoD();
    expect(moveColumn(g, 1, 1)).toBe(g);
    expect(moveColumn(g, -1, 1)).toBe(g);
  });

  it("duplicates a column with copies of the cells", () => {
    const next = duplicateColumn(twoD(), 0);
    expect(market(next)[0]).toEqual([60, 60, 67, 71]);
    expect(market(next)[2]).toEqual([
      { value: 46, legend: 1 },
      { value: 46, legend: 1 },
    ]);
    expect(market(next)[2][0]).not.toBe(market(next)[2][1]);
    const g = twoD();
    expect(duplicateColumn(g, 9)).toBe(g);
    expect(duplicateColumn(g, -1)).toBe(g);
  });

  it("keeps display, cell and the rest of the stock", () => {
    const next = insertColumn(twoD(), 1);
    expect(next.stock.display).toEqual({ par: { x: 1, y: 1 } });
    expect(next.stock.cell).toEqual({ width: 2 });
  });
});

describe("changeType", () => {
  it("keeps the first row for a flat market", () => {
    const g = twoD();
    expect(droppedRows(g.stock, "1D")).toBe(3);
    const next = changeType(g, "1D");
    expect(next.stock.type).toBe("1D");
    expect(market(next)).toEqual([60, 67, 71]);
    expect(next.stock.display).toEqual(g.stock.display);
    expect(next.stock.cell).toEqual(g.stock.cell);
    expect(
      market(changeType(game({ type: "2D", market: [5] }), "1Diag")),
    ).toEqual([5]);
  });

  it("wraps a flat market as the one row of a 2D market", () => {
    expect(droppedRows(oneD().stock, "2D")).toBe(0);
    expect(market(changeType(oneD(), "2D"))).toEqual([[10, 20, 30]]);
  });

  it("changes between flat types, and sets the type of an empty market", () => {
    expect(market(changeType(oneD(), "1Diag"))).toEqual([10, 20, 30]);
    expect(
      changeType(game({ type: "2D", market: [] }), "1D").stock.market,
    ).toEqual([]);
    expect(changeType(game(undefined), "2D").stock).toEqual({ type: "2D" });
    expect(droppedRows(undefined, "1D")).toBe(0);
  });

  it("round trips a market with one row", () => {
    const g = game({ type: "2D", market: [[1, 2]] });
    expect(changeType(changeType(g, "1D"), "2D")).toEqual(g);
  });

  it("is the same game for the same type", () => {
    const g = twoD();
    expect(changeType(g, "2D")).toBe(g);
  });
});

describe("createMarket", () => {
  it("creates a 3 x 3 market, or a row of three for a flat type", () => {
    expect(createMarket(game(undefined)).stock).toEqual({
      type: "2D",
      market: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
    });
    expect(createMarket(game({ type: "1D" })).stock).toEqual({
      type: "1D",
      market: [null, null, null],
    });
  });
});

describe("the market page with no cells", () => {
  const config = {
    stock: {
      cell: { width: 50, height: 50 },
      column: 2,
      diag: 1.5,
      display: {},
    },
  };

  it("has no rows or columns for an empty market", () => {
    for (const type of ["2D", "1D"]) {
      const data = getMarketData({ type, market: [] }, config);
      expect(data.rows).toBe(type === "2D" ? 0 : 1);
      expect(data.columns).toBe(0);
    }
  });

  it("draws a 1Diag market in two rows", () => {
    const data = getMarketData(
      { type: "1Diag", market: [1, 2, 3, 4, 5] },
      config,
    );
    expect(data.rows).toBe(2);
    expect(data.columns).toBe(3);
  });
});
