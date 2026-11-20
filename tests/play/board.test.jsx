import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMemo, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PlayBoard from "@/components/play/PlayBoard";

import { games } from "@/data";
import { setToken } from "@/play/client/tokenStore";
import { reduce } from "@/play/reduce";

import { renderApp } from "@tests/support/helpers.jsx";
import { BASE, fakeServer } from "@tests/support/playServer.js";
import { mountElement, one } from "@tests/support/render.jsx";

const game = games["18Test"];

// A hook stub: the log grows by every sent event, as the server echoes it
const Board = ({ log: initial = [], locked = false, send, game: g = game }) => {
  const [log, setLog] = useState(() =>
    initial.map((event, i) => ({ seq: i + 1, userId: 7, ...event })),
  );
  const state = useMemo(() => reduce(log), [log]);
  const play = {
    status: locked ? "locked" : "online",
    game: g,
    config: {},
    seats: [{ userId: 7, name: "Ann" }],
    log,
    state,
    presence: [7],
    me: { userId: 7, name: "Ann" },
    locked,
    missing: false,
    error: null,
    send: (event) => {
      send(event);
      if (!locked)
        setLog((list) => [...list, { ...event, seq: list.length + 1 }]);
    },
    undo: () => {},
  };
  return <PlayBoard play={play} />;
};

const mount = async (props = {}) => {
  const send = vi.fn();
  const { root } = await mountElement(<Board send={send} {...props} />);
  const board = await within(root).findByTestId("play-board");
  return { send, board, user: userEvent.setup() };
};

const cell = (board, coord) => one(board, `[data-coord="${coord}"]`);
const svgOf = (board) => one(board, "svg[data-play-map]");

// A tap of the pan and zoom svg, dx and dy pixels from the middle of el
const tap = (board, el, dx = 0, dy = 0) => {
  const rect = el.getBoundingClientRect();
  const init = {
    clientX: rect.x + rect.width / 2 + dx,
    clientY: rect.y + rect.height / 2 + dy,
    button: 0,
    buttons: 1,
    pointerId: 1,
  };
  fireEvent.pointerDown(el, init);
  fireEvent.pointerUp(svgOf(board), { ...init, buttons: 0 });
};

const tab = (user, name) => user.click(screen.getByRole("tab", { name }));
const option = (board, attr, id) => one(board, `[data-${attr}-option="${id}"]`);

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
