/* eslint-disable testing-library/no-node-access -- the custom images are bare svg elements with no role */
import { act, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { omit } from "ramda";

import { games } from "@/data";
import { setToken } from "@/play/client/tokenStore";

import { renderApp } from "@tests/support/helpers.jsx";
import { BASE } from "@tests/support/playServer.js";

const settings = { playServer: BASE };
const me = { id: 7, name: "Ann", canCreate: true };
const base = games["18Test"];

// The server's game puts its own custom/star on a map hex
const hexes = base.map.hexes.map((hex, i) =>
  i === 0 ? { ...hex, icons: [{ type: "custom/star" }] } : hex,
);
const game = { ...omit(["meta"], base), map: { ...base.map, hexes } };
const record = {
  id: "g1",
  status: "active",
  ownerId: 9,
  game,
  config: {},
  seats: [{ userId: 7, name: "Ann" }],
  assets: ["icons.star"],
};

// The two images tell apart by their rect: the server's 7 x 3, the open local
// game's 9 x 2
const SERVER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="7" height="3"/><script>window.__pwned = true</script></svg>';
const LOCAL_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="9" height="2"/></svg>';
const serverRects = () =>
  document.querySelectorAll('[data-testid="play-board"] rect[width="7"]');
const localRects = () =>
  document.querySelectorAll('[data-testid="play-board"] rect[width="9"]');

// The store holds the open local game (18Test) and its own custom/star
const state = {
  settings,
  game: base,
  assets: {
    [base.meta.slug]: { icons: { star: LOCAL_SVG }, logos: {}, trains: {} },
  },
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const svg = (text) =>
  new Response(text, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" },
  });

// A fake server: routes are "METHOD /path" to a function of the request
// giving a Response (or a promise of one); anything else is a 404
const serve = (routes) => {
  const fetch = vi.fn(async (url, init = {}) => {
    const key = `${init.method || "GET"} ${String(url).replace(BASE, "")}`;
    return routes[key] ? routes[key](init) : json(404, { error: "Not found" });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};
const assetCalls = (fetch) =>
  fetch.mock.calls.filter(([url]) => String(url).includes("/assets/"));

beforeEach(() => {
  window.localStorage.clear();
  delete window.__pwned;
  vi.stubGlobal(
    "WebSocket",
    class {
      close() {}
      send() {}
    },
  );
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const player = (routes = {}) => {
  setToken(BASE, "tok");
  const fetch = serve({
    "GET /me": () => json(200, me),
    "GET /games/g1": () => json(200, record),
    "GET /games/g1/assets/icons.star": () => svg(SERVER_SVG),
    ...routes,
  });
  return { fetch, ...renderApp("/play/g1", state) };
};

describe("the server game's images on the board", () => {
  it("draws the server's custom/star, not the open local game's", async () => {
    const { fetch } = player();
    await screen.findByTestId("play-board");
    await waitFor(() => expect(serverRects()).toHaveLength(1));
    expect(localRects()).toHaveLength(0);
    // The script of the server's SVG is never drawn or run
    expect(
      document.querySelector('[data-testid="play-board"] script'),
    ).toBeNull();
    expect(window.__pwned).toBeUndefined();

    const [[url, init]] = assetCalls(fetch);
    expect(url).toBe(`${BASE}/games/g1/assets/icons.star`);
    expect(init.headers.Authorization).toBe("Bearer tok");
  });

  it("keeps the placeholder for a missing asset, with no error", async () => {
    const { fetch } = player({
      "GET /games/g1/assets/icons.star": () =>
        json(404, { error: "Not found" }),
    });
    const board = await screen.findByTestId("play-board");
    await waitFor(() => expect(assetCalls(fetch)).toHaveLength(1));
    // Give the failed load time to settle
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(board).toBeInTheDocument();
    expect(serverRects()).toHaveLength(0);
    expect(localRects()).toHaveLength(0);
    expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
  });

  it("draws the board before the images arrive", async () => {
    let answer;
    player({
      "GET /games/g1/assets/icons.star": () =>
        new Promise((resolve) => {
          answer = () => resolve(svg(SERVER_SVG));
        }),
    });
    await screen.findByTestId("play-board");
    await waitFor(() => expect(answer).toBeDefined());
    expect(serverRects()).toHaveLength(0);

    await act(async () => answer());
    await waitFor(() => expect(serverRects()).toHaveLength(1));
  });

  it("loads a spectator's images by the code, without the token", async () => {
    setToken(BASE, "tok");
    const fetch = serve({
      "GET /watch/w1": () => json(200, { gameId: "g1", title: "Spring Game" }),
      "GET /watch/w1/game": () =>
        json(200, omit(["ownerId"], { ...record, title: "Spring Game" })),
      "GET /watch/w1/assets/icons.star": () => svg(SERVER_SVG),
    });
    renderApp("/play/watch/w1", state);
    await screen.findByTestId("play-board");
    await waitFor(() => expect(serverRects()).toHaveLength(1));
    expect(localRects()).toHaveLength(0);

    const [[url, init]] = assetCalls(fetch);
    expect(url).toBe(`${BASE}/watch/w1/assets/icons.star`);
    expect(init.headers.Authorization).toBeUndefined();
  });
});
