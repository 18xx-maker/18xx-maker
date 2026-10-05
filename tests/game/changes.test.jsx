/* eslint-disable testing-library/no-node-access -- the viewport wrapper and the badge sibling have no role */
import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";
import { createSetGame, editGame } from "@/state";
import { gameText } from "@/util/download";
import * as opfs from "@/util/storage/opfs";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/util/storage/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  peekGame: vi.fn(),
  overwriteGame: vi.fn(),
}));

// A game that lives in the private file system, so it can be saved
const internal = () => ({
  ...structuredClone(games["18Test"]),
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
});

const open = (route, game = internal()) =>
  renderApp(route, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: {
      slug: game.meta.slug,
      title: game.info.title,
      id: game.meta.id,
    },
  });

const rename = (store, title) =>
  act(() =>
    store.dispatch(editGame((g) => ({ ...g, info: { ...g.info, title } }))),
  );

beforeEach(async () => {
  await browser.viewport(1280, 900);
  vi.resetAllMocks();
});

describe("changes of a game", () => {
  it("shows neither menu entry nor toolbar button for a clean game", async () => {
    open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    expect(
      screen.queryByRole("link", { name: /Changes/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /History/ }),
    ).not.toBeInTheDocument();
  });

  it("says so on the page when nothing changed", async () => {
    open("/games/internal:abc/changes");
    const page = await screen.findByTestId("game-internal:abc-changes");
    expect(page).toHaveTextContent("No changes");
    expect(
      within(page).queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
  });

  it("shows the diff, a menu entry and a toolbar button after an edit", async () => {
    const { store, user } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    const toolbar = await screen.findByRole("link", { name: "Changes" });
    expect(toolbar).toHaveAttribute("href", "/games/internal:abc/changes");
    await user.click(toolbar);

    const page = await screen.findByTestId("game-internal:abc-changes");
    const diff = await within(page).findByTestId("diff");
    expect(diff).toHaveTextContent('"title": "Renamed Game"');
    expect(diff).toHaveTextContent(`"title": "${games["18Test"].info.title}"`);
    expect(within(page).getByTestId("diff-summary")).toHaveTextContent(
      "1 lines added, 1 lines removed",
    );
    const entry = screen.getAllByRole("link", { name: /Changes/ })[0];
    expect(entry.closest("li")).toHaveTextContent("1");
  });

  it("reverts to the saved game", async () => {
    const { store, user } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(store, "Renamed Game");
    await user.click(await screen.findByRole("button", { name: /Revert/ }));

    expect(store.getState().game.info.title).toBe(games["18Test"].info.title);
    expect(await screen.findByText(/No changes/)).toBeInTheDocument();
  });

  it("saves the game, then lists the save in the history and restores it", async () => {
    opfs.peekGame.mockResolvedValue(internal());
    const { store, user, router } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(store, "Renamed Game");

    await user.click(await screen.findByRole("button", { name: "Save" }));

    await waitFor(() => expect(opfs.overwriteGame).toHaveBeenCalled());
    expect(opfs.overwriteGame.mock.calls[0][0]).toBe("abc");
    expect(JSON.parse(opfs.overwriteGame.mock.calls[0][1]).info.title).toBe(
      "Renamed Game",
    );
    expect(opfs.overwriteGame.mock.calls[0][1]).toBe(
      gameText(store.getState().game),
    );
    expect(await screen.findByText(/No changes/)).toBeInTheDocument();

    const history = await screen.findByRole("link", { name: /History/ });
    await user.click(history);
    const page = await screen.findByTestId("game-internal:abc-history");
    await user.click(within(page).getByRole("button", { name: "View diff" }));
    expect(await within(page).findByTestId("diff")).toHaveTextContent(
      '"title": "Renamed Game"',
    );

    await user.click(within(page).getByRole("button", { name: "Restore" }));
    await screen.findByTestId("game-internal:abc-changes");
    expect(router.state.location.pathname).toBe("/games/internal:abc/changes");
    expect(store.getState().game.info.title).toBe(games["18Test"].info.title);
    expect(await screen.findByTestId("diff")).toHaveTextContent(
      '"title": "Renamed Game"',
    );
  });

  it("offers to reload or overwrite when the file changed outside", async () => {
    const changed = internal();
    changed.info.title = "Changed elsewhere";
    opfs.peekGame.mockResolvedValue(changed);
    const { store, user } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(store, "Renamed Game");

    await user.click(await screen.findByRole("button", { name: "Save" }));

    const alert = await screen.findByTestId("changes-conflict");
    expect(opfs.overwriteGame).not.toHaveBeenCalled();

    await user.click(
      within(alert).getByRole("button", { name: "Overwrite the file" }),
    );
    await waitFor(() => expect(opfs.overwriteGame).toHaveBeenCalled());
    expect(screen.queryByTestId("changes-conflict")).not.toBeInTheDocument();
  });

  it("reloads the file and drops the edits from the conflict", async () => {
    const changed = internal();
    changed.info.title = "Changed elsewhere";
    opfs.peekGame.mockResolvedValue(changed);
    opfs.loadGame.mockResolvedValue(changed);
    const { store, user } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(store, "Renamed Game");
    await user.click(await screen.findByRole("button", { name: "Save" }));

    await user.click(
      await screen.findByRole("button", { name: "Reload the file" }),
    );

    await waitFor(() =>
      expect(store.getState().game.info.title).toBe("Changed elsewhere"),
    );
    expect(await screen.findByText(/No changes/)).toBeInTheDocument();
  });

  it("a bundled game cannot be saved", async () => {
    const { store } = renderApp("/games/18Test/changes");
    await screen.findByTestId("game-18Test-changes");
    await rename(store, "Renamed Game");

    await screen.findByTestId("diff");
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Revert/ })).toBeInTheDocument();
  });

  it("are plain pages, not the pan and zoom editor", async () => {
    const { router } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    expect(document.getElementById("viewport-children")).toBeNull();
    await act(() => router.navigate("/games/internal:abc/history"));
    await screen.findByTestId("game-internal:abc-history");
    expect(document.getElementById("viewport-children")).toBeNull();
  });

  it("asks before leaving the page with unsaved edits", async () => {
    const { store } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");

    const leave = () => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(leave()).toBe(false);
    await rename(store, "Renamed Game");
    await waitFor(() => expect(leave()).toBe(true));
  });

  it("keeps a loaded game that was set again", async () => {
    const { store } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(store, "Renamed Game");
    act(() => store.dispatch(createSetGame(internal())));
    expect(await screen.findByText(/No changes/)).toBeInTheDocument();
  });
});
