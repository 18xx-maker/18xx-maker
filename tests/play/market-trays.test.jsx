import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { game, mount, option, tab } from "@tests/support/playBoard.jsx";
import { one } from "@tests/support/render.jsx";

// Counts the renders of the print market the board reuses
const { renders } = vi.hoisted(() => ({ renders: { market: 0 } }));
vi.mock("@/components/market/Market", async (importOriginal) => {
  const { default: Original } = await importOriginal();
  const Counted = (props) => {
    renders.market += 1;
    return <Original {...props} />;
  };
  return { default: Counted };
});

const withStock = (stock) => ({ ...game, stock: { ...stock } });
const oneD = withStock({ type: "1D", market: [10, 20, 30, 40] });
const diag = withStock({ type: "1Diag", market: [10, 20, 30, 40, 50] });
const move = (marker, row, col) => ({
  type: "market.move",
  marker,
  cell: { row, col },
});

const marketOf = (board) => one(board, "svg[data-play-market]");
const marker = (board, abbrev) => one(board, `[data-marker="${abbrev}"]`);
const target = (board, row, col) =>
  one(board, `[data-market-cell="${row}-${col}"]`);

// The cell group of the print market at a translate, not a marker
const printCell = (board, transform) =>
  one(
    marketOf(board),
    `g[transform="${transform}"]:not([data-marker]):not([data-market-cell])`,
  );

const seats = [
  { userId: 7, name: "Ann" },
  { userId: 8, name: "Bob" },
];
const tray = (name) => screen.getByRole("group", { name });
const notes = () => screen.getByRole("textbox", { name: "Notes" });

describe("play market", () => {
  it("draws a company marker on its cell of a 2D market", async () => {
    const { board, user } = await mount({ log: [move("BLRR", 1, 2)] });
    await tab(user, "Market");
    // 70 by 85 cells under the 50 of the title
    const drawn = marker(board, "BLRR");
    expect(drawn).toHaveAttribute("transform", "translate(140 135)");
    expect(one(drawn, "circle, path")).toBeInTheDocument();
    expect(one(drawn, "[data-placeholder]")).toBeNull();
    expect(printCell(board, "translate(140 135)")).toBeInTheDocument();
  });

  it("draws a marker on its cell of a 1D market", async () => {
    const { board, user } = await mount({
      game: oneD,
      log: [move("BLRR", 0, 3)],
    });
    await tab(user, "Market");
    expect(marker(board, "BLRR")).toHaveAttribute(
      "transform",
      "translate(210 50)",
    );
    expect(printCell(board, "translate(210 50)")).toBeInTheDocument();
  });

  it("draws a marker on its cell of a 1Diag market", async () => {
    const { board, user } = await mount({
      game: diag,
      log: [move("BLRR", 0, 3), move("LBRR", 0, 2)],
    });
    await tab(user, "Market");
    // Every other cell is a cell (two of 85) lower, half a cell further
    expect(marker(board, "BLRR")).toHaveAttribute(
      "transform",
      "translate(105 220)",
    );
    expect(marker(board, "LBRR")).toHaveAttribute(
      "transform",
      "translate(70 50)",
    );
    expect(printCell(board, "translate(105 220)")).toBeInTheDocument();
  });

  it("moves the chosen company's marker to a clicked cell", async () => {
    const { board, send, user } = await mount();
    await tab(user, "Market");
    await user.click(option(board, "marker", "BLRR"));
    await user.click(target(board, 1, 2));
    expect(send).toHaveBeenCalledWith(move("BLRR", 1, 2));
    expect(marker(board, "BLRR")).toHaveAttribute(
      "transform",
      "translate(140 135)",
    );
  });

  it.each([
    ["1D", oneD],
    ["1Diag", diag],
  ])("sends row 0 and the cell index on a %s market", async (_, g) => {
    const { board, send, user } = await mount({ game: g });
    await tab(user, "Market");
    await user.click(option(board, "marker", "LBRR"));
    await user.click(target(board, 0, 3));
    expect(send).toHaveBeenCalledWith(move("LBRR", 0, 3));
  });

  it("sends nothing on a click without a chosen company", async () => {
    const { board, send, user } = await mount();
    await tab(user, "Market");
    await user.click(target(board, 0, 0));
    expect(send).not.toHaveBeenCalled();
  });

  it("draws no marker on a cell that does not exist, and a placeholder for an unknown company", async () => {
    const { board, user } = await mount({
      log: [move("BLRR", 99, 99), move("LBRR", 2, 18), move("NOCO", 0, 0)],
    });
    await tab(user, "Market");
    expect(marketOf(board)).toBeInTheDocument();
    expect(marker(board, "BLRR")).toBeNull();
    // Row 2 of 18Test has 16 cells
    expect(marker(board, "LBRR")).toBeNull();
    const unknown = marker(board, "NOCO");
    expect(one(unknown, '[data-placeholder="company"]')).toBeInTheDocument();
    expect(unknown).toHaveTextContent("NOCO");
  });

  it("stacks the markers of one cell", async () => {
    const { board, user } = await mount({
      log: [move("BLRR", 0, 0), move("LBRR", 0, 0)],
    });
    await tab(user, "Market");
    const at = (abbrev) =>
      one(marker(board, abbrev), "g").getAttribute("transform");
    expect(at("BLRR")).not.toBe(at("LBRR"));
  });

  it("shows a notice for a game without a market", async () => {
    const { board, user } = await mount({
      game: { ...game, stock: undefined },
      log: [move("BLRR", 0, 0)],
    });
    await tab(user, "Market");
    expect(board).toHaveTextContent("This game has no market.");
  });

  it("does not draw the print market again when a company is chosen", async () => {
    const { board, user } = await mount({ log: [move("BLRR", 0, 0)] });
    await tab(user, "Market");
    const before = renders.market;
    expect(before).toBeGreaterThan(0);
    await user.click(option(board, "marker", "LBRR"));
    await user.click(option(board, "marker", "BLRR"));
    expect(renders.market).toBe(before);
  });
});

describe("play trays", () => {
  it("lists the bank and the tray of every seat", async () => {
    const { user } = await mount({
      seats,
      log: [
        { type: "tray.move", item: "BLRR", from: "bank", to: "7" },
        { type: "tray.move", item: "63", from: "bank", to: "bank" },
      ],
    });
    await tab(user, "Trays");
    expect(tray("Bank")).toHaveTextContent("63");
    expect(tray("Ann")).toHaveTextContent("BLRR");
    expect(tray("Bob")).toHaveTextContent("Empty");
  });

  it("moves an item to another tray", async () => {
    const { send, user } = await mount({
      seats,
      log: [{ type: "tray.move", item: "BLRR", from: "bank", to: "7" }],
    });
    await tab(user, "Trays");
    await user.click(
      within(tray("Ann")).getByRole("combobox", { name: "Move BLRR" }),
    );
    await user.click(screen.getByRole("option", { name: "Bob" }));
    expect(send).toHaveBeenCalledWith({
      type: "tray.move",
      item: "BLRR",
      from: "7",
      to: "8",
    });
    expect(tray("Bob")).toHaveTextContent("BLRR");
    expect(tray("Ann")).toHaveTextContent("Empty");
  });

  it("adds a company or a tile of the game from the bank", async () => {
    const { send, user } = await mount({ seats });
    await tab(user, "Trays");
    await user.click(
      within(tray("Bob")).getByRole("combobox", { name: "Add from the bank" }),
    );
    const names = screen.getAllByRole("option").map((o) => o.textContent);
    expect(names).toEqual(expect.arrayContaining(["BLRR", "63"]));
    await user.click(screen.getByRole("option", { name: "63" }));
    expect(send).toHaveBeenCalledWith({
      type: "tray.move",
      item: "63",
      from: "bank",
      to: "8",
    });
    expect(tray("Bob")).toHaveTextContent("63");
  });

  it("lists a tray of the log that has no seat", async () => {
    const { user } = await mount({
      log: [{ type: "tray.move", item: "BLRR", from: "bank", to: "99" }],
    });
    await tab(user, "Trays");
    expect(tray("99")).toHaveTextContent("BLRR");
  });
});

describe("play notes", () => {
  it("shows the notes and saves an edit once, on blur", async () => {
    const { send, user } = await mount({
      log: [{ type: "note.set", text: "Hello" }],
    });
    await tab(user, "Notes");
    expect(notes()).toHaveValue("Hello");
    await user.click(notes());
    await user.type(notes(), " world");
    expect(send).not.toHaveBeenCalled();
    await user.tab();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      type: "note.set",
      text: "Hello world",
    });
    expect(notes()).toHaveValue("Hello world");
  });

  it("sends nothing on a blur without a change", async () => {
    const { send, user } = await mount({
      log: [{ type: "note.set", text: "Hello" }],
    });
    await tab(user, "Notes");
    await user.click(notes());
    await user.tab();
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects notes over 10000 characters with a message", async () => {
    const { send, user } = await mount();
    await tab(user, "Notes");
    await user.click(notes());
    fireEvent.change(notes(), { target: { value: "x".repeat(10001) } });
    expect(screen.getByRole("alert")).toHaveTextContent(/10000/);
    expect(notes()).toHaveAttribute("aria-invalid", "true");
    await user.tab();
    expect(send).not.toHaveBeenCalled();
  });

  it("saves notes of exactly 10000 characters", async () => {
    const { send, user } = await mount();
    await tab(user, "Notes");
    await user.click(notes());
    fireEvent.change(notes(), { target: { value: "x".repeat(10000) } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.tab();
    expect(send).toHaveBeenCalledWith({
      type: "note.set",
      text: "x".repeat(10000),
    });
  });
});

describe("locked play game", () => {
  it("disables the market, the trays and the notes", async () => {
    const { board, send, user } = await mount({
      locked: true,
      seats,
      log: [
        move("BLRR", 0, 0),
        { type: "tray.move", item: "BLRR", from: "bank", to: "7" },
        { type: "note.set", text: "Hello" },
      ],
    });
    await tab(user, "Market");
    expect(option(board, "marker", "LBRR")).toBeDisabled();
    await user.click(target(board, 1, 2));
    expect(marker(board, "BLRR")).toHaveAttribute(
      "transform",
      "translate(0 50)",
    );

    await tab(user, "Trays");
    expect(
      within(tray("Ann")).getByRole("combobox", { name: "Move BLRR" }),
    ).toBeDisabled();
    expect(
      within(tray("Bob")).getByRole("combobox", { name: "Add from the bank" }),
    ).toBeDisabled();

    await tab(user, "Notes");
    expect(notes()).toBeDisabled();
    expect(notes()).toHaveValue("Hello");
    expect(send).not.toHaveBeenCalled();
  });
});
