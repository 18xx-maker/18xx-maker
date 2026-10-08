import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import { resetDrafts, setDraft } from "@/components/editPanel/draftStore";

import {
  createGameProblemsDone,
  createGameProblemsRunning,
  validateLoadedGame,
} from "@/state";
import { gameText } from "@/util/download";

import { brokenGame } from "@tests/support/brokenGame.js";
import { renderApp } from "@tests/support/helpers.jsx";

const route = "/games/internal:abc/tokens?edit=true&editSection=problems";

beforeEach(async () => {
  await browser.viewport(1280, 900);
});

afterEach(resetDrafts);

// An internal game is the one the edit panel is for
const internal = (game) => ({
  ...game,
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
});

const open = async (game = brokenGame(), url = route) => {
  const view = renderApp(url, {
    game: internal(game),
    gameOriginal: internal(game),
    gameHistory: [],
    loadedGame: { slug: "internal:abc", title: game.info.title, id: "abc" },
  });
  await screen.findByTestId("edit-panel");
  // The app checks the game 500 ms after it settles: run the check directly
  await act(() =>
    view.store.dispatch(validateLoadedGame(view.store.getState().game)),
  );
  return view;
};

// The same game as brokenGame with the mistakes fixed
const withoutProblems = () => ({
  info: brokenGame().info,
  meta: brokenGame().meta,
  companies: [{ name: "A", abbrev: "A", color: "red" }],
});

const dpi = () =>
  screen.findByRole("link", {
    name: "Open exports.png.dpi in the JSON editor",
  });

describe("edit panel problems tab", () => {
  it("opens from a link and lists the rows of the problems page", async () => {
    await open();

    const panel = screen.getByTestId("edit-panel");
    expect(
      within(panel).getByRole("region", { name: "Problems" }),
    ).toBeInTheDocument();
    expect(within(panel).getByTestId("edit-switch-problems")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(panel).getByTestId("edit-switch-forms")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(panel).toHaveTextContent("5 found in Broken");
    expect(panel).toHaveTextContent("stock.marekt");
    expect(panel).toHaveTextContent('Did you mean "market"?');
    expect(panel).toHaveTextContent("exports.png.dpi");
    // No chips, no search: it is not a form
    expect(within(panel).queryByRole("tab")).not.toBeInTheDocument();
    expect(within(panel).queryByRole("searchbox")).not.toBeInTheDocument();
    expect(await dpi()).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /in the JSON editor/ }),
    ).toHaveLength(5);
  });

  it("opens a row on its line of the JSON tab, and Back returns", async () => {
    const game = brokenGame();
    const { user, router } = await open(game);

    const line =
      gameText(internal(game))
        .split("\n")
        .findIndex((text) => text.includes('"dpi"')) + 1;
    const link = await dpi();
    expect(link).toHaveAttribute(
      "href",
      `/games/internal:abc/tokens?edit=true&editSection=json&lines=${line}`,
    );

    await user.click(link);
    expect(router.state.location.pathname).toBe("/games/internal:abc/tokens");
    expect(router.state.location.search).toBe(
      `?edit=true&editSection=json&lines=${line}`,
    );
    expect(
      await screen.findByRole("region", { name: "JSON" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("edit-switch-json")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await act(() => router.navigate(-1));
    expect(
      await screen.findByRole("region", { name: "Problems" }),
    ).toBeInTheDocument();
    expect(router.state.location.search).toBe(
      "?edit=true&editSection=problems",
    );
  });

  it("keeps the variation when a row is followed", async () => {
    await open(brokenGame(), `${route}&variation=1`);
    expect(await dpi()).toHaveAttribute(
      "href",
      expect.stringMatching(/editSection=json&variation=1&lines=\d+$/),
    );
  });

  it("links without a line when the editor has a draft", async () => {
    const game = brokenGame();
    setDraft("internal:abc", "{", game);
    await open(game);

    const link = await dpi();
    expect(link).toHaveAttribute(
      "href",
      "/games/internal:abc/tokens?edit=true&editSection=json",
    );
  });

  it("says when there are no problems", async () => {
    await open(
      withoutProblems(),
      "/games/internal:abc/tokens?edit=true&editSection=problems",
    );
    expect(await screen.findByText("No problems found")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-switch-problem")).not.toBeInTheDocument();
  });

  it("says it is checking until there is a result", async () => {
    const game = withoutProblems();
    const view = renderApp(
      "/games/internal:abc/tokens?edit=true&editSection=problems",
      {
        game: internal(game),
        loadedGame: { slug: "internal:abc", title: "Valid", id: "abc" },
      },
    );
    await screen.findByTestId("edit-panel");
    // A result of another game is no result for this one
    await act(() => view.store.dispatch(createGameProblemsRunning("Other")));
    expect(
      await screen.findByText("Checking the game file"),
    ).toBeInTheDocument();
  });

  describe("switch dot", () => {
    const issue = (code, pointer = "stock.type") => ({
      severity: "error",
      code,
      pointer,
      params: {},
    });

    it("counts the problems, but not deprecated fields or failed checks", async () => {
      const { store } = await open(
        withoutProblems(),
        "/games/internal:abc/tokens?edit=true",
      );
      expect(
        screen.queryByTestId("edit-switch-problem"),
      ).not.toBeInTheDocument();

      await act(() =>
        store.dispatch(
          createGameProblemsDone("internal:abc", [
            issue("deprecated"),
            issue("failed"),
          ]),
        ),
      );
      expect(
        screen.queryByTestId("edit-switch-problem"),
      ).not.toBeInTheDocument();

      await act(() =>
        store.dispatch(
          createGameProblemsDone("internal:abc", [
            issue("type"),
            issue("type", "trains"),
            issue("deprecated"),
          ]),
        ),
      );
      expect(screen.getByTestId("edit-switch-problem")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Problems 2 problems" }),
      ).toBeInTheDocument();
    });

    it("is hidden while the check runs", async () => {
      const { store } = await open();
      expect(screen.getByTestId("edit-switch-problem")).toBeInTheDocument();

      await act(() =>
        store.dispatch(createGameProblemsRunning("internal:abc")),
      );
      expect(
        screen.queryByTestId("edit-switch-problem"),
      ).not.toBeInTheDocument();
    });
  });

  describe("leaving", () => {
    it("goes back to the last form with Forms", async () => {
      const { user, router } = await open(
        brokenGame(),
        "/games/internal:abc/tokens?edit=true&editSection=trains",
      );
      await user.click(screen.getByTestId("edit-switch-problems"));
      expect(router.state.location.search).toContain("editSection=problems");

      await user.click(screen.getByTestId("edit-switch-forms"));
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=trains",
      );
      expect(screen.getByRole("tab", { name: "Trains" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("goes to the last form and focuses its chip with ]", async () => {
      const { user, router } = await open(
        brokenGame(),
        "/games/internal:abc/tokens?edit=true&editSection=trains",
      );
      await user.click(screen.getByTestId("edit-switch-problems"));
      // The focus inside the panel moves with the section
      (await dpi()).focus();

      await user.keyboard("]");
      await waitFor(() =>
        expect(router.state.location.search).toBe(
          "?edit=true&editSection=trains",
        ),
      );
      const chip = screen.getByRole("tab", { name: "Trains" });
      await waitFor(() => expect(chip).toHaveFocus());
    });

    it("closes the panel with Escape", async () => {
      const { user, router } = await open();
      (await dpi()).focus();

      await user.keyboard("{Escape}");
      await waitFor(() => expect(router.state.location.search).toBe(""));
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
    });
  });
});
