import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { omit } from "ramda";

import games from "@/data/games";
import { editGame, selectGameProblems } from "@/state";
import { selectGameChanged } from "@/state/selectors";

import {
  button,
  cards,
  field,
  open,
  opened,
  panel,
  registerEditPanelHooks,
  route,
  settled,
} from "@tests/support/editPanel.jsx";

registerEditPanelHooks();

describe("edit panel market", () => {
  const marketRoute = `${route}?edit=true&editSection=market`;
  const stock = (store) => store.getState().game.stock;
  const market = (store) => stock(store).market;
  const grid = () => screen.findByRole("grid", { name: "Stock market cells" });
  const cell = (row, column) =>
    screen.getByRole("gridcell", {
      name: new RegExp(`^Row ${row}, column ${column}:`),
    });
  const cells = (index) =>
    within(
      within(screen.getByRole("grid")).getAllByRole("row")[index],
    ).queryAllByRole("gridcell");
  const inspector = () => screen.findByTestId("cell-inspector");
  const oneD = {
    ...games["1858"],
    stock: { ...games["1858"].stock, legend: undefined },
  };

  it("clicking the Market tab opens it and keeps the panel", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await screen.findByRole("tab", { name: "Market" });
    await user.click(screen.getByRole("tab", { name: "Market" }));
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=market",
      ),
    );
    expect(await grid()).toBeVisible();
    expect(screen.getByRole("tab", { name: "Market" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
  });

  it("shows the rows and cells of the market, a triangle stays one", async () => {
    open(marketRoute);
    await grid();
    const rows = within(screen.getByRole("grid")).getAllByRole("row");
    expect(rows).toHaveLength(11);
    expect(
      rows.map((row) => within(row).queryAllByRole("gridcell").length),
    ).toEqual(games["18Test"].stock.market.map((row) => row.length));
    expect(cell(1, 1)).toHaveAccessibleName(
      "Row 1, column 1: 60, legend 0, down",
    );
    expect(cell(1, 7)).toHaveAccessibleName("Row 1, column 7: 100, par");
    expect(cell(1, 2)).toHaveAccessibleName("Row 1, column 2: 67");
    // The row number is the first column
    expect(cells(1)[0]).toHaveAttribute("aria-colindex", "2");
    expect(within(rows[0]).getByRole("rowheader")).toHaveAttribute(
      "aria-colindex",
      "1",
    );
    expect(screen.getByRole("grid")).toHaveAttribute(
      "aria-colcount",
      String(
        Math.max(...games["18Test"].stock.market.map((r) => r.length)) + 1,
      ),
    );
    expect(rows[2]).toHaveAttribute("aria-rowindex", "3");
    // Empty cells are not drawn past the end of a row
    expect(
      screen.queryByRole("gridcell", { name: /^Row 11, column 8:/ }),
    ).not.toBeInTheDocument();
  });

  it("colors a legend cell and a par cell and marks them without color", async () => {
    open(marketRoute);
    await grid();
    const plain = getComputedStyle(cell(1, 2)).backgroundColor;
    const legend = getComputedStyle(cell(1, 1)).backgroundColor;
    const par = getComputedStyle(cell(1, 7)).backgroundColor;
    expect(new Set([plain, legend, par]).size).toBe(3);
    expect(cell(1, 7)).toHaveTextContent("P");
    expect(cell(1, 1)).toHaveTextContent("60↓0");
    expect(cell(1, 1)).toHaveTextContent("↓");
  });

  it("selects with a click and the arrow keys and shows the cell", async () => {
    const { user } = open(marketRoute);
    await grid();
    expect(screen.queryByTestId("cell-inspector")).not.toBeInTheDocument();

    await user.click(cell(2, 4));
    expect(cell(2, 4)).toHaveAttribute("aria-selected", "true");
    expect(cell(2, 4)).toHaveAttribute("tabindex", "0");
    expect(cell(1, 1)).toHaveAttribute("tabindex", "-1");
    expect(within(await inspector()).getByRole("heading")).toHaveTextContent(
      "Row 2, column 4",
    );
    expect(
      within(await inspector()).getByRole("textbox", { name: "Value" }),
    ).toHaveValue("70");

    await user.keyboard("{ArrowRight}");
    expect(cell(2, 5)).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(cell(3, 5)).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(cell(2, 4)).toHaveFocus();
    await user.keyboard("{End}");
    expect(cell(2, 19)).toHaveFocus();
    await user.keyboard("{Home}");
    expect(cell(2, 1)).toHaveFocus();
    // The last cell of a short row: down goes to the last cell of the next
    await user.click(cell(3, 16));
    await user.keyboard("{ArrowDown}");
    expect(cell(4, 13)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(cell(4, 13)).toHaveFocus();
  });

  it("edits the value of a cell in the game", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    expect(selectGameChanged(store.getState())).toBe(false);
    await user.click(cell(1, 2));
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    await user.clear(value);
    await user.type(value, "68{Enter}");

    // The shorthand stays: only a value
    expect(market(store)[0][1]).toBe(68);
    expect(cell(1, 2)).toHaveAccessibleName("Row 1, column 2: 68");
    expect(selectGameChanged(store.getState())).toBe(true);
  });

  it("promotes a number to an object with a second field and demotes it again", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    expect(
      within(await inspector()).getByText(/saved as 67 until/),
    ).toBeVisible();

    await user.click(
      within(await inspector()).getByRole("combobox", { name: "Par" }),
    );
    await user.click(await screen.findByRole("option", { name: "Yes" }));
    expect(market(store)[0][1]).toEqual({ value: 67, par: true });
    expect(screen.queryByText(/saved as/)).not.toBeInTheDocument();

    await user.click(
      within(await inspector()).getByRole("combobox", { name: "Par" }),
    );
    await user.click(await screen.findByRole("option", { name: "Not set" }));
    expect(market(store)[0][1]).toBe(67);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("a label on an empty cell is a string, a value and a label an object", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    act(() =>
      store.dispatch(
        editGame((g) => ({
          ...g,
          stock: {
            ...g.stock,
            market: [[null, "Close"], ...g.stock.market.slice(1)],
          },
        })),
      ),
    );
    await user.click(cell(1, 1));
    expect(within(await inspector()).getByText(/saved as null/)).toBeVisible();
    await user.type(
      within(await inspector()).getByRole("textbox", { name: "Label" }),
      "x{Enter}",
    );
    expect(market(store)[0][0]).toBe("x");

    await user.type(
      within(await inspector()).getByRole("textbox", { name: "Value" }),
      "9{Enter}",
    );
    expect(market(store)[0][0]).toEqual({ label: "x", value: 9 });
    await user.click(cell(1, 2));
    expect(
      within(await inspector()).getByText(/saved as "Close"/),
    ).toBeVisible();
  });

  it("sets and clears the arrows of a cell", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    await user.click(
      within(await inspector()).getByRole("button", { name: "More fields" }),
    );
    const arrows = within(await inspector()).getByRole("group", {
      name: "Arrows",
    });
    await user.click(within(arrows).getByRole("button", { name: "Up" }));
    expect(market(store)[0][1]).toEqual({ value: 67, arrow: "up" });
    await user.click(within(arrows).getByRole("button", { name: "Right" }));
    expect(market(store)[0][1].arrow).toEqual(["up", "right"]);
    await user.click(within(arrows).getByRole("button", { name: "Up" }));
    expect(market(store)[0][1].arrow).toBe("right");
    await user.click(within(arrows).getByRole("button", { name: "Right" }));
    expect(market(store)[0][1]).toBe(67);
  });

  it("Delete empties the cell, but not while typing in the inspector", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    await user.click(value);
    await user.keyboard("{Backspace}{Backspace}{Delete}{ArrowLeft}8");
    expect(value).toHaveValue("8");
    expect(market(store)[0][1]).toBe(67);
    await user.clear(value);
    await user.type(value, "67");
    expect(cell(1, 2)).toHaveAttribute("aria-selected", "true");

    act(() => cell(1, 2).focus());
    await user.keyboard("{Delete}");
    expect(market(store)[0][1]).toBeNull();
    expect(cell(1, 2)).toHaveAccessibleName("Row 1, column 2: empty");
  });

  it("a digit on a cell goes on in its value field", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    await inspector();
    act(() => cell(1, 2).focus());
    await user.keyboard("5");
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    expect(value).toHaveFocus();
    expect(value).toHaveValue("5");
    await user.keyboard("0{Enter}");
    expect(market(store)[0][1]).toBe(50);
  });

  it("adds, moves, duplicates and removes a row", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(2, 2));
    const before = structuredClone(market(store));

    await user.click(button("Add row above"));
    expect(market(store)).toHaveLength(12);
    expect(market(store)[1]).toEqual(Array(19).fill(null));
    expect(market(store)[2]).toEqual(before[1]);
    expect(cell(2, 2)).toHaveFocus();
    expect(screen.getByTestId("market-status")).toHaveTextContent(
      "Added row 2",
    );

    await user.click(button("Move row 2 down"));
    expect(market(store)[2]).toEqual(Array(19).fill(null));
    await user.click(button("Duplicate row 3"));
    expect(market(store)[3]).toEqual(market(store)[2]);
    await user.click(button("Remove row 4"));
    await user.click(cell(3, 1));
    await user.click(button("Remove row 3"));
    expect(market(store)).toHaveLength(11);
    expect(market(store)[1]).toEqual(before[1]);
    expect(market(store)[2]).toEqual(before[2]);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("removes a row and puts it back with undo", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(3, 2));
    await user.click(button("Remove row 3"));
    expect(market(store)).toHaveLength(10);
    expect(
      screen.getByText("Removed row 3", { selector: "span" }),
    ).toBeVisible();
    // The cell that took the place is selected
    expect(cell(3, 1)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(market(store)).toEqual(games["18Test"].stock.market);
    expect(selectGameChanged(store.getState())).toBe(false);
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
  });

  it("disables moving at the edges", async () => {
    const { user } = open(marketRoute);
    await grid();
    expect(button("Add row above")).toBeDisabled();
    await user.click(cell(1, 1));
    expect(button("Move row 1 up")).toBeDisabled();
    expect(button("Move column 1 left")).toBeDisabled();
    expect(button("Move row 1 down")).toBeEnabled();
    await user.click(cell(11, 7));
    expect(button("Move row 11 down")).toBeDisabled();
  });

  it("adds, moves, duplicates and removes a column, the triangle stays one", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    const lengths = () => market(store).map((row) => row.length);
    const before = lengths();

    await user.click(button("Add column to the right"));
    // Rows with at least 3 cells get one
    expect(lengths()).toEqual(before.map((n) => (n >= 2 ? n + 1 : n)));
    expect(market(store)[0][2]).toBeNull();
    await user.click(button("Duplicate column 3"));
    expect(market(store)[0][3]).toBeNull();
    await user.click(button("Move column 4 left"));
    await user.click(button("Remove column 3"));
    await user.click(button("Remove column 3"));
    expect(market(store)).toEqual(games["18Test"].stock.market);
  });

  it("removes the last column and the last row, the market stays", async () => {
    const { user, store } = open(marketRoute, {
      ...games["18Test"],
      stock: { ...games["18Test"].stock, market: [[5]] },
    });
    await grid();
    await user.click(cell(1, 1));
    await user.click(button("Remove column 1"));
    expect(market(store)).toEqual([[]]);
    expect(stock(store).type).toBe("2D");
    expect(await screen.findByText("The market has no cells.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(market(store)).toEqual([[5]]);
  });

  it("shows a market of one row for 1D, with column actions only", async () => {
    const { user, store } = open(marketRoute, oneD);
    await grid();
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      1,
    );
    await user.click(screen.getAllByRole("gridcell")[3]);
    expect(
      screen.queryByRole("group", { name: "Row" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Column" })).toBeVisible();
    expect(screen.getByRole("gridcell", { name: /^Cell 4:/ })).toBeVisible();
    const count = market(store).length;
    await user.click(button("Add column to the left"));
    expect(market(store)).toHaveLength(count + 1);
    expect(market(store)[3]).toBeNull();
    await user.keyboard("{ArrowDown}");
  });

  it("draws a 1Diag market in two rows, a column is two cells", async () => {
    const diag = {
      ...games["18Test"],
      stock: { type: "1Diag", market: [1, 2, 3, 4, 5] },
    };
    const { user, store } = open(marketRoute, diag);
    await grid();
    const rows = within(screen.getByRole("grid")).getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getAllByRole("gridcell")).toHaveLength(3);
    expect(within(rows[1]).getAllByRole("gridcell")).toHaveLength(2);
    expect(screen.getByText(/two rows: the even cells on top/)).toBeVisible();

    const diagCell = (name) =>
      screen.getByRole("gridcell", { name: new RegExp(`^${name}:`) });
    await user.click(diagCell("Column 1, bottom"));
    await user.keyboard("{ArrowRight}");
    expect(diagCell("Column 2, bottom")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(diagCell("Column 2, top")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(diagCell("Column 2, bottom")).toHaveFocus();
    // The inspector names the cell as the grid does
    expect(await inspector()).toHaveTextContent("Column 2, bottom");

    await user.click(button("Add column to the left"));
    expect(market(store)).toEqual(
      [1, 2, 3, 4, 5].flatMap((n, i) => (i === 2 ? [null, null, n] : [n])),
    );
    await user.click(button("Remove column 2"));
    expect(market(store)).toEqual([1, 2, 3, 4, 5]);
  });

  it("adds, duplicates and moves the half full last column of a 1Diag market", async () => {
    const diag = {
      ...games["18Test"],
      stock: { type: "1Diag", market: [1, 2, 3, 4, 5] },
    };
    const { user, store } = open(marketRoute, diag);
    await grid();
    await user.click(screen.getByRole("gridcell", { name: /^Column 3, top:/ }));
    await user.click(button("Add column to the right"));
    expect(market(store)).toEqual([1, 2, 3, 4, 5, null, null, null]);
    await user.click(button("Remove column 4"));
    await user.click(screen.getByRole("gridcell", { name: /^Column 3, top:/ }));
    await user.click(button("Duplicate column 3"));
    expect(market(store)).toEqual([1, 2, 3, 4, 5, null, 5, null]);
    await user.click(button("Remove column 4"));
    await user.click(button("Move column 3 left"));
    expect(market(store)).toEqual([1, 2, 5, null, 3, 4]);
  });

  it("removing a column that empties rows drops them, undo brings them back", async () => {
    const { user, store } = open(marketRoute, {
      ...games["18Test"],
      stock: { ...games["18Test"].stock, market: [[1, 2], [3], [4, 5]] },
    });
    await grid();
    await user.click(cell(1, 1));
    await user.click(button("Remove column 1"));
    expect(market(store)).toEqual([[2], [5]]);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(market(store)).toEqual([[1, 2], [3], [4, 5]]);
  });

  it("forgets the undo of a removed row when the type changes", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(3, 1));
    await user.click(button("Remove row 3"));
    expect(
      screen.getByText("Removed row 3", { selector: "span" }),
    ).toBeVisible();
    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "1Diag" }));
    expect(
      screen.queryByText("Removed row 3", { selector: "span" }),
    ).not.toBeInTheDocument();
    expect(stock(store).type).toBe("1Diag");
  });

  it("forgets the note of the rows a type change dropped at the next edit", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "1D" }));
    expect(
      await screen.findByText("10 rows were removed from the market."),
    ).toBeVisible();
    await user.click(screen.getByRole("gridcell", { name: /^Cell 2:/ }));
    await user.keyboard("{Delete}");
    expect(market(store)[1]).toBeNull();
    await waitFor(() =>
      expect(
        screen.queryByText("10 rows were removed from the market."),
      ).not.toBeInTheDocument(),
    );
  });

  it("changes the type, warns when rows are dropped and undoes it", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    const changes = [];
    store.subscribe(() => changes.push(stock(store).type));

    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "1D" }));
    expect(stock(store).type).toBe("1D");
    expect(market(store)).toEqual(games["18Test"].stock.market[0]);
    expect(stock(store).legend).toEqual(games["18Test"].stock.legend);
    expect(
      await screen.findByText("10 rows were removed from the market."),
    ).toBeVisible();
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      1,
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(stock(store).type).toBe("2D");
    expect(market(store)).toEqual(games["18Test"].stock.market);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("a flat market becomes the row of a 2D market, in one edit", async () => {
    const { user, store } = open(marketRoute, oneD);
    await grid();
    // count game edits only: other dispatches (validation) also notify
    let edits = 0;
    let last = stock(store);
    store.subscribe(() => {
      if (stock(store) !== last) edits++;
      last = stock(store);
    });
    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "2D" }));
    expect(market(store)).toEqual([oneD.stock.market]);
    expect(edits).toBe(1);
    expect(
      screen.queryByText(/rows? w(as|ere) removed/),
    ).not.toBeInTheDocument();
  });

  it("shows the problems of a cell on the cell and its field", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    act(() =>
      store.dispatch(
        editGame((g) => ({
          ...g,
          stock: {
            ...g.stock,
            market: [
              [
                { value: 60, legend: -1, par: "yes" },
                ...g.stock.market[0].slice(1),
              ],
              ...g.stock.market.slice(1),
            ],
          },
        })),
      ),
    );
    await waitFor(() =>
      expect(cell(1, 1)).toHaveAccessibleName(/has a problem/),
    );
    await user.click(cell(1, 1));
    const fields = await inspector();
    await waitFor(() =>
      expect(within(fields).getAllByRole("alert").length).toBeGreaterThan(0),
    );
    expect(
      selectGameProblems(store.getState(), "internal:abc").some((i) =>
        i.pointer.startsWith("stock.market[0][0]"),
      ),
    ).toBe(true);
  });

  it("warns about a legend number and a par without a chart, outside the problems", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    // The first check may not have started yet (status idle): wait for its result
    await waitFor(() =>
      expect(
        selectGameProblems(store.getState(), "internal:abc"),
      ).toBeDefined(),
    );
    await settled();
    const before = selectGameProblems(store.getState(), "internal:abc");
    act(() =>
      store.dispatch(
        editGame((g) => ({
          ...g,
          stock: {
            ...g.stock,
            par: undefined,
            market: [
              [
                { value: 60, legend: 9, par: true },
                ...g.stock.market[0].slice(1),
              ],
              ...g.stock.market.slice(1),
            ],
          },
        })),
      ),
    );
    await user.click(cell(1, 1));
    expect(
      await screen.findByText("The legend has no entry 9 (the first is 0)."),
    ).toBeVisible();
    expect(
      screen.getByText(
        "This cell is a par value, but the market has no par chart.",
      ),
    ).toBeVisible();
    await settled();
    expect(selectGameProblems(store.getState(), "internal:abc")).toEqual(
      before,
    );
  });

  it("warns when a legend entry that cells use is moved or removed", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    const used = (legend) =>
      within(screen.getByRole("grid"))
        .getAllByRole("gridcell")
        .filter((c) =>
          c.getAttribute("aria-label").includes(`legend ${legend}`),
        ).length;
    expect(used(1)).toBeGreaterThan(0);

    await user.click(
      screen.getAllByRole("button", { name: /^Move legend entry .* down$/ })[0],
    );
    expect(store.getState().game.stock.legend[1].color).toBe("yellow");
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      /cells? uses? a legend number that now means another entry/,
    );

    await user.click(
      screen.getAllByRole("button", { name: /^Remove legend entry / })[2],
    );
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      /cells? uses? a legend number/,
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByTestId("list-warning")).not.toBeInTheDocument();
  });

  it("a new legend entry has its description, and is a legend entry", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    await user.click(screen.getByRole("button", { name: "Add legend entry" }));
    expect(stock(store).legend).toHaveLength(4);
    expect(stock(store).legend[3]).toEqual({ description: "New entry" });
    await user.click(
      screen.getByRole("button", { name: "Duplicate legend entry New entry" }),
    );
    expect(stock(store).legend[4]).toEqual({ description: "New entry" });
  });

  it("titles a legend entry by its description, not by token fields", async () => {
    const { user } = open(marketRoute, {
      ...structuredClone(games["18Test"]),
      stock: {
        ...structuredClone(games["18Test"].stock),
        legend: [{ color: "red", label: "Hidden", cost: 5 }, { color: "blue" }],
      },
    });
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    expect(
      screen.getByRole("button", { name: "Remove legend entry #1" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Remove legend entry #2" }),
    ).toBeVisible();
  });

  it("warns when duplicating a legend entry moves the ones after it", async () => {
    const { user } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    await user.click(
      screen.getAllByRole("button", { name: /^Duplicate legend entry / })[0],
    );
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      /cells? uses? a legend number that now means another entry/,
    );
  });

  it("edits the cell defaults", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Cell defaults" }));
    await user.type(await field("Color"), "blue{Enter}");
    expect(stock(store).cell).toEqual({ color: "blue" });
    await user.clear(await field("Color"));
    await user.tab();
    expect("cell" in stock(store)).toBe(false);
  });

  it("edits the movement and never the place it is drawn", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Movement" }));
    const up = screen.getByRole("textbox", { name: "Up" });
    expect(up).toHaveValue("Sold out");
    await user.clear(up);
    await user.type(up, "First{Enter}Second");
    await user.tab();
    expect(stock(store).movement.up).toEqual(["First", "Second"]);
    expect(stock(store).display).toEqual(games["18Test"].stock.display);

    await user.type(screen.getByRole("textbox", { name: "New key" }), "3x");
    await user.type(
      screen.getByRole("textbox", { name: "Text" }),
      "Far{Enter}",
    );
    expect(stock(store).movement["3x"]).toEqual(["Far"]);
    await user.clear(screen.getByRole("textbox", { name: "3x" }));
    await user.tab();
    expect("3x" in stock(store).movement).toBe(false);
    expect(stock(store).display).toEqual(games["18Test"].stock.display);
  });

  it("does not add a movement key that is there, it would replace its texts", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Movement" }));
    await user.type(screen.getByRole("textbox", { name: "New key" }), "up");
    await user.type(screen.getByRole("textbox", { name: "Text" }), "Other");
    expect(screen.getByRole("button", { name: "Add key" })).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Text" }), "{Enter}");
    expect(stock(store).movement.up).toEqual(["Sold out"]);
  });

  it("keeps ledges, limits and display as JSON", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: /^Advanced/ }));
    const display = screen.getByRole("textbox", { name: "Display" });
    expect(JSON.parse(display.value)).toEqual(games["18Test"].stock.display);
    await user.clear(screen.getByRole("textbox", { name: "Limits" }));
    await user.type(screen.getByRole("textbox", { name: "Limits" }), "[[]");
    await user.tab();
    expect(stock(store).limits).toEqual([]);
  });

  it("an empty market renders the panel and the market page, without leaving", async () => {
    const { user, router, store } = open(
      `${route.replace("map", "market")}?edit=true&editSection=market`,
    );
    await grid();
    for (const [index] of market(store).entries()) {
      void index;
    }
    act(() =>
      store.dispatch(
        editGame((g) => ({ ...g, stock: { ...g.stock, market: [] } })),
      ),
    );
    expect(await screen.findByText("The market has no cells.")).toBeVisible();
    expect(router.state.location.pathname).toContain("/market");
    await user.click(screen.getByRole("button", { name: "Add row" }));
    expect(market(store)).toEqual([[null]]);
    expect(screen.getByRole("gridcell", { name: /empty/ })).toBeVisible();
  });

  it("a game without a stock market can create one", async () => {
    const { user, store } = open(marketRoute, omit(["stock"], games["18Test"]));
    expect(
      await screen.findByText("This game has no stock market yet."),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Create a market" }));
    expect(stock(store)).toEqual({
      type: "2D",
      market: Array.from({ length: 3 }, () => [null, null, null]),
    });
    expect(await grid()).toBeVisible();
  });

  it("edits the right cell after a row was moved", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    await user.click(button("Move row 1 down"));
    expect(cell(2, 2)).toHaveAttribute("aria-selected", "true");
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    expect(value).toHaveValue("67");
    await user.clear(value);
    await user.type(value, "77{Enter}");
    expect(market(store)[1][1]).toBe(77);
    expect(market(store)[0][1]).toEqual(games["18Test"].stock.market[1][1]);
  });

  it("keeps what is typed in a field when another cell is picked", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    await user.clear(value);
    await user.type(value, "99");
    await user.click(cell(1, 3));
    expect(market(store)[0][1]).toBe(99);
    expect(market(store)[0][2]).toBe(71);
  });
});

describe("edit panel rounds", () => {
  const roundsRoute = `${route}?edit=true&editSection=rounds`;
  const ready = () => screen.findByRole("button", { name: "Add round" });
  const game = () => opened.getState().game;

  it("is a tab, with a card for each round and turn", async () => {
    open(roundsRoute);
    await ready();
    const tabs = screen.getAllByRole("tab");
    const tab = tabs.find((candidate) => candidate.id.endsWith("rounds"));
    expect(tab).toHaveAccessibleName("Rounds");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tabs[tabs.indexOf(tab) + 1]).toHaveAccessibleName("Companies");
    expect(cards().length).toBeGreaterThanOrEqual(
      games["18Test"].rounds.length + games["18Test"].turns.length,
    );
    expect(screen.getByRole("button", { name: "Add turn" })).toBeVisible();
  });

  it("selects by click", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await panel();
    await user.click(screen.getByRole("tab", { name: "Rounds" }));
    await ready();
    expect(router.state.location.search).toBe("?edit=true&editSection=rounds");
  });

  it("adds and removes a round", async () => {
    const { user } = open(roundsRoute);
    await ready();
    const count = game().rounds.length;
    await user.click(screen.getByRole("button", { name: "Add round" }));
    expect(game().rounds).toHaveLength(count + 1);
    await user.click(
      screen.getAllByRole("button", { name: /^Remove round / })[count],
    );
    expect(game().rounds).toHaveLength(count);
  });

  it("keeps the page drawing when the last round is removed", async () => {
    const { user } = open(roundsRoute);
    await ready();
    const count = game().rounds.length;
    for (let i = 0; i < count; i++) {
      await user.click(
        screen.getAllByRole("button", { name: /^Remove round / })[0],
      );
    }
    expect(game().rounds ?? []).toEqual([]);
    expect(await screen.findByTestId("game-internal:abc-map")).toBeVisible();
    expect(screen.getByTestId("edit-panel")).toBeVisible();
  });

  it("titles the lists", async () => {
    open(roundsRoute);
    await ready();
    const scope = within(screen.getByTestId("edit-panel"));
    ["Rounds", "Turns"].forEach((name) =>
      expect(scope.getAllByRole("heading", { name })[0]).toBeVisible(),
    );
    expect(scope.getByRole("textbox", { name: "Number Cards" })).toBeVisible();
  });

  it("keeps the removed fields of the game when a round is added", async () => {
    const pools = [{ name: "Bank", notes: [{ note: "Pays" }] }];
    const { user } = open(roundsRoute, {
      ...structuredClone(games["18Test"]),
      pools,
      floatPercent: 50,
    });
    await ready();
    await user.click(screen.getByRole("button", { name: "Add round" }));
    expect(game().pools).toEqual(pools);
    expect(game().floatPercent).toBe(50);
  });

  it("edits a turn: its steps, ordered and optional steps", async () => {
    const { user } = open(roundsRoute);
    await ready();
    const count = game().turns.length;
    await user.click(screen.getByRole("button", { name: "Add turn" }));
    expect(game().turns).toHaveLength(count + 1);
    expect(game().turns[count].name).toBeTruthy();

    const card = cards().find((el) =>
      within(el).queryByRole("button", {
        name: "Remove turn " + game().turns[count].name,
      }),
    );
    const steps = within(card).getByRole("textbox", { name: "Steps" });
    await user.type(steps, "Buy{Enter}Sell");
    await user.tab();
    expect(game().turns[count].steps).toEqual(["Buy", "Sell"]);
    await user.click(within(card).getByRole("combobox", { name: "Ordered" }));
    await user.click(await screen.findByRole("option", { name: "Yes" }));
    expect(game().turns[count].ordered).toBe(true);

    await user.click(
      within(card).getByRole("button", {
        name: "Remove turn " + game().turns[count].name,
      }),
    );
    expect(game().turns).toHaveLength(count);
  });

  it("edits the number cards, one color per line", async () => {
    const { user } = open(roundsRoute, {
      ...structuredClone(games["18Test"]),
      numberCards: ["red", "blue"],
    });
    await ready();
    const area = screen.getByRole("textbox", { name: "Number Cards" });
    expect(area).toHaveValue("red\nblue");
    await user.type(area, "\ngreen");
    await user.tab();
    expect(game().numberCards).toEqual(["red", "blue", "green"]);
  });
});

describe("edit panel colors", () => {
  const colorsRoute = `${route}?edit=true&editSection=colors`;
  const ready = () => screen.findByRole("button", { name: "Add color" });
  const game = () => opened.getState().game;

  it("is a tab, with a swatch and a text field for each color", async () => {
    open(colorsRoute, {
      ...structuredClone(games["18Test"]),
      colors: { short: "pink", accent: "#3a7bd5" },
    });
    await ready();
    const tabs = screen.getAllByRole("tab");
    const tab = tabs.find((candidate) => candidate.id.endsWith("colors"));
    expect(tab).toHaveAccessibleName("Colors");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tabs[tabs.indexOf(tab) + 1]).toHaveAccessibleName("Output");
    expect(screen.getByRole("textbox", { name: "Accent" })).toHaveValue(
      "#3a7bd5",
    );
    const swatches = screen.getAllByTestId("color-swatch");
    expect(swatches).toHaveLength(2);
    expect(swatches[0]).toHaveStyle({ backgroundColor: "rgb(255, 192, 203)" });
    expect(
      screen.getByLabelText("Pick a color for Accent", { selector: "input" }),
    ).toHaveValue("#3a7bd5");
  });

  it("edits a color as text, and with the picker", async () => {
    const { user } = open(colorsRoute, {
      ...structuredClone(games["18Test"]),
      colors: { short: "pink" },
    });
    await ready();
    const text = screen.getByRole("textbox", { name: "Short" });
    await user.clear(text);
    await user.type(text, "#fff");
    await user.tab();
    expect(game().colors).toEqual({ short: "#fff" });
    fireEvent.change(screen.getByLabelText("Pick a color for Short"), {
      target: { value: "#112233" },
    });
    expect(game().colors).toEqual({ short: "#112233" });
    expect(screen.getByRole("textbox", { name: "Short" })).toHaveValue(
      "#112233",
    );
  });

  it("does not bring a color back when it is removed after picking it", async () => {
    const { user } = open(colorsRoute, {
      ...structuredClone(games["18Test"]),
      colors: { short: "pink" },
    });
    await ready();
    fireEvent.change(screen.getByLabelText("Pick a color for Short"), {
      target: { value: "#112233" },
    });
    expect(game().colors).toEqual({ short: "#112233" });
    await user.click(
      screen.getByRole("button", { name: "Remove color short" }),
    );
    expect(game().colors ?? {}).toEqual({});
  });

  it("adds, renames and removes a color", async () => {
    const { user } = open(colorsRoute, {
      ...structuredClone(games["18Test"]),
      colors: { short: "pink" },
    });
    await ready();
    await user.click(screen.getByRole("button", { name: "Add color" }));
    expect(game().colors).toEqual({ short: "pink", new: "" });
    const name = screen.getByRole("textbox", { name: "Name of new" });
    await user.clear(name);
    await user.type(name, "lime");
    await user.tab();
    expect(Object.keys(game().colors)).toEqual(["short", "lime"]);
    await user.click(screen.getByRole("button", { name: "Remove color lime" }));
    expect(game().colors).toEqual({ short: "pink" });
  });

  it("leaves a color by phase as JSON", async () => {
    open(colorsRoute, {
      ...structuredClone(games["18Test"]),
      colors: { phased: { 2: "red", 3: "blue" } },
    });
    await ready();
    expect(screen.getByRole("textbox", { name: "Phased" })).toHaveValue(
      JSON.stringify({ 2: "red", 3: "blue" }, null, 2),
    );
    expect(screen.queryByTestId("color-swatch")).not.toBeInTheDocument();
  });
});

describe("edit panel output", () => {
  const outputRoute = `${route}?edit=true&editSection=output`;
  const ready = () => screen.findByRole("spinbutton", { name: "Max" });
  const game = () => opened.getState().game;
  const base = () => structuredClone(games["18Test"]);

  it("is a tab, with the revenue and exports", async () => {
    open(outputRoute, {
      ...base(),
      revenue: { min: 10, max: 200, perRow: 15 },
      exports: { formats: ["pdf", "svg"], layouts: "all", paginated: true },
    });
    await ready();
    const tabs = screen.getAllByRole("tab");
    const tab = tabs.find((candidate) => candidate.id.endsWith("output"));
    expect(tab).toHaveAccessibleName("Output");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tabs[tabs.length - 2]).toBe(tab);
    expect(tabs[tabs.length - 1]).toHaveAccessibleName("Config");
    expect(screen.getByRole("spinbutton", { name: "Max" })).toHaveValue(200);
    expect(screen.getByRole("checkbox", { name: "pdf" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "png" })).not.toBeChecked();
    // The deprecated option is not shown
    expect(screen.queryByText("Paginated")).not.toBeInTheDocument();
    expect(screen.queryByText(/paginated/i)).not.toBeInTheDocument();
    for (const role of ["checkbox", "textbox", "spinbutton", "combobox"]) {
      expect(
        screen.queryByRole(role, { name: /paginated/i }),
      ).not.toBeInTheDocument();
    }
  });

  it("leaves the game byte for byte as it was when fields are only visited", async () => {
    const { user } = open(outputRoute, {
      ...base(),
      revenue: { max: 200 },
      exports: { formats: ["pdf"], paginated: false, png: { dpi: 300 } },
      upgrades: { yellow: ["a", "b"] },
    });
    await ready();
    const before = JSON.stringify(game());
    for (const role of ["textbox", "spinbutton", "combobox", "checkbox"]) {
      for (const box of within(screen.getByTestId("edit-panel")).queryAllByRole(
        role,
      )) {
        box.focus();
        box.blur();
      }
    }
    await user.tab();
    expect(JSON.stringify(game())).toBe(before);
  });

  it("keeps the unknown paginated option when the exports are edited", async () => {
    const { user } = open(outputRoute, {
      ...base(),
      exports: { formats: ["pdf"], paginated: true },
    });
    await ready();
    await user.click(screen.getByRole("checkbox", { name: "png" }));
    expect(game().exports).toEqual({
      formats: ["pdf", "png"],
      paginated: true,
    });
  });

  it("keeps paginated when another exports field is edited and cleared", async () => {
    const { user } = open(outputRoute, {
      ...base(),
      exports: { paginated: true },
    });
    await ready();
    const dpi = screen.getByRole("spinbutton", { name: /dpi/i });
    await user.type(dpi, "300");
    await user.tab();
    expect(game().exports).toEqual({ paginated: true, png: { dpi: 300 } });
    await user.clear(dpi);
    await user.tab();
    expect(game().exports.paginated).toBe(true);
    expect(game().exports).toMatchObject({ paginated: true });
  });

  it("edits the revenue range", async () => {
    const { user } = open(outputRoute, { ...base(), revenue: undefined });
    await ready();
    const max = screen.getByRole("spinbutton", { name: "Max" });
    await user.type(max, "250");
    await user.tab();
    expect(game().revenue).toEqual({ max: 250 });
  });
});
