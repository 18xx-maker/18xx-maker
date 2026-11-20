import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { games } from "@/data";
import { setToken } from "@/play/client/tokenStore";

import { renderApp } from "@tests/support/helpers.jsx";
import { BASE, calls, fakeServer } from "@tests/support/playServer.js";

const settings = { playServer: BASE };
const game = games["18Test"];
const me = { id: 7, name: "Ann", canCreate: true };
const record = {
  id: "g1",
  status: "active",
  ownerId: 7,
  inviteCode: "code1",
  game,
  config: {},
  seats: [{ userId: 7, name: "Ann" }],
};

beforeEach(() => {
  window.localStorage.clear();
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

const open = async (extra = {}, rec = {}) => {
  setToken(BASE, "tok");
  const fetch = fakeServer({
    "GET /me": [200, me],
    "GET /games/g1": [200, { ...record, ...rec }],
    ...extra,
  });
  const view = renderApp("/play/g1", { settings });
  await screen.findByTestId("play-board");
  return { fetch, ...view };
};

const alerts = (store) => store.getState().alert.items;
const openMenu = async (user) => {
  await user.click(screen.getByRole("button", { name: "Owner menu" }));
  return screen.findByRole("menu");
};
const item = (name) => screen.getByRole("menuitem", { name });
const names = () =>
  screen.getAllByRole("menuitem").map((el) => el.textContent.trim());

describe("owner controls", () => {
  it("shows the owner every action, lock while active", async () => {
    const { user } = await open();
    await openMenu(user);
    expect(names()).toEqual([
      "Copy invite link",
      "New invite link",
      "Lock game",
      "Archive game",
      "Delete game",
    ]);
  });

  it("offers unlock instead of lock for a locked game", async () => {
    const { user } = await open({}, { status: "locked" });
    await openMenu(user);
    expect(names()).toContain("Unlock game");
    expect(names()).not.toContain("Lock game");
    expect(screen.getByTestId("play-banner")).toBeInTheDocument();
  });

  it("shows a non-owner no menu", async () => {
    await open({}, { ownerId: 8, inviteCode: undefined });
    expect(
      screen.queryByRole("button", { name: "Owner menu" }),
    ).not.toBeInTheDocument();
  });

  it("compares the owner as strings", async () => {
    await open({}, { ownerId: "7" });
    expect(screen.getByRole("button", { name: "Owner menu" })).toBeVisible();
  });

  it("copies the invite link of the origin", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    const { user } = await open();
    await openMenu(user);
    await user.click(item("Copy invite link"));
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/play/join/code1`,
    );
  });

  it("shows the link when the clipboard refuses", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("denied"),
    );
    const { user } = await open();
    await openMenu(user);
    await user.click(item("Copy invite link"));
    expect(
      await screen.findByDisplayValue(
        `${window.location.origin}/play/join/code1`,
      ),
    ).toBeVisible();
  });

  it("replaces the link with a new invite", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    const { user, fetch } = await open({
      "POST /games/g1/invite": [200, { inviteCode: "code2" }],
    });
    await openMenu(user);
    await user.click(item("New invite link"));
    expect(calls(fetch, "POST", "/games/g1/invite")).toHaveLength(1);
    expect(
      await screen.findByDisplayValue(
        `${window.location.origin}/play/join/code2`,
      ),
    ).toBeVisible();
    await openMenu(user);
    await user.click(item("Copy invite link"));
    expect(writeText).toHaveBeenLastCalledWith(
      `${window.location.origin}/play/join/code2`,
    );
  });

  it.for([
    ["Lock game", "locked"],
    ["Archive game", "archived"],
  ])(
    "%s patches the status and makes the board read only",
    async ([label, status], { expect }) => {
      const { user, fetch } = await open({
        "PATCH /games/g1": [200, { id: "g1", status }],
      });
      await openMenu(user);
      await user.click(item(label));
      await screen.findByTestId("play-banner");
      const patches = calls(fetch, "PATCH", "/games/g1");
      expect(patches).toHaveLength(1);
      expect(JSON.parse(patches[0][1].body)).toEqual({ status });
    },
  );

  it("unlocks a locked game", async () => {
    const { user, fetch } = await open(
      { "PATCH /games/g1": [200, { id: "g1", status: "active" }] },
      { status: "locked" },
    );
    await openMenu(user);
    await user.click(item("Unlock game"));
    await waitFor(() =>
      expect(screen.queryByTestId("play-banner")).not.toBeInTheDocument(),
    );
    expect(JSON.parse(calls(fetch, "PATCH", "/games/g1")[0][1].body)).toEqual({
      status: "active",
    });
  });

  it("deletes only after the dialog is confirmed, then goes to /play", async () => {
    const { user, fetch, router } = await open({
      "DELETE /games/g1": [204],
      "GET /games": [200, []],
    });
    await openMenu(user);
    await user.click(item("Delete game"));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("cannot be undone");
    expect(calls(fetch, "DELETE", "/games/g1")).toHaveLength(0);

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(calls(fetch, "DELETE", "/games/g1")).toHaveLength(0);

    await openMenu(user);
    await user.click(item("Delete game"));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Delete game",
      }),
    );
    await waitFor(() => expect(router.state.location.pathname).toBe("/play"));
    expect(calls(fetch, "DELETE", "/games/g1")).toHaveLength(1);
  });

  it("alerts a failed call and leaves the menu usable", async () => {
    const { user, fetch, store } = await open({
      "PATCH /games/g1": [500, { error: "boom" }],
    });
    await openMenu(user);
    await user.click(item("Lock game"));
    await waitFor(() => expect(alerts(store)).toHaveLength(1));
    expect(alerts(store)[0]).toMatchObject({ type: "error", message: "boom" });
    expect(screen.queryByTestId("play-banner")).not.toBeInTheDocument();
    await openMenu(user);
    expect(item("Lock game")).toBeVisible();
    expect(calls(fetch, "PATCH", "/games/g1")).toHaveLength(1);
  });

  it("alerts a failed delete and stays on the game", async () => {
    const { user, router, store } = await open({
      "DELETE /games/g1": [500, { error: "nope" }],
    });
    await openMenu(user);
    await user.click(item("Delete game"));
    await user.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Delete game",
      }),
    );
    await waitFor(() => expect(alerts(store)).toHaveLength(1));
    expect(alerts(store)[0]).toMatchObject({ type: "error", message: "nope" });
    expect(router.state.location.pathname).toBe("/play/g1");
  });
});
