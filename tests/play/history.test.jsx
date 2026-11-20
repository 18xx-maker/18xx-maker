import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mount, tab } from "@tests/support/playBoard.jsx";
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

  it("explains a game that is not yours and links to the list", async () => {
    await mount({ status: "denied" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You are not in this game",
    );
    expect(
      screen.getByRole("link", { name: "Back to your games" }),
    ).toHaveAttribute("href", "/play");
  });

  it("notes that a locked game is read only", async () => {
    await mount({ locked: true });
    expect(screen.getByTestId("play-banner")).toHaveTextContent(
      "This game is locked",
    );
  });

  it("shows the error with a way out", async () => {
    await mount({ status: "error" });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to your games" }),
    ).toBeInTheDocument();
  });

  it("has no keyboard shortcut for undo", async () => {
    const { send, user } = await mount({ log: [place("B12")] });
    await user.keyboard("{Control>}z{/Control}");
    expect(send).not.toHaveBeenCalled();
  });
});
