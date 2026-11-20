import { act, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { omit } from "ramda";

import { games } from "@/data";
import { setToken } from "@/play/client/tokenStore";
import { normalizePath } from "@/util/analytics";

import { renderApp } from "@tests/support/helpers.jsx";
import { cell, tap } from "@tests/support/playBoard.jsx";
import {
  BASE,
  calls,
  fakeServer,
  watchRoutes,
} from "@tests/support/playServer.js";
import { one } from "@tests/support/render.jsx";

const settings = { playServer: BASE };
const game = omit(["meta"], games["18Test"]);
const seats = [{ userId: 7, name: "Ann", color: "#f00" }];
const watched = {
  id: "g1",
  title: "Spring Game",
  status: "active",
  game,
  config: {},
  seats,
  assets: [],
};

// Every socket the page opens, to feed it frames
let sockets = [];
class FakeSocket {
  constructor(url) {
    this.url = url;
    this.sent = [];
    sockets.push(this);
  }
  send(data) {
    this.sent.push(JSON.parse(data));
  }
  close() {}
}
const sock = () => sockets.at(-1);
const frame = (msg) =>
  act(() => sock().onmessage({ data: JSON.stringify(msg) }));

beforeEach(() => {
  sockets = [];
  window.localStorage.clear();
  vi.stubGlobal("WebSocket", FakeSocket);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const watch = async (code = "w1", extra = {}) => {
  const fetch = fakeServer({ ...watchRoutes(code, watched), ...extra });
  const view = renderApp(`/play/watch/${encodeURIComponent(code)}`, {
    settings,
  });
  return { fetch, ...view };
};

const online = async () => {
  await waitFor(() => expect(sock()).toBeDefined());
  act(() => sock().onopen());
  frame({ t: "joined", seq: 1, seats, presence: [7], spectator: true });
  frame({
    t: "events",
    events: [
      {
        seq: 1,
        userId: 7,
        type: "tile.place",
        hex: "B12",
        tile: "63",
        rotation: 0,
      },
    ],
  });
};

describe("the watch page", () => {
  it("shows the board read only to anyone, with live moves", async () => {
    const { fetch } = await watch();
    const page = await screen.findByTestId("play-watch");
    const board = await within(page).findByTestId("play-board");
    await online();

    expect(sock().sent).toEqual([{ t: "join", watch: "w1", lastSeq: 0 }]);
    expect(within(board).getByTestId("play-banner")).toHaveTextContent(
      /Watching/,
    );
    expect(one(board, '[data-tile-hex="B12"]')).toBeInTheDocument();
    // The players online are still shown
    expect(within(board).getByLabelText("Ann")).toBeVisible();

    frame({
      t: "event",
      event: {
        seq: 2,
        userId: 7,
        type: "tile.place",
        hex: "B14",
        tile: "2",
        rotation: 0,
      },
    });
    expect(one(board, '[data-tile-hex="B14"]')).toBeInTheDocument();

    // No undo, no owner menu, no move goes out
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Owner menu" }),
    ).not.toBeInTheDocument();
    tap(board, cell(board, "C13"));
    expect(sock().sent.filter((m) => m.t === "event")).toEqual([]);

    expect(calls(fetch, "GET", "/watch/w1/game")).toHaveLength(1);
    expect(calls(fetch, "GET", "/me")).toHaveLength(0);
  });

  it("never sends the Authorization header, even when signed in", async () => {
    setToken(BASE, "tok");
    const { fetch } = await watch();
    await screen.findByTestId("play-board");
    expect(fetch).toHaveBeenCalled();
    for (const [, init] of fetch.mock.calls)
      expect(init?.headers?.Authorization).toBeUndefined();
  });

  it("says an unknown link was not found, with a way back", async () => {
    fakeServer({});
    renderApp("/play/watch/nope", { settings });
    const page = await screen.findByTestId("play-watch");
    expect(await within(page).findByText("Link not found")).toBeVisible();
    expect(
      within(page).getByRole("link", { name: "Go to online play" }),
    ).toHaveAttribute("href", "/play");
    expect(sockets).toEqual([]);
  });

  it("says the link stopped when the server closes the socket", async () => {
    await watch();
    await screen.findByTestId("play-board");
    await online();
    frame({ t: "error", code: "not_member" });
    act(() => sock().onclose({ code: 4003 }));
    expect(
      await screen.findByText("This spectator link no longer works."),
    ).toBeVisible();
    expect(screen.queryByTestId("play-board")).not.toBeInTheDocument();
  });

  it("says when too many people watch", async () => {
    await watch();
    await screen.findByTestId("play-board");
    await waitFor(() => expect(sock()).toBeDefined());
    act(() => sock().onopen());
    frame({ t: "error", code: "too_many_spectators", message: "too many" });
    act(() => sock().onclose({ code: 4003 }));
    expect(await screen.findByText(/Too many people/)).toBeVisible();
  });

  it("explains a missing play server and makes no request", async () => {
    const fetch = fakeServer({});
    renderApp("/play/watch/w1");
    const page = await screen.findByTestId("play-watch");
    expect(within(page).getByRole("link", { name: "Settings" })).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("masks the code in analytics", async () => {
    const { router } = await watch("s3cr3t");
    await screen.findByTestId("play-watch");
    expect(normalizePath(router.state.location)).toBe("/play/watch/code");
  });
});

describe("the owner's spectator link", () => {
  const me = { id: 7, name: "Ann", canCreate: true };
  const record = (watchCode) => ({
    id: "g1",
    status: "active",
    ownerId: 7,
    inviteCode: "code1",
    watchCode,
    webhookSet: false,
    game,
    config: {},
    seats,
  });
  const open = async (watchCode, extra = {}) => {
    setToken(BASE, "tok");
    const fetch = fakeServer({
      "GET /me": [200, me],
      "GET /games/g1": [200, record(watchCode)],
      ...extra,
    });
    const view = renderApp("/play/g1", { settings });
    await screen.findByTestId("play-board");
    return { fetch, ...view };
  };
  const openMenu = async (user) => {
    await user.click(screen.getByRole("button", { name: "Owner menu" }));
    return screen.findByRole("menu");
  };
  const item = (name) => screen.getByRole("menuitem", { name });
  const names = () =>
    screen.getAllByRole("menuitem").map((el) => el.textContent.trim());
  const link = (code) =>
    `${window.location.origin}/play/watch/${encodeURIComponent(code)}`;

  it("creates the link on first use and copies it, encoded", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    const { user, fetch } = await open(null, {
      "POST /games/g1/watch": [200, { watchCode: "a/b c" }],
    });
    await openMenu(user);
    expect(names()).toContain("Spectator link");
    expect(names()).not.toContain("Stop spectator link");
    await user.click(item("Spectator link"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(link("a/b c")));
    expect(link("a/b c")).toContain("/play/watch/a%2Fb%20c");
    expect(calls(fetch, "POST", "/games/g1/watch")).toHaveLength(1);
    expect(await screen.findByDisplayValue(link("a/b c"))).toBeVisible();

    // Now it exists: copying does not make another
    await openMenu(user);
    expect(names()).toContain("Stop spectator link");
    await user.click(item("Spectator link"));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(calls(fetch, "POST", "/games/g1/watch")).toHaveLength(1);
  });

  it("copies the existing link and shows it when the clipboard refuses", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    const { user, fetch } = await open("w1");
    await openMenu(user);
    await user.click(item("Spectator link"));
    expect(
      await screen.findByRole("textbox", { name: "Spectator link" }),
    ).toHaveValue(link("w1"));
    expect(calls(fetch, "POST", "/games/g1/watch")).toHaveLength(0);
  });

  it("makes a new link, and the old one is replaced", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    const { user, fetch } = await open("w1", {
      "POST /games/g1/watch": [200, { watchCode: "w2" }],
    });
    await openMenu(user);
    await user.click(item("New spectator link"));
    expect(await screen.findByDisplayValue(link("w2"))).toBeVisible();
    expect(calls(fetch, "POST", "/games/g1/watch")).toHaveLength(1);
    await openMenu(user);
    await user.click(item("Spectator link"));
    await waitFor(() => expect(writeText).toHaveBeenLastCalledWith(link("w2")));
  });

  it("stops the link and the menu follows", async () => {
    const { user, fetch, store } = await open("w1", {
      "DELETE /games/g1/watch": [204],
    });
    await openMenu(user);
    await user.click(item("Stop spectator link"));
    await waitFor(() =>
      expect(calls(fetch, "DELETE", "/games/g1/watch")).toHaveLength(1),
    );
    await waitFor(() =>
      expect(store.getState().alert.items.at(-1)).toMatchObject({
        title: "The spectator link is stopped.",
      }),
    );
    await openMenu(user);
    expect(names()).toContain("Spectator link");
    expect(names()).not.toContain("Stop spectator link");
    expect(names()).not.toContain("New spectator link");
  });

  it("says when the server refuses", async () => {
    const { user, store } = await open("w1", {
      "DELETE /games/g1/watch": [500, { error: "boom" }],
    });
    await openMenu(user);
    await user.click(item("Stop spectator link"));
    await waitFor(() =>
      expect(store.getState().alert.items.at(-1)).toMatchObject({
        title: "The play server refused this.",
      }),
    );
    await openMenu(user);
    expect(names()).toContain("Stop spectator link");
  });
});
