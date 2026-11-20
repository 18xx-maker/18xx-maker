import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setToken } from "@/play/client/tokenStore";

import { renderApp } from "@tests/support/helpers.jsx";
import {
  cell,
  drag,
  game,
  mount,
  option,
  svgOf,
  tab,
  tap,
} from "@tests/support/playBoard.jsx";
import { BASE, fakeServer } from "@tests/support/playServer.js";
import { one } from "@tests/support/render.jsx";

describe("play board", () => {
  it("has a board root and reuses the print map", async () => {
    const { board } = await mount();
    expect(board).toHaveAttribute("data-testid", "play-board");
    // The base map is the print map: the cells are drawn under the targets
    expect(cell(board, "B12")).toBeInTheDocument();
    expect(board).toHaveTextContent(game.info.title);
  });

  it("draws placed tiles on their hexes with the rotation", async () => {
    const { board } = await mount({
      log: [{ type: "tile.place", hex: "B12", tile: "63", rotation: 2 }],
    });
    const tile = one(board, '[data-tile-hex="B12"]');
    expect(tile).toHaveAttribute("data-tile", "63");
    expect(tile).toHaveAttribute(
      "transform",
      expect.stringMatching(/rotate\(120\)$/),
    );
    expect(one(tile, "path, circle, polygon")).toBeInTheDocument();
  });

  it("selects a clicked hex", async () => {
    const { board, send } = await mount();
    tap(board, cell(board, "B12"));
    expect(one(board, '[data-selected="B12"]')).toBeInTheDocument();
    expect(send).not.toHaveBeenCalled();
  });

  it("places the chosen tile with the chosen rotation", async () => {
    const { board, send, user } = await mount();
    await user.click(option(board, "tile", "63"));
    await user.click(screen.getByRole("button", { name: "Rotate right" }));
    await user.click(screen.getByRole("button", { name: "Rotate right" }));
    tap(board, cell(board, "B14"));
    expect(send).toHaveBeenCalledWith({
      type: "tile.place",
      hex: "B14",
      tile: "63",
      rotation: 2,
    });
    expect(one(board, '[data-tile-hex="B14"]')).toBeInTheDocument();
  });

  it("rotates and removes the tile of the selected hex", async () => {
    const { board, send, user } = await mount({
      log: [{ type: "tile.place", hex: "B12", tile: "63", rotation: 5 }],
    });
    tap(board, cell(board, "B12"));
    await user.click(screen.getByRole("button", { name: "Rotate tile" }));
    expect(send).toHaveBeenLastCalledWith({
      type: "tile.rotate",
      hex: "B12",
      rotation: 0,
    });
    await user.click(screen.getByRole("button", { name: "Remove tile" }));
    expect(send).toHaveBeenLastCalledWith({ type: "tile.remove", hex: "B12" });
    expect(one(board, '[data-tile-hex="B12"]')).toBeNull();
  });

  it("shows the tiles left and warns, without blocking, when none are", async () => {
    const { board, send, user } = await mount({
      log: [{ type: "tile.place", hex: "B12", tile: "63", rotation: 0 }],
    });
    expect(option(board, "tile", "2")).toHaveTextContent("2 left");
    const used = option(board, "tile", "63");
    expect(used).toHaveTextContent("0 left");
    expect(within(used).getByRole("img", { name: "None left" })).toBeVisible();
    await user.click(used);
    expect(screen.getByRole("status")).toHaveTextContent(/None left/);
    tap(board, cell(board, "B14"));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: "tile.place", hex: "B14", tile: "63" }),
    );
    expect(option(board, "tile", "63")).toHaveTextContent("-1 left");
  });

  it("places a token of the chosen company at the point of the hex", async () => {
    const { board, send, user } = await mount();
    await tab(user, "Tokens");
    await user.click(option(board, "company", "BLRR"));
    const target = cell(board, "B12");
    const width = target.getBoundingClientRect().width;
    // 150 units across the flats of a hex, which is the width of a vertical map
    const px = width / 150;
    tap(board, target, 30 * px, -20 * px);
    expect(send).toHaveBeenCalledTimes(1);
    const event = send.mock.calls[0][0];
    expect(event).toMatchObject({
      type: "token.place",
      hex: "B12",
      token: "BLRR",
    });
    expect(event.x).toBeCloseTo(30, 0);
    expect(event.y).toBeCloseTo(-20, 0);
    const token = one(board, '[data-token="BLRR"]');
    expect(token).toHaveAttribute("data-token-hex", "B12");
    expect(token).toHaveAttribute(
      "transform",
      `translate(${event.x} ${event.y})`,
    );
  });

  it("selects a token, then removes it", async () => {
    const { board, send, user } = await mount({
      log: [{ type: "token.place", hex: "B12", token: "BLRR", x: 10, y: -5 }],
    });
    await tab(user, "Tokens");
    tap(board, one(board, '[data-token="BLRR"]'));
    expect(send).not.toHaveBeenCalled();
    expect(one(board, "[data-selected-token]")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove token" }));
    expect(send).toHaveBeenCalledWith({
      type: "token.remove",
      hex: "B12",
      token: "BLRR",
      x: 10,
      y: -5,
    });
    expect(one(board, '[data-token="BLRR"]')).toBeNull();
  });

  it("warns, without blocking, when a company has no tokens left", async () => {
    const companies = game.companies.map((c, i) =>
      i === 0 ? { ...c, tokens: ["Free"] } : c,
    );
    const { board, send, user } = await mount({
      game: { ...game, companies },
      log: [{ type: "token.place", hex: "B12", token: "BLRR", x: 0, y: 0 }],
    });
    await tab(user, "Tokens");
    await user.click(option(board, "company", "BLRR"));
    expect(screen.getByRole("status")).toHaveTextContent(/None left/);
    tap(board, cell(board, "B14"));
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ type: "token.place", token: "BLRR" }),
    );
  });

  it("draws placeholders for unknown tiles, hexes and companies", async () => {
    const { board } = await mount({
      log: [
        { type: "tile.place", hex: "B12", tile: "NOPE", rotation: 0 },
        { type: "tile.place", hex: "Z99", tile: "63", rotation: 0 },
        { type: "tile.place", hex: "x!", tile: "63", rotation: 0 },
        { type: "token.place", hex: "B14", token: "NOCO", x: 0, y: 0 },
        { type: "token.place", hex: "Q1", token: "BLRR", x: 0, y: 0 },
      ],
    });
    const tile = one(board, '[data-tile-hex="B12"]');
    expect(one(tile, '[data-placeholder="tile"]')).toBeInTheDocument();
    expect(tile).toHaveTextContent("NOPE");
    const token = one(board, '[data-token="NOCO"]');
    expect(one(token, '[data-placeholder="company"]')).toBeInTheDocument();
    expect(token).toHaveTextContent("NOCO");
    const off = within(board).getByTestId("play-off-map");
    expect(off).toHaveTextContent("Z99");
    expect(off).toHaveTextContent("x!");
    expect(off).toHaveTextContent("Q1");
  });

  it("disables every action of a locked game", async () => {
    const { board, send, user } = await mount({
      locked: true,
      log: [
        { type: "tile.place", hex: "B12", tile: "63", rotation: 0 },
        { type: "token.place", hex: "B14", token: "BLRR", x: 0, y: 0 },
      ],
    });
    expect(board).toHaveTextContent("Read only");
    expect(option(board, "tile", "63")).toBeDisabled();
    tap(board, cell(board, "B12"));
    expect(screen.getByRole("button", { name: "Rotate tile" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove tile" })).toBeDisabled();
    tap(board, cell(board, "B16"));
    await tab(user, "Tokens");
    expect(option(board, "company", "BLRR")).toBeDisabled();
    tap(board, one(board, '[data-token="BLRR"]'));
    expect(screen.getByRole("button", { name: "Remove token" })).toBeDisabled();
    expect(send).not.toHaveBeenCalled();
  });
});

describe("play board robustness", () => {
  it("shows a notice for a game without a map, without throwing", async () => {
    const { board } = await mount({
      game: { ...game, map: undefined },
      log: [{ type: "tile.place", hex: "B12", tile: "63", rotation: 0 }],
    });
    expect(board).toHaveTextContent("This game has no map.");
    expect(within(board).getByTestId("play-off-map")).toHaveTextContent("B12");
    expect(svgOf(board)).toBeInTheDocument();
  });

  it("lists hexes named like object properties as off the map", async () => {
    const { board } = await mount({
      log: [
        { type: "tile.place", hex: "constructor", tile: "63", rotation: 0 },
        { type: "token.place", hex: "toString", token: "BLRR", x: 0, y: 0 },
      ],
    });
    const off = within(board).getByTestId("play-off-map");
    expect(off).toHaveTextContent("constructor");
    expect(off).toHaveTextContent("toString");
    expect(one(board, '[data-tile-hex="constructor"]')).toBeNull();
    expect(one(board, '[data-token-hex="toString"]')).toBeNull();
  });

  it("pans on a drag and sends nothing", async () => {
    const { board, send, user } = await mount();
    await user.click(option(board, "tile", "63"));
    const before = svgOf(board).getAttribute("viewBox");
    drag(board, cell(board, "B14"), 40, 20);
    expect(svgOf(board).getAttribute("viewBox")).not.toBe(before);
    expect(send).not.toHaveBeenCalled();
    expect(one(board, "[data-selected]")).toBeNull();
  });

  it("selects and removes a token after zooming and panning", async () => {
    const { board, send, user } = await mount({
      log: [{ type: "token.place", hex: "B12", token: "BLRR", x: 10, y: -5 }],
    });
    await tab(user, "Tokens");
    const before = svgOf(board).getAttribute("viewBox");
    fireEvent.wheel(svgOf(board), { deltaY: -400 });
    drag(board, cell(board, "C13"), -30, 15);
    expect(svgOf(board).getAttribute("viewBox")).not.toBe(before);
    tap(board, one(board, '[data-token="BLRR"]'));
    expect(one(board, "[data-selected-token]")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove token" }));
    expect(send).toHaveBeenCalledWith({
      type: "token.remove",
      hex: "B12",
      token: "BLRR",
      x: 10,
      y: -5,
    });
  });
});

describe("play game page", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("shows the board once the game is loaded", async () => {
    setToken(BASE, "tok");
    fakeServer({
      "GET /me": [200, { id: 7, name: "Ann", canCreate: true }],
      "GET /games/g1": [
        200,
        { id: "g1", status: "active", game, config: {}, seats: [] },
      ],
    });
    vi.stubGlobal(
      "WebSocket",
      class {
        close() {}
        send() {}
      },
    );
    renderApp("/play/g1", { settings: { playServer: BASE } });
    const board = await screen.findByTestId("play-board");
    expect(board).toHaveTextContent(game.info.title);
  });
});
