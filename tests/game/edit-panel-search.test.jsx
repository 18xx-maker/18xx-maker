import { screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";

import { renderApp } from "@tests/support/helpers.jsx";

const open = (section) => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  return renderApp(`/games/internal:abc/map?edit=true&editSection=${section}`, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
  });
};

const search = () => screen.findByRole("searchbox", { name: "Find a field" });
const cards = () =>
  screen.queryAllByRole("listitem").filter((li) => li.dataset.item);

beforeEach(async () => {
  await browser.viewport(1280, 900);
});

describe("edit panel field search", () => {
  it("opens the card of a match, focuses the field and goes on with Enter", async () => {
    const { user } = open("companies");
    await user.type(await search(), "abbrev{Enter}");
    const first = within(cards()[0]).getByRole("textbox", { name: "Abbrev" });
    expect(first).toBeVisible();
    expect(first).toHaveFocus();
    expect(
      screen.getByText(/^Abbrev \(Black Railroad BLRR\), match 1 of /),
    ).toBeInTheDocument();

    await user.type(await search(), "{Enter}");
    const second = within(cards()[1]).getByRole("textbox", { name: "Abbrev" });
    expect(second).toBeVisible();
    expect(second).toHaveFocus();
    // The first card stays open
    expect(first).toBeVisible();
  });

  it("goes back with Shift+Enter and says when nothing matches", async () => {
    const { user } = open("companies");
    await user.type(await search(), "abbrev{Shift>}{Enter}{/Shift}");
    const last = cards().at(-1);
    expect(within(last).getByRole("textbox", { name: "Abbrev" })).toHaveFocus();

    await user.clear(await search());
    await user.type(await search(), "nothinglikethis{Enter}");
    expect(screen.getByText("No field matches")).toBeInTheDocument();
  });

  it("is focused by / and Escape clears it before the panel closes", async () => {
    const { user } = open("info");
    await screen.findByTestId("edit-panel");
    await user.keyboard("/");
    expect(await search()).toHaveFocus();
    expect(await search()).toHaveValue("");

    await user.type(await search(), "ti");
    await user.keyboard("{Escape}");
    expect(await search()).toHaveValue("");
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
  });

  it("is not in the JSON editor", async () => {
    open("json");
    await screen.findByTestId("edit-panel");
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });
});

describe("edit panel list filter", () => {
  const narrow = () =>
    screen.findByRole("searchbox", { name: "Filter company" });

  it("narrows the cards to the ones with the text and keeps them in the game", async () => {
    const { user, store } = open("companies");
    const all = (await screen.findAllByRole("listitem")).filter(
      (li) => li.dataset.item,
    ).length;
    await user.type(await narrow(), "navy");
    await waitFor(() => expect(cards()).toHaveLength(1));
    expect(cards()[0].dataset.item).toBe("3");
    expect(screen.getByText(`Showing 1 of ${all}`)).toBeInTheDocument();

    // An abbreviation matches too
    await user.clear(await narrow());
    await user.type(await narrow(), "lbrr");
    await waitFor(() => expect(cards()).toHaveLength(2));

    await user.clear(await narrow());
    await user.type(await narrow(), "zzz");
    await waitFor(() => expect(cards()).toHaveLength(0));
    expect(screen.getByText("No match")).toBeInTheDocument();

    await user.clear(await narrow());
    await waitFor(() => expect(cards()).toHaveLength(all));
    expect(store.getState().game.companies).toHaveLength(all);
  });

  it("keeps a card open while it is filtered out and clears on add", async () => {
    const { user } = open("companies");
    await user.click(
      within(
        (await screen.findAllByRole("listitem")).find(
          (li) => li.dataset.item === "3",
        ),
      ).getAllByRole("button")[0],
    );
    await user.type(await narrow(), "black");
    await waitFor(() => expect(cards()).toHaveLength(1));
    await user.clear(await narrow());
    await waitFor(() =>
      expect(
        within(cards()[3]).getByRole("textbox", { name: "Abbrev" }),
      ).toBeVisible(),
    );

    await user.type(await narrow(), "black");
    await user.click(screen.getByRole("button", { name: "Add company" }));
    await waitFor(() => expect(narrow()).resolves.toHaveValue(""));
  });

  it("has no filter on a list with one item or on a tab without one", async () => {
    open("players");
    await screen.findByTestId("edit-panel");
    expect(
      screen.queryByRole("searchbox", { name: /Filter/ }),
    ).not.toBeInTheDocument();
  });
});
