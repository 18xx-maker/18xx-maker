/* eslint-disable testing-library/no-node-access -- the viewport wrapper and the badge sibling have no role */
import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import { createSetGame, validateLoadedGame } from "@/state";

import { brokenGame, validGame } from "@tests/support/brokenGame.js";
import { renderApp } from "@tests/support/helpers.jsx";

// The app checks a game 500 ms after it settles; the tests run the same check
// directly and wait for it
const check = (store) =>
  act(() => store.dispatch(validateLoadedGame(store.getState().game)));

beforeEach(async () => {
  await browser.viewport(1280, 900);
});

describe("problems of a game", () => {
  it("lists them on the page and in the menu", async () => {
    const game = brokenGame();
    const { store } = renderApp("/games/Broken/problems", {
      game,
      loadedGame: { slug: "Broken", title: "Broken", id: "Broken" },
    });
    await check(store);

    const page = await screen.findByTestId("game-Broken-problems");
    expect(
      within(page).getByRole("heading", { name: "Problems with this game" }),
    ).toBeInTheDocument();
    expect(page).toHaveTextContent("stock.marekt");
    expect(page).toHaveTextContent('Did you mean "market"?');
    expect(page).toHaveTextContent("exports.png.dpi");
    expect(page).toHaveTextContent('Missing the required field "abbrev".');
    expect(page).toHaveTextContent("exports.paginated");
    expect(page).toHaveTextContent("5 found in Broken");

    const link = await screen.findByRole("link", { name: /Problems/ });
    expect(link).toHaveAttribute("href", "/games/Broken/problems");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link.closest("li")).toHaveTextContent("5");
  });

  it("is a plain page, not the pan and zoom editor", async () => {
    const { router } = renderApp("/games/18Test/problems");
    await screen.findByTestId("game-18Test-problems");
    expect(document.getElementById("viewport-children")).toBeNull();

    await act(() => router.navigate("/games/18Test/map"));
    await screen.findByTestId("game-18Test-map");
    expect(document.getElementById("viewport-children")).not.toBeNull();
  });

  it("has no menu entry for a game without problems", async () => {
    const { store } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await check(store);

    await waitFor(() =>
      expect(store.getState().gameProblems.status).toBe("done"),
    );
    expect(
      screen.queryByRole("link", { name: /Problems/ }),
    ).not.toBeInTheDocument();
  });

  it("says so when there are none", async () => {
    const { store } = renderApp("/games/18Test/problems");
    await screen.findByTestId("game-18Test-problems");
    await check(store);

    expect(await screen.findByText("No problems found")).toBeInTheDocument();
  });

  it("checks again when another game is loaded", async () => {
    const { store } = renderApp("/games/Broken/problems", {
      game: brokenGame(),
    });
    await check(store);
    await screen.findByText(/5 found in Broken/);

    act(() => store.dispatch(createSetGame(validGame())));
    await check(store);
    expect(store.getState().gameProblems.slug).toBe("Valid");
  });

  it("does not count a check that could not run as a problem", async () => {
    renderApp("/games/18Test/problems", {
      gameProblems: {
        slug: "18Test",
        status: "done",
        issues: [
          { severity: "warning", code: "failed", pointer: "", params: {} },
        ],
      },
    });

    const page = await screen.findByTestId("game-18Test-problems");
    expect(page).toHaveTextContent("Warning");
    expect(page).not.toHaveTextContent("Deprecated");
    expect(
      screen.queryByRole("link", { name: /Problems/ }),
    ).not.toBeInTheDocument();
  });
});
