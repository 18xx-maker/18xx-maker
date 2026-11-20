import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setToken } from "@/play/client/tokenStore";

import { renderApp } from "@tests/support/helpers.jsx";
import { mount, tab } from "@tests/support/playBoard.jsx";
import { BASE, fakeServer } from "@tests/support/playServer.js";
import { one } from "@tests/support/render.jsx";

const place = (hex, tile = "63") => ({
  type: "tile.place",
  hex,
  tile,
  rotation: 0,
});
const undoButton = () => screen.getByRole("button", { name: "Undo" });

describe("play history", () => {
  it("lists events newest first with the seat name", async () => {
    const { user } = await mount({
      log: [place("B12", "5"), place("D3", "5")],
    });
    await tab(user, "History");
    const items = screen.getAllByTestId("play-history-event");
    const texts = items.map((li) => li.textContent);
    expect(texts[0]).toBe("Ann placed 5 on D3");
    expect(texts[1]).toBe("Ann placed 5 on B12");
  });

  it("strikes through events cancelled by an undo and words the undo", async () => {
    const { user } = await mount({
      log: [place("B12", "5"), { type: "undo", target: 1 }],
      seats: [
        { userId: 7, name: "Ann" },
        { userId: 8, name: "Bob" },
      ],
    });
    await tab(user, "History");
    const items = screen.getAllByTestId("play-history-event");
    expect(items[0]).toHaveTextContent("Ann undid Ann's move");
    expect(items[0]).not.toHaveAttribute("data-cancelled");
    expect(items[1]).toHaveTextContent("Ann placed 5 on B12");
    expect(items[1]).toHaveAttribute("data-cancelled", "true");
    expect(items[1].className).toMatch(/line-through/);
  });

  it("names the author of the undone move", async () => {
    const { user } = await mount({
      log: [
        { type: "tile.place", hex: "B12", tile: "5", rotation: 0, userId: 8 },
        { type: "undo", target: 1 },
      ],
      seats: [
        { userId: 7, name: "Ann" },
        { userId: 8, name: "Bob" },
      ],
    });
    await tab(user, "History");
    expect(screen.getAllByTestId("play-history-event")[0]).toHaveTextContent(
      "Ann undid Bob's move",
    );
  });

  it("disables undo with an empty log and when locked", async () => {
    await mount();
    expect(undoButton()).toBeDisabled();
  });

  it("disables undo when locked", async () => {
    await mount({ log: [place("B12")], locked: true });
    expect(undoButton()).toBeDisabled();
  });

  it("sends one undo of the newest move, then of the previous one", async () => {
    const { board, send, user } = await mount({
      log: [place("B12"), place("B14")],
    });
    await user.click(undoButton());
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenLastCalledWith({ type: "undo", target: 2 });
    expect(one(board, '[data-tile-hex="B14"]')).toBeNull();
    await user.click(undoButton());
    expect(send).toHaveBeenCalledTimes(2);
    // The undo (seq 3) is the newest effective event, so it is the target
    expect(send).toHaveBeenLastCalledWith({ type: "undo", target: 3 });
  });

  it("restores the move when an undo is undone", async () => {
    const { board, user } = await mount({ log: [place("B12")] });
    expect(one(board, '[data-tile-hex="B12"]')).toBeInTheDocument();
    await user.click(undoButton());
    expect(one(board, '[data-tile-hex="B12"]')).toBeNull();
    await user.click(undoButton());
    expect(one(board, '[data-tile-hex="B12"]')).toBeInTheDocument();
  });

  it("shows an avatar with the seat name for each online seat", async () => {
    const { user } = await mount({
      presence: [7, 8, 99],
      seats: [
        { userId: 7, name: "Ann" },
        { userId: 8, name: "Bob" },
      ],
    });
    const presence = screen.getByTestId("play-presence");
    const avatars = within(presence).getAllByTestId("play-avatar");
    expect(avatars).toHaveLength(2);
    expect(avatars[0]).toHaveTextContent("A");
    expect(avatars[1]).toHaveTextContent("B");
    await user.hover(avatars[1]);
    expect(await screen.findAllByText("Bob")).not.toHaveLength(0);
    expect(avatars[1]).toHaveAccessibleName("Bob");
  });

  it("shows a banner for the connection state", async () => {
    await mount({ status: "offline" });
    expect(screen.getByTestId("play-banner")).toHaveTextContent(
      "Reconnecting...",
    );
  });

  it("shows a move the server refused until it is dismissed", async () => {
    const dismissError = vi.fn();
    const { user } = await mount({ error: "bad undo", dismissError });
    const alert = screen.getByTestId("play-error");
    expect(alert).toHaveAttribute("role", "alert");
    expect(alert).toHaveTextContent("The server refused a move: bad undo");
    await user.click(within(alert).getByRole("button", { name: "Dismiss" }));
    expect(dismissError).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("play-error")).not.toBeInTheDocument();
  });

  it("reads the move error in dark mode and gives it big touch targets", async () => {
    await mount({ error: "bad undo" });
    const alert = screen.getByTestId("play-error");
    expect(alert.className).toMatch(/dark:text-red-400/);
    expect(
      within(alert).getByRole("button", { name: "Dismiss" }).className,
    ).toMatch(/size-10/);
  });

  it("keeps the tabs in one scrolling row on a paper map", async () => {
    await mount({});
    const list = screen.getByRole("tablist");
    expect(list.className).toMatch(/overflow-x-auto/);
    expect(list.className).not.toMatch(/flex-wrap/);
    for (const tabEl of screen.getAllByRole("tab")) {
      expect(tabEl.className).toMatch(/shrink-0/);
    }
  });

  it("shows no move error on a locked game", async () => {
    await mount({ locked: true, error: "locked" });
    expect(screen.queryByTestId("play-error")).not.toBeInTheDocument();
  });

  it("notes that a locked game is read only", async () => {
    await mount({ locked: true });
    expect(screen.getByTestId("play-banner")).toHaveTextContent(
      "This game is locked",
    );
  });

  it("names trays by seat, the bank translated and unknown ids as they are", async () => {
    const { user } = await mount({
      log: [
        { type: "tray.move", item: "63", from: "7", to: "8" },
        { type: "tray.move", item: "63", from: "bank", to: "7" },
        { type: "tray.move", item: "63", from: "8", to: "bank" },
        { type: "tray.move", item: "63", from: "99", to: "8" },
      ],
      seats: [
        { userId: 7, name: "Ann" },
        { userId: 8, name: "Bob" },
      ],
    });
    await tab(user, "History");
    const texts = screen
      .getAllByTestId("play-history-event")
      .map((li) => li.textContent);
    expect(texts).toEqual([
      "Ann moved 63 from 99 to Bob",
      "Ann moved 63 from Bob to the bank",
      "Ann moved 63 from the bank to Ann",
      "Ann moved 63 from Ann to Bob",
    ]);
  });

  it("words an event with no user as a player", async () => {
    const { user } = await mount({
      log: [{ ...place("B12", "5"), userId: undefined }],
    });
    await tab(user, "History");
    expect(screen.getByTestId("play-history-event")).toHaveTextContent(
      "a player placed 5 on B12",
    );
  });

  describe("the game page gates", () => {
    beforeEach(() => window.localStorage.clear());
    afterEach(() => vi.unstubAllGlobals());

    const open = async (status) => {
      setToken(BASE, "tok");
      fakeServer({
        "GET /me": [200, { id: 7, name: "Ann", canCreate: true }],
        "GET /games/g1": [status, { error: "nope" }],
      });
      renderApp("/play/g1", { settings: { playServer: BASE } });
    };

    it("offers the sign in when the token is denied", async () => {
      await open(401);
      expect(
        await screen.findByText("Your sign in has expired."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Sign in with Discord" }),
      ).toBeInTheDocument();
    });

    it("shows the error with a link back to the list", async () => {
      await open(500);
      expect(await screen.findByRole("alert")).toHaveTextContent("nope");
      expect(
        screen.getByRole("link", { name: "Back to your games" }),
      ).toHaveAttribute("href", "/play");
    });
  });

  it("has no keyboard shortcut for undo", async () => {
    const { send, user } = await mount({ log: [place("B12")] });
    await user.keyboard("{Control>}z{/Control}");
    expect(send).not.toHaveBeenCalled();
  });
});
