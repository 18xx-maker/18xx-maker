import { screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";

import { renderApp } from "@tests/support/helpers.jsx";

// An editable copy of 18Test: its train 2 rusts on 4D, its private "Private
// with a company" is the PRR's
let opened;

afterEach(async () => {
  // The edit starts a check of the game: let it end inside the test
  if (opened) {
    await waitFor(() => {
      if (opened.getState().gameProblems.status === "running") {
        throw new Error("still checking the game");
      }
    });
  }
  opened = undefined;
});

const open = (section) => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  const view = renderApp(
    `/games/internal:abc/map?edit=true&editSection=${section}`,
    {
      game,
      gameOriginal: structuredClone(game),
      gameHistory: [],
      loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
    },
  );
  opened = view.store;
  return view;
};

beforeEach(async () => {
  await browser.viewport(1280, 900);
});

describe("the reference fields of the edit panel", () => {
  it("pick the train a train rusts on from the trains of the game", async () => {
    const { user, store } = open("trains");
    const panel = await screen.findByTestId("edit-panel");

    // The first card is the train 2, which rusts on 4D
    const rust = within(panel).getAllByRole("combobox", { name: /^Rust/ })[0];
    expect(screen.getByRole("button", { name: "Remove 4D" })).toBeVisible();

    await user.click(rust);
    const names = screen
      .getAllByRole("option")
      .map((option) => option.firstChild.textContent);
    expect(names).toEqual(games["18Test"].trains.map((train) => train.name));

    await user.click(screen.getByRole("option", { name: /^3\+1/ }));
    expect(store.getState().game.trains[0].rust).toEqual(["4D", "3+1"]);
  });

  it("pick the company of a private from the companies of the game", async () => {
    const { user, store } = open("privates");
    const panel = await screen.findByTestId("edit-panel");

    const index = games["18Test"].privates.findIndex((p) => p.company);
    const company = within(panel).getAllByRole("combobox", {
      name: /^Company/,
    })[index];
    await user.click(company);
    expect(screen.getAllByRole("option")).toHaveLength(
      games["18Test"].companies.length,
    );
    await user.click(screen.getByRole("option", { name: /^BRR/ }));

    expect(store.getState().game.privates[index].company).toBe("BRR");
  });

  it("close the list before the panel with Escape", async () => {
    const { user } = open("trains");
    const panel = await screen.findByTestId("edit-panel");
    await user.click(
      within(panel).getAllByRole("combobox", { name: /^Obsolete/ })[0],
    );
    expect(screen.getByRole("listbox")).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByTestId("edit-panel")).toBeVisible();
  });
});
