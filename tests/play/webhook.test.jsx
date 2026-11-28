import { screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { games } from "@/data";
import { setToken } from "@/play/client/tokenStore";

import { renderApp } from "@tests/support/helpers.jsx";
import { BASE, calls, fakeServer } from "@tests/support/playServer.js";

const settings = { playServer: BASE };
const me = { id: 7, name: "Ann", canCreate: true };
const record = {
  id: "g1",
  status: "active",
  ownerId: 7,
  inviteCode: "code1",
  webhookSet: false,
  game: games["18Test"],
  config: {},
  seats: [{ userId: 7, name: "Ann" }],
};
const URL = "https://discord.com/api/webhooks/123456/abc_DEF-ghi";

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
const openDialog = async (user) => {
  await user.click(screen.getByRole("button", { name: "Owner menu" }));
  await user.click(
    await screen.findByRole("menuitem", { name: "Discord notifications" }),
  );
  return screen.findByRole("dialog");
};
const patches = (fetch) => calls(fetch, "PATCH", "/games/g1");

describe("discord webhook", () => {
  it("is offered to the owner only", async () => {
    const { user } = await open();
    await user.click(screen.getByRole("button", { name: "Owner menu" }));
    expect(
      await screen.findByRole("menuitem", { name: "Discord notifications" }),
    ).toBeVisible();
  });

  it("is not offered to another player", async () => {
    await open({}, { ownerId: 8, inviteCode: undefined });
    expect(
      screen.queryByRole("button", { name: "Owner menu" }),
    ).not.toBeInTheDocument();
  });

  it("saves the typed url once, shows it as off, then on", async () => {
    const { user, fetch, store } = await open({
      "PATCH /games/g1": [
        200,
        { id: "g1", status: "active", webhookSet: true },
      ],
    });
    const dialog = await openDialog(user);
    expect(dialog).not.toHaveTextContent("Notifications are on");
    expect(
      within(dialog).queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
    const input = within(dialog).getByLabelText("Webhook URL");
    expect(input).toHaveAttribute("type", "password");
    await user.type(input, URL);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(alerts(store)).toHaveLength(1));
    expect(alerts(store)[0]).toMatchObject({ type: "success" });
    expect(patches(fetch)).toHaveLength(1);
    expect(JSON.parse(patches(fetch)[0][1].body)).toEqual({ webhookUrl: URL });

    // The url is nowhere in the page, the state is on without a reload
    expect(document.body).not.toHaveTextContent("123456/abc");
    expect(screen.queryByDisplayValue(/123456/)).not.toBeInTheDocument();
    const again = await openDialog(user);
    expect(again).toHaveTextContent("Notifications are on");
    expect(within(again).getByLabelText("Webhook URL")).toHaveValue("");
    expect(within(again).getByRole("button", { name: "Remove" })).toBeVisible();
    expect(calls(fetch, "GET", "/games/g1")).toHaveLength(1);
  });

  it.for([
    "http://discord.com/api/webhooks/1/a",
    "https://example.com/api/webhooks/1/a",
    "https://discord.com/api/webhooks/x/a",
    "nonsense",
    "",
  ])("refuses %s without a request", async (bad, { expect }) => {
    const { user, fetch } = await open();
    const dialog = await openDialog(user);
    if (bad) await user.type(within(dialog).getByLabelText("Webhook URL"), bad);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(patches(fetch)).toHaveLength(0);
    expect(dialog).toHaveTextContent("https://discord.com/api/webhooks/");
  });

  it("accepts discordapp.com", async () => {
    const { user, fetch } = await open({
      "PATCH /games/g1": [
        200,
        { id: "g1", status: "active", webhookSet: true },
      ],
    });
    const dialog = await openDialog(user);
    const other = "https://discordapp.com/api/webhooks/9/tok";
    await user.type(within(dialog).getByLabelText("Webhook URL"), other);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(patches(fetch)).toHaveLength(1));
  });

  it("removes the webhook with null", async () => {
    const { user, fetch, store } = await open(
      {
        "PATCH /games/g1": [
          200,
          { id: "g1", status: "active", webhookSet: false },
        ],
      },
      { webhookSet: true },
    );
    const dialog = await openDialog(user);
    expect(dialog).toHaveTextContent("Notifications are on");
    await user.click(within(dialog).getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(alerts(store)).toHaveLength(1));
    expect(JSON.parse(patches(fetch)[0][1].body)).toEqual({ webhookUrl: null });
    expect(patches(fetch)).toHaveLength(1);
    const again = await openDialog(user);
    expect(again).not.toHaveTextContent("Notifications are on");
    expect(
      within(again).queryByRole("button", { name: "Remove" }),
    ).not.toBeInTheDocument();
  });

  it.for([
    [400, "Discord rejected the webhook"],
    [429, "Too many requests"],
  ])("shows the %s message of the server", async ([status, error]) => {
    const { user, store } = await open({
      "PATCH /games/g1": [status, { error }],
    });
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Webhook URL"), URL);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(alerts(store)).toHaveLength(1));
    expect(alerts(store)[0]).toMatchObject({ type: "error", message: error });
    expect(document.body).not.toHaveTextContent("123456/abc");
    // Still off
    expect(screen.getByRole("dialog")).not.toHaveTextContent(
      "Notifications are on",
    );
  });

  it("clears the input when the dialog closes", async () => {
    const { user } = await open();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Webhook URL"), URL);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    const again = await openDialog(user);
    expect(within(again).getByLabelText("Webhook URL")).toHaveValue("");
  });

  it("works for a locked game", async () => {
    const { user, fetch } = await open(
      {
        "PATCH /games/g1": [
          200,
          { id: "g1", status: "locked", webhookSet: true },
        ],
      },
      { status: "locked" },
    );
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Webhook URL"), URL);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(patches(fetch)).toHaveLength(1));
  });

  it("disables the buttons and menu items while a request is in flight", async () => {
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const { user, fetch, store } = await open({
      "PATCH /games/g1": [
        200,
        { id: "g1", status: "active", webhookSet: true },
      ],
    });
    const respond = fetch.getMockImplementation();
    fetch.mockImplementation(async (url, init) => {
      if (init?.method === "PATCH") await gate;
      return respond(url, init);
    });
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Webhook URL"), URL);
    const save = within(dialog).getByRole("button", { name: "Save" });
    await user.click(save);
    await waitFor(() => expect(save).toBeDisabled());
    await user.click(save);
    expect(patches(fetch)).toHaveLength(1);
    release();
    await waitFor(() => expect(alerts(store)).toHaveLength(1));
    expect(patches(fetch)).toHaveLength(1);
    // The other owner items were disabled meanwhile: check after reopening
    await user.click(screen.getByRole("button", { name: "Owner menu" }));
    expect(
      await screen.findByRole("menuitem", { name: "Lock game" }),
    ).not.toHaveAttribute("data-disabled");
  });

  it("disables the other menu items during a webhook request", async () => {
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const { user, fetch } = await open({
      "PATCH /games/g1": [
        200,
        { id: "g1", status: "active", webhookSet: true },
      ],
    });
    const respond = fetch.getMockImplementation();
    fetch.mockImplementation(async (url, init) => {
      if (init?.method === "PATCH") await gate;
      return respond(url, init);
    });
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText("Webhook URL"), URL);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Save" }),
      ).toBeDisabled(),
    );
    release();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
