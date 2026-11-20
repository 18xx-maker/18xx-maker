import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { omit } from "ramda";

import { mainMenu } from "@/components/nav";

import { games } from "@/data";
import { createApi } from "@/play/client/api";
import { readNonce, storeNonce } from "@/play/client/loginNonce";
import { getToken, setToken } from "@/play/client/tokenStore";

import { renderApp } from "@tests/support/helpers.jsx";
import { BASE, calls, fakeServer } from "@tests/support/playServer.js";

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const settings = { playServer: BASE };
const me = { id: 7, name: "Ann", avatar: null, canCreate: true };
const game = games["18Test"];
const slug = game.meta.slug;

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  // The in-memory copy of a nonce must not leak between tests
  storeNonce("reset");
  window.sessionStorage.clear();
});
afterEach(() => vi.unstubAllGlobals());

const signedIn = (extra = {}) => {
  setToken(BASE, "tok");
  return fakeServer({
    "GET /me": [200, me],
    "GET /games": [200, []],
    ...extra,
  });
};

describe("play without a server", () => {
  it("explains and links to the settings, with no request", async () => {
    const fetch = fakeServer({});
    renderApp("/play");
    const page = await screen.findByTestId("play");
    expect(
      within(page).getByRole("link", { name: "Settings" }),
    ).toHaveAttribute("href", "/settings");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("strips a token fragment without storing it", async () => {
    const fetch = fakeServer({});
    const { router } = renderApp("/play#token=abc");
    await screen.findByTestId("play");
    await waitFor(() => expect(router.state.location.hash).toBe(""));
    expect(router.state.historyAction).toBe("REPLACE");
    expect(window.localStorage.getItem("play-tokens")).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.for([
    ["/play/join/abc", "play-join"],
    ["/play/g1", "play-game"],
  ])("%s renders its page with the explanation", async ([url, id]) => {
    renderApp(url);
    const page = await screen.findByTestId(id);
    expect(within(page).getByRole("link", { name: "Settings" })).toBeVisible();
  });
});

describe("login", () => {
  it("stores the token of the fragment, clears the hash and lists games", async () => {
    const fetch = fakeServer({
      "GET /me": [200, me],
      "GET /games": [200, []],
    });
    storeNonce("nonce-1234567890ab");
    const { router } = renderApp("/play#token=abc&nonce=nonce-1234567890ab", {
      settings,
    });
    await screen.findByText("No games yet.");
    expect(getToken(BASE)).toBe("abc");
    expect(readNonce()).toBeNull();
    expect(router.state.location.hash).toBe("");
    expect(router.state.historyAction).toBe("REPLACE");
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Bearer abc");
  });

  it.for([
    ["a different nonce", "#token=abc&nonce=other-1234567890ab"],
    ["no nonce", "#token=abc"],
  ])("refuses a login with %s", async ([, hash]) => {
    storeNonce("nonce-1234567890ab");
    const fetch = fakeServer({});
    const { router } = renderApp(`/play${hash}`, { settings });
    expect(await screen.findByTestId("alert")).toHaveTextContent(
      "Sign in did not complete, try again",
    );
    await waitFor(() => expect(router.state.location.hash).toBe(""));
    expect(router.state.historyAction).toBe("REPLACE");
    expect(getToken(BASE)).toBeNull();
    expect(readNonce()).toBeNull();
    expect(calls(fetch, "GET", "/me")).toHaveLength(0);
  });

  it("refuses a login that this tab did not begin", async () => {
    fakeServer({});
    renderApp("/play#token=abc&nonce=nonce-1234567890ab", { settings });
    expect(await screen.findByTestId("alert")).toHaveTextContent(
      "Sign in did not complete, try again",
    );
    expect(getToken(BASE)).toBeNull();
  });

  it("says when Discord sign in was cancelled", async () => {
    storeNonce("nonce-1234567890ab");
    fakeServer({});
    const { router } = renderApp(
      "/play#error=access_denied&nonce=nonce-1234567890ab",
      { settings },
    );
    expect(await screen.findByTestId("alert")).toHaveTextContent(
      "Discord sign in was cancelled",
    );
    await waitFor(() => expect(router.state.location.hash).toBe(""));
    expect(getToken(BASE)).toBeNull();
  });

  it("does not trust a cancelled message with the wrong nonce", async () => {
    storeNonce("nonce-1234567890ab");
    fakeServer({});
    renderApp("/play#error=access_denied&nonce=other-1234567890ab", {
      settings,
    });
    expect(await screen.findByTestId("alert")).toHaveTextContent(
      "Sign in did not complete, try again",
    );
  });

  it("the sign in link keeps its nonce for the return, even without sessionStorage", async () => {
    fakeServer({});
    const { user } = renderApp("/play", { settings });
    const link = await screen.findByRole("link", {
      name: "Sign in with Discord",
    });
    const nonce = new URL(link.href).searchParams.get("nonce");
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    link.addEventListener("click", (e) => e.preventDefault());
    await user.click(link);
    vi.restoreAllMocks();
    expect(window.sessionStorage.getItem("play-login-nonce")).toBeNull();
    expect(readNonce()).toBe(nonce);
  });

  it("clears a rejected token and offers the Discord sign in", async () => {
    setToken(BASE, "old");
    fakeServer({ "GET /me": [401, { error: "Unauthorized" }] });
    renderApp("/play", { settings });
    const link = await screen.findByRole("link", {
      name: "Sign in with Discord",
    });
    expect(link).toHaveAttribute(
      "href",
      expect.stringMatching(
        new RegExp(
          `^${escapeRegExp(createApi({ baseUrl: BASE }).loginUrl(`${window.location.origin}/play`, ""))}[A-Za-z0-9_-]{16,64}$`,
        ),
      ),
    );
    expect(getToken(BASE)).toBeNull();
  });

  it("offers the sign in when there is no token, with no /me request", async () => {
    const fetch = fakeServer({});
    renderApp("/play", { settings });
    await screen.findByRole("link", { name: "Sign in with Discord" });
    expect(calls(fetch, "GET", "/me")).toHaveLength(0);
  });
});

describe("game list", () => {
  it("links each game to its page", async () => {
    signedIn({
      "GET /games": [
        200,
        [
          { id: "g1", title: "First", status: "active" },
          { id: "g2", title: "Second", status: "locked" },
        ],
      ],
    });
    renderApp("/play", { settings });
    expect(await screen.findByRole("link", { name: /First/ })).toHaveAttribute(
      "href",
      "/play/g1",
    );
    expect(screen.getByRole("link", { name: /Second/ })).toHaveAttribute(
      "href",
      "/play/g2",
    );
  });

  it("shows a message when the server cannot be reached", async () => {
    setToken(BASE, "tok");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("down"))),
    );
    renderApp("/play", { settings });
    expect(await screen.findByRole("alert")).toHaveTextContent("down");
  });

  it("has no create button and a hint without permission", async () => {
    signedIn({ "GET /me": [200, { ...me, canCreate: false }] });
    renderApp("/play", { settings, game });
    await screen.findByText("No games yet.");
    expect(
      screen.queryByRole("button", { name: "Create game" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/not allowed to create/)).toBeInTheDocument();
  });
});

describe("create game", () => {
  const state = {
    settings,
    game,
    config: { unit: "mm" },
    assets: {
      [slug]: {
        icons: { star: "<svg xmlns='http://www.w3.org/2000/svg'/>" },
        logos: {},
        trains: {},
      },
    },
  };

  it("posts the loaded game, uploads its images and opens it", async () => {
    const fetch = signedIn({
      "POST /games": [201, { id: "g9", inviteCode: "inv" }],
      "PUT /games/g9/assets/icons.star": [200, { ok: true }],
    });
    const { user, router } = renderApp("/play", state);
    await screen.findByText("No games yet.");

    const name = screen.getByLabelText("Your name");
    expect(name).toHaveValue("Ann");
    await user.clear(name);
    await user.type(name, "Bob");
    await user.click(screen.getByRole("button", { name: "Create game" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/play/g9"),
    );
    const [, post] = calls(fetch, "POST", "/games")[0];
    // The game file without the app's meta: the server's schema refuses it
    const file = omit(["meta"], game);
    const body = JSON.parse(post.body);
    expect(body).toEqual({
      game: file,
      config: { unit: "mm" },
      seatName: "Bob",
    });
    expect(body.game).not.toHaveProperty("meta");
    const [, put] = calls(fetch, "PUT", "/games/g9/assets/icons.star")[0];
    expect(put.body).toBeInstanceOf(Blob);
    expect(put.body.type).toBe("image/svg+xml");
    expect(put.headers.Authorization).toBe("Bearer tok");
  });

  it("shows the size limit note", async () => {
    signedIn();
    renderApp("/play", state);
    expect(await screen.findByText(/Each image/)).toBeInTheDocument();
  });

  it("shows the schema errors of a 422 and stays", async () => {
    signedIn({
      "POST /games": [
        422,
        { errors: [{ message: "bad field", pointer: "#/x" }] },
      ],
    });
    const { user, router } = renderApp("/play", state);
    await user.click(
      await screen.findByRole("button", { name: "Create game" }),
    );
    expect(await screen.findByText(/bad field/)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/play");
  });

  it("shows an upload error", async () => {
    signedIn({
      "POST /games": [201, { id: "g9" }],
      "PUT /games/g9/assets/icons.star": [413, { error: "Asset too large" }],
    });
    const { user, router } = renderApp("/play", state);
    await user.click(
      await screen.findByRole("button", { name: "Create game" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /icons\/star.*Asset too large/,
    );
    expect(router.state.location.pathname).toBe("/play");
  });
});

describe("join", () => {
  it("joins with a name and color and opens the game", async () => {
    const fetch = signedIn({
      "GET /invites/abc": [200, { gameId: "g3", title: "Spring Game" }],
      "POST /invites/abc/join": [200, { userId: 7, name: "Bob" }],
    });
    const { user, router } = renderApp("/play/join/abc", { settings });
    expect(await screen.findByText("Spring Game")).toBeInTheDocument();
    const name = screen.getByLabelText("Your name");
    await user.clear(name);
    await user.type(name, "Bob");
    await user.click(screen.getByRole("button", { name: "Join game" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/play/g3"),
    );
    const [, post] = calls(fetch, "POST", "/invites/abc/join")[0];
    expect(JSON.parse(post.body)).toEqual({
      name: "Bob",
      color: expect.stringMatching(/^#[0-9a-f]{6}$/i),
    });
  });

  it("sends a signed-out visitor through Discord and back to the join url", async () => {
    fakeServer({
      "GET /invites/abc": [200, { gameId: "g3", title: "Spring Game" }],
    });
    renderApp("/play/join/abc", { settings });
    const link = await screen.findByRole("link", {
      name: "Sign in with Discord",
    });
    expect(link).toHaveAttribute(
      "href",
      expect.stringMatching(
        new RegExp(
          `^${escapeRegExp(createApi({ baseUrl: BASE }).loginUrl(`${window.location.origin}/play/join/abc`, ""))}[A-Za-z0-9_-]{16,64}$`,
        ),
      ),
    );
    expect(screen.getByText("Spring Game")).toBeInTheDocument();
  });

  it("says the game is closed on a 410", async () => {
    signedIn({
      "GET /invites/abc": [200, { gameId: "g3", title: "Spring Game" }],
      "POST /invites/abc/join": [410, { error: "Game is not open" }],
    });
    const { user } = renderApp("/play/join/abc", { settings });
    await user.click(await screen.findByRole("button", { name: "Join game" }));
    expect(await screen.findByText("This game is closed.")).toBeInTheDocument();
  });

  it("says the invite is unknown on a 404", async () => {
    signedIn();
    renderApp("/play/join/nope", { settings });
    expect(
      await screen.findByText(/invite link is not valid/),
    ).toBeInTheDocument();
  });
});

describe("game page", () => {
  it("renders the game once signed in", async () => {
    signedIn({
      "GET /games/g1": [
        200,
        { id: "g1", status: "active", game, config: {}, seats: [] },
      ],
    });
    // The websocket is not part of this test
    vi.stubGlobal(
      "WebSocket",
      class {
        close() {}
        send() {}
      },
    );
    renderApp("/play/g1", { settings });
    expect(await screen.findByTestId("play-game")).toBeInTheDocument();
  });

  it("offers the sign in without a token, and makes no game request", async () => {
    const fetch = fakeServer({});
    renderApp("/play/g1", { settings });
    expect(
      await screen.findByRole("link", { name: "Sign in with Discord" }),
    ).toBeInTheDocument();
    expect(calls(fetch, "GET", "/games/g1")).toHaveLength(0);
  });

  it("offers the sign in when the game answers 401", async () => {
    signedIn({ "GET /games/g1": [401, { error: "Unauthorized" }] });
    renderApp("/play/g1", { settings });
    expect(
      await screen.findByRole("link", { name: "Sign in with Discord" }),
    ).toBeInTheDocument();
  });

  it.for([403, 410])("shows a locked message on %s", async (status) => {
    signedIn({ "GET /games/g1": [status, { error: "no" }] });
    renderApp("/play/g1", { settings });
    expect(await screen.findByText(/no longer open/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to your games" }),
    ).toHaveAttribute("href", "/play");
  });
});

describe("sidebar", () => {
  it("has a Play entry without a keyboard shortcut", () => {
    const play = mainMenu
      .flatMap((group) => group.items)
      .find((item) => item.to === "/play");
    expect(play.label).toBe("nav.play");
    expect(play.shortcut).toBeUndefined();
  });
});

describe("images over the server limit", () => {
  it("refuses before creating the game and names them", async () => {
    const fetch = signedIn({ "POST /games": [201, { id: "g9" }] });
    const big = `<svg xmlns='http://www.w3.org/2000/svg'>${"a".repeat(1024 * 1024 + 1)}</svg>`;
    const { user } = renderApp("/play", {
      settings,
      game,
      assets: {
        [slug]: { icons: { big, ok: "<svg/>" }, logos: {}, trains: {} },
      },
    });
    await user.click(
      await screen.findByRole("button", { name: "Create game" }),
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("icons/big");
    expect(alert).not.toHaveTextContent("icons/ok");
    expect(calls(fetch, "POST", "/games")).toHaveLength(0);
  });
});

describe("server unreachable", () => {
  const down = () => {
    let up = false;
    const fetch = vi.fn(async (url) => {
      if (!up) throw new Error("down");
      const path = String(url).replace(BASE, "");
      const body = path === "/me" ? me : [];
      return new Response(JSON.stringify(body), { status: 200 });
    });
    vi.stubGlobal("fetch", fetch);
    return { fetch, recover: () => (up = true) };
  };

  it("retries the sign in check on the list page", async () => {
    setToken(BASE, "tok");
    const { fetch, recover } = down();
    const { user } = renderApp("/play", { settings });
    await screen.findByRole("alert");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    const before = fetch.mock.calls.length;
    recover();
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No games yet.")).toBeInTheDocument();
    expect(fetch.mock.calls.length).toBeGreaterThan(before);
  });

  it("retries the game list", async () => {
    setToken(BASE, "tok");
    let listUp = false;
    fakeServer({});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        const path = String(url).replace(BASE, "");
        if (path === "/me") return new Response(JSON.stringify(me));
        if (!listUp) throw new Error("down");
        return new Response("[]");
      }),
    );
    const { user } = renderApp("/play", { settings });
    await screen.findByRole("alert");
    listUp = true;
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText("No games yet.")).toBeInTheDocument();
  });

  it("has a way back on the game and join pages", async () => {
    setToken(BASE, "tok");
    down();
    renderApp("/play/g1", { settings });
    expect(
      await screen.findByRole("link", { name: "Back to your games" }),
    ).toHaveAttribute("href", "/play");
  });
});

describe("game that is not there", () => {
  it("says so with a way back", async () => {
    signedIn({ "GET /games/g1": [404, { error: "Not found" }] });
    renderApp("/play/g1", { settings });
    expect(await screen.findByText(/Game not found/)).toBeInTheDocument();
    expect(screen.queryByText(/Could not reach/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to your games" }),
    ).toBeVisible();
  });
});
