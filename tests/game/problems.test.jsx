/* eslint-disable testing-library/no-node-access -- the viewport wrapper and the badge sibling have no role */
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { page as browser } from "vitest/browser";

import { createSetGame, validateLoadedGame } from "@/state";
import { gameText } from "@/util/download";

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

  it("links every row to its line of the json editor", async () => {
    const game = brokenGame();
    const { store } = renderApp("/games/Broken/problems", {
      game,
      loadedGame: { slug: "Broken", title: "Broken", id: "Broken" },
    });
    await check(store);

    // The first section of the game is the tokens, and the lines are the ones
    // of the text the editor starts with
    const lines = gameText(game).split("\n");
    const lineOf = (needle) =>
      lines.findIndex((line) => line.includes(needle)) + 1;
    const href = (line) =>
      `/games/Broken/tokens?edit=true&editSection=json&lines=${line}`;

    expect(
      await screen.findByRole("link", {
        name: "Open stock.marekt in the JSON editor",
      }),
    ).toHaveAttribute("href", href(lineOf('"marekt"')));
    // An item of a list is the line of its own brace
    expect(
      screen.getByRole("link", {
        name: "Open companies[0] in the JSON editor",
      }),
    ).toHaveAttribute("href", href(lineOf('"name": "No abbrev"') - 1));
    expect(
      screen.getByRole("link", {
        name: "Open exports.png.dpi in the JSON editor",
      }),
    ).toHaveAttribute("href", href(lineOf('"dpi"')));
    expect(
      screen.getAllByRole("link", { name: /in the JSON editor/ }),
    ).toHaveLength(5);
  });

  it("opens the json editor with the line when a row is followed", async () => {
    const game = brokenGame();
    const { store, router } = renderApp("/games/Broken/problems", {
      game,
      loadedGame: { slug: "Broken", title: "Broken", id: "Broken" },
    });
    await check(store);

    await userEvent.click(
      await screen.findByRole("link", {
        name: "Open stock.marekt in the JSON editor",
      }),
    );

    expect(await screen.findByTestId("json-editor")).toBeInTheDocument();
    const line =
      gameText(game)
        .split("\n")
        .findIndex((text) => text.includes('"marekt"')) + 1;
    expect(router.state.location.pathname).toBe("/games/Broken/tokens");
    expect(router.state.location.search).toContain(`lines=${line}`);
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
      within(page).queryByRole("link", { name: /JSON editor/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Problems/ }),
    ).not.toBeInTheDocument();
  });
});
