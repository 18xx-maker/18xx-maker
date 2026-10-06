import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import { omit } from "ramda";

import games from "@/data/games";
import { editGame, selectGameProblems } from "@/state";
import { selectGameChanged } from "@/state/selectors";

import { renderApp } from "@tests/support/helpers.jsx";

// An editable game with a saved original, so changes are known
let opened;

// An edit starts the check of the game in the background: let it end inside
// the test, its result updates the panel
const settled = () =>
  waitFor(() => {
    if (opened.getState().gameProblems.status === "running") {
      throw new Error("still checking the game");
    }
  });

afterEach(async () => {
  if (opened) await settled();
  opened = undefined;
});

const open = (route, base = games["18Test"]) => {
  const game = {
    ...structuredClone(base),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  const view = renderApp(route, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
  });
  opened = view.store;
  return view;
};

const route = "/games/internal:abc/map";
const panel = () => screen.findByTestId("edit-panel");
const field = (name) => screen.findByRole("textbox", { name });

beforeEach(async () => {
  await browser.viewport(1280, 900);
});

describe("edit panel", () => {
  it("opens with the toolbar toggle and closes with its button", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await panel();
    expect(router.state.location.search).toBe("?edit=true");
    expect(screen.getByRole("button", { name: "Edit" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(
      screen.getByRole("button", { name: "Close the edit panel" }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("");
  });

  it("e opens it, e typed in a field does not close it", async () => {
    const { user } = open(route);
    await screen.findByTestId("game-internal:abc-map");

    await user.keyboard("e");
    await panel();

    await user.click(await field("Subtitle"));
    await user.keyboard("e");
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();
    expect(await field("Subtitle")).toHaveValue("18xx-Maker Test Filee");

    // The close button closes it
    await user.click(
      screen.getByRole("button", { name: "Close the edit panel" }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
  });

  it("e with the focus outside a field closes it", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");

    await user.keyboard("e");
    await panel();
    await user.keyboard("e");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("");
  });

  it("escape closes it with the focus in a field, on a button or nowhere", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");

    for (const focus of [
      () => field("Title"),
      () => screen.findByRole("button", { name: "Close the edit panel" }),
      () => screen.findByRole("combobox", { name: "Orientation" }),
    ]) {
      await user.keyboard("e");
      await panel();
      (await focus()).focus();
      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
      );
      // One step back only: the edit page stays
      expect(router.state.location.pathname).toBe(route);
      expect(router.state.location.search).toBe("");
    }
  });

  it("escape closes an open select first, then the panel", async () => {
    const { user } = open(route);
    await screen.findByTestId("game-internal:abc-map");
    await user.keyboard("e");
    await user.click(
      await screen.findByRole("combobox", { name: "Orientation" }),
    );
    await screen.findByRole("option", { name: "horizontal" });

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("option")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
  });

  it("is not on the info page, where e still goes to the first section", async () => {
    const { user, router } = open("/games/internal:abc");
    await screen.findByTestId("game-internal:abc");
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    await user.keyboard("e");
    await screen.findByTestId("game-internal:abc-map");
    expect(router.state.location.search).toBe("");
  });

  it("is not on the print page", async () => {
    const { user } = open(`${route}?print=true`);
    await screen.findByTestId("game-internal:abc-map");
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    // e keeps going back to the info page
    await user.keyboard("e");
    await screen.findByTestId("game-internal:abc");
  });

  it("is not on the box maker page", async () => {
    renderApp("/games/18Test/b18/map?edit=true");
    await screen.findByTestId("game-18Test-b18-map");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("excludes the config panel", async () => {
    const { user, router } = open(`${route}?config=true&section=data`);
    await screen.findByRole("heading", { name: "Configuration" });

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await panel();
    expect(router.state.location.search).toBe("?edit=true");
    expect(
      screen.queryByRole("heading", { name: "Configuration" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Config" }));
    await screen.findByRole("heading", { name: "Configuration" });
    expect(router.state.location.search).toBe("?config=true");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();

    await user.keyboard("e");
    await panel();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    await user.keyboard("c");
    await screen.findByRole("heading", { name: "Configuration" });
  });

  it("[ and ] change the tab, a number goes to a section and drops the panel", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");
    await user.keyboard("e");
    await panel();

    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=trains",
      ),
    );
    expect(router.state.location.pathname).toBe(route);
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();

    await user.keyboard("1");
    await waitFor(() => expect(router.state.location.search).toBe(""));
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
  });
});

describe("edit panel fields", () => {
  it("edits the title in the game and shows the changes button", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const title = await field("Title");
    expect(title).toHaveValue("18Test");
    expect(selectGameChanged(store.getState())).toBe(false);

    await user.clear(title);
    await user.type(title, "New Title");
    // Nothing is passed on before the field is left
    expect(store.getState().game.info.title).toBe("18Test");
    await user.tab();

    expect(store.getState().game.info.title).toBe("New Title");
    expect(selectGameChanged(store.getState())).toBe(true);
    expect(await screen.findByRole("link", { name: /Changes/ })).toBeVisible();
    expect(store.getState().game.meta).toEqual({
      id: "abc",
      type: "internal",
      slug: "internal:abc",
    });
  });

  it("enter passes on a value", async () => {
    const { user, store } = open(`${route}?edit=true`);
    await user.type(await field("Designer"), " II{Enter}");
    expect(store.getState().game.info.designer).toBe("Christopher Giroir II");
  });

  it("clearing a field removes the key", async () => {
    const { user, store } = open(`${route}?edit=true`);
    await user.clear(await field("Subtitle"));
    await user.tab();

    expect("subtitle" in store.getState().game.info).toBe(false);
    expect(store.getState().game.info.title).toBe("18Test");
  });

  it("clearing the title keeps it and shows it is required", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const title = await field("Title");
    await user.clear(title);
    await user.tab();

    expect(store.getState().game.info.title).toBe("18Test");
    expect(await screen.findByText("This field is required.")).toBeVisible();
    await waitFor(() => expect(title).toHaveValue("18Test"));

    // Downloading with the key still there does not throw
    await user.click(document.body);
    await user.keyboard("d");
    expect(store.getState().game.info.title).toBe("18Test");
  });

  it("clearing the last link removes the empty object, not the info", async () => {
    const { user, store } = open(`${route}?edit=true`);
    await user.clear(await field("Bgg"));
    await user.tab();
    await user.clear(await field("Rules"));
    await user.tab();

    expect("links" in store.getState().game).toBe(false);
    expect(store.getState().game.info.title).toBe("18Test");
  });

  it("a field that is left unchanged makes no change", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const title = await field("Title");
    await user.click(title);
    await user.type(title, "x{Backspace}");
    await user.tab();
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("keeps what is typed when the panel is closed without leaving the field", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const title = await field("Title");
    await user.clear(title);
    await user.type(title, "Typed Title");
    expect(store.getState().game.info.title).toBe("18Test");

    // Removing the panel fires no blur
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    expect(store.getState().game.info.title).toBe("Typed Title");
  });

  it("sets an enum, and unsets it again", async () => {
    const { user, store } = open(`${route}?edit=true`);
    await user.click(
      await screen.findByRole("combobox", { name: "Orientation" }),
    );
    await user.click(await screen.findByRole("option", { name: "vertical" }));
    expect(store.getState().game.info.orientation).toBe("vertical");

    await user.click(screen.getByRole("combobox", { name: "Orientation" }));
    await user.click(await screen.findByRole("option", { name: "Not set" }));
    expect("orientation" in store.getState().game.info).toBe(false);
  });

  it("has three states for a flag: not set, yes and no", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const wip = await screen.findByRole("combobox", { name: "Wip" });
    expect(wip).toHaveTextContent("Yes");

    await user.click(wip);
    await user.click(await screen.findByRole("option", { name: "No" }));
    expect(store.getState().game.wip).toBe(false);

    await user.click(screen.getByRole("combobox", { name: "Wip" }));
    await user.click(await screen.findByRole("option", { name: "Not set" }));
    expect("wip" in store.getState().game).toBe(false);
  });

  it("types numbers as text and sets one when the field is left", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const tokens = await screen.findByRole("spinbutton", {
      name: "Market Tokens",
    });
    expect(tokens).toHaveValue(1);

    // A real keyboard is not wrapped in act: let the check of the game end
    // first. The field has a bad input, which is not an empty field.
    await waitFor(() => {
      if (store.getState().gameProblems.status !== "done") {
        throw new Error("not checked yet");
      }
    });
    await user.clear(tokens);
    await realUser.keyboard("-");
    await user.tab();
    expect(store.getState().game.info.marketTokens).toBe(1);
    expect(await screen.findByText("Enter a number.")).toBeVisible();

    await user.clear(tokens);
    await user.type(tokens, "3");
    await user.tab();
    expect(store.getState().game.info.marketTokens).toBe(3);
    expect(screen.queryByText("Enter a number.")).not.toBeInTheDocument();

    await user.clear(tokens);
    await user.tab();
    expect("marketTokens" in store.getState().game.info).toBe(false);
  });

  it("keeps the value of a number field with a bad input when the panel closes", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const tokens = await screen.findByRole("spinbutton", {
      name: "Market Tokens",
    });
    await waitFor(() => {
      if (store.getState().gameProblems.status !== "done") {
        throw new Error("not checked yet");
      }
    });
    await user.clear(tokens);
    await realUser.keyboard("-");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    expect(store.getState().game.info.marketTokens).toBe(1);
  });

  it("a font weight is a number only when the text is", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const weight = await field("Value Font Weight");

    await user.type(weight, "700{Enter}");
    expect(store.getState().game.info.valueFontWeight).toBe(700);

    await user.clear(weight);
    await user.type(weight, "bold{Enter}");
    expect(store.getState().game.info.valueFontWeight).toBe("bold");

    await user.clear(weight);
    await user.type(weight, "700 bold{Enter}");
    expect(store.getState().game.info.valueFontWeight).toBe("700 bold");
  });

  it("shows the problems the game already has", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const input = await field("Currency");
    await user.clear(input);
    await user.type(input, "nohash{Enter}");
    expect(store.getState().game.info.currency).toBe("nohash");

    const currency = await field("Currency");
    await waitFor(() => expect(currency).toBeInvalid(), { timeout: 5000 });
    expect(
      within(screen.getByTestId("edit-panel")).getAllByRole("alert").length,
    ).toBeGreaterThan(0);
  });

  it("keeps what the panel does not edit", async () => {
    const { user, store } = open(`${route}?edit=true`);
    const before = store.getState().game;
    await user.type(await field("Subtitle"), "!{Enter}");

    const after = store.getState().game;
    expect(after.map).toBe(before.map);
    expect(after.tiles).toBe(before.tiles);
    expect(Object.keys(after)).toEqual(Object.keys(before));
    expect(Object.keys(after.info)).toEqual(Object.keys(before.info));
  });

  it("is reverted with the other changes", async () => {
    const { user, store } = open(`${route}?edit=true`);
    await user.type(await field("Subtitle"), "!{Enter}");
    expect(selectGameChanged(store.getState())).toBe(true);

    act(() => store.dispatch(editGame(() => store.getState().gameOriginal)));
    expect(selectGameChanged(store.getState())).toBe(false);
    await waitFor(async () =>
      expect(await field("Subtitle")).toHaveValue("18xx-Maker Test File"),
    );
  });
});

const trains = (store) => store.getState().game.trains;
const names = (store) => trains(store).map((train) => train.name);
const cards = () =>
  within(screen.getByTestId("edit-panel")).getAllByRole("listitem");
const button = (name) => screen.getByRole("button", { name });
const trainsRoute = `${route}?edit=true&editSection=trains`;

describe("edit panel tabs", () => {
  it("shows the tabs, switches by click and keeps the tab in the url", async () => {
    const { user, router } = open(`${route}?edit=true`);
    const info = await screen.findByRole("tab", { name: "Game info" });
    const tab = screen.getByRole("tab", { name: "Trains" });
    expect(info).toHaveAttribute("aria-selected", "true");
    expect(tab).toHaveAttribute("aria-selected", "false");
    expect(info).toHaveAttribute("tabindex", "0");
    expect(tab).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      info.id,
    );
    expect(info).toHaveAttribute(
      "aria-controls",
      screen.getByRole("tabpanel").id,
    );

    await user.click(tab);
    expect(router.state.location.search).toBe("?edit=true&editSection=trains");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      tab.id,
    );
    expect(
      await screen.findByRole("button", { name: "Add train" }),
    ).toBeVisible();

    await user.click(info);
    expect(router.state.location.search).toBe("?edit=true");
    expect(await field("Title")).toBeVisible();
  });

  it("moves between tabs with the arrow keys, Home and End", async () => {
    const { user, router } = open(`${route}?edit=true`);
    const info = await screen.findByRole("tab", { name: "Game info" });
    info.focus();

    await user.keyboard("{ArrowRight}");
    const trainsTab = screen.getByRole("tab", { name: "Trains" });
    expect(trainsTab).toHaveFocus();
    expect(router.state.location.search).toContain("editSection=trains");

    await user.keyboard("{ArrowRight}");
    const marketTab = screen.getByRole("tab", { name: "Market" });
    expect(marketTab).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(info).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(marketTab).toHaveFocus();
    await user.keyboard("{Home}");
    expect(info).toHaveFocus();
    await user.keyboard("{End}");
    expect(marketTab).toHaveFocus();
  });

  it("[ and ] cycle the tabs and wrap, but not while typing", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await screen.findByRole("tab", { name: "Game info" });

    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=trains",
      ),
    );
    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=market",
      ),
    );
    await user.keyboard("]");
    await waitFor(() =>
      expect(router.state.location.search).toBe("?edit=true"),
    );
    await user.keyboard("[[");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=market",
      ),
    );
    await user.keyboard("[[");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=trains",
      ),
    );

    await user.click(
      (await screen.findAllByRole("textbox", { name: "Name" }))[0],
    );
    await user.keyboard("[[]");
    expect(router.state.location.search).toBe("?edit=true&editSection=trains");
    expect(router.state.location.pathname).toBe(route);
  });

  it("an unknown tab in the url is the first tab", async () => {
    open(`${route}?edit=true&editSection=nope`);
    expect(
      await screen.findByRole("tab", { name: "Game info" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("forgets the tab when the panel closes", async () => {
    const { user, router } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("");

    await user.keyboard("e");
    expect(
      await screen.findByRole("tab", { name: "Game info" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("forgets the tab when the config panel opens", async () => {
    const { user, router } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });

    await user.click(screen.getByRole("button", { name: "Config" }));
    await screen.findByRole("heading", { name: "Configuration" });
    expect(router.state.location.search).toBe("?config=true");
  });

  it("the close button works from the trains tab", async () => {
    const { user } = open(trainsRoute);
    await user.click(
      await screen.findByRole("button", { name: "Close the edit panel" }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
  });
});

describe("edit panel trains", () => {
  it("shows a card for each train with its fields", async () => {
    open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    expect(cards()).toHaveLength(4);
    const first = within(cards()[0]);
    expect(first.getByRole("textbox", { name: "Name" })).toHaveValue("2");
    expect(first.getByRole("textbox", { name: "Quantity" })).toHaveValue("4");
    expect(first.getByRole("textbox", { name: "Price" })).toHaveValue("80");
    expect(first.getByRole("textbox", { name: "Color" })).toHaveValue("yellow");
    // The rest is behind More fields
    expect(
      first.queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();
    expect(
      within(cards()[3]).getByRole("textbox", { name: "Quantity" }),
    ).toHaveValue("∞");
  });

  it("More fields shows the other fields of a train", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(
      within(cards()[0]).getByRole("button", { name: "More fields" }),
    );
    expect(
      within(cards()[0]).getByRole("textbox", { name: "Description" }),
    ).toBeVisible();
    expect(
      within(cards()[0]).getByRole("spinbutton", { name: "Players" }),
    ).toBeVisible();
  });

  it("edits a field of a train in the game", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const price = within(cards()[1]).getByRole("textbox", { name: "Price" });
    await user.clear(price);
    await user.type(price, "200{Enter}");
    expect(trains(store)[1].price).toBe(200);
    expect(trains(store)[0].price).toBe(80);

    // Quantity is a whole number or the infinity sign
    const quantity = within(cards()[1]).getByRole("textbox", {
      name: "Quantity",
    });
    await user.clear(quantity);
    await user.type(quantity, "∞{Enter}");
    expect(trains(store)[1].quantity).toBe("∞");
    await user.clear(quantity);
    await user.type(quantity, "0{Enter}");
    expect(trains(store)[1].quantity).toBe("∞");
    expect(await screen.findByText(/whole number of at least 1/)).toBeVisible();
    await user.clear(quantity);
    await user.type(quantity, "5{Enter}");
    expect(trains(store)[1].quantity).toBe(5);
  });

  it("adds a train that is valid and named to not clash", async () => {
    const { user, store } = open(trainsRoute);
    await user.click(await screen.findByRole("button", { name: "Add train" }));
    expect(names(store)).toEqual(["2", "3+1", "4D", "8E", "5"]);
    expect(trains(store)[4]).toEqual({
      name: "5",
      color: "gray",
      quantity: 1,
    });
    expect(selectGameChanged(store.getState())).toBe(true);
    expect(cards()).toHaveLength(5);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Added train 5"),
    );
    // The focus goes to the new train
    expect(within(cards()[4]).getByRole("button", { name: "5" })).toHaveFocus();
  });

  it("adds to a game without trains and removes the key with the last train", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    act(() => store.dispatch(editGame((game) => omit(["trains"], game))));
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Add train" }));
    expect(trains(store)).toEqual([{ name: "1", color: "gray", quantity: 1 }]);

    await user.click(button("Remove train 1"));
    expect("trains" in store.getState().game).toBe(false);
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();
  });

  it("removes a train and puts it back with undo", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });

    await user.click(button("Remove train 3+1"));
    expect(names(store)).toEqual(["2", "4D", "8E"]);
    expect(screen.getByRole("status")).toHaveTextContent("Removed train 3+1");
    // The focus goes to the next card
    expect(
      within(cards()[1]).getByRole("button", { name: "4D" }),
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(names(store)).toEqual(["2", "3+1", "4D", "8E"]);
    expect(trains(store)[1]).toEqual(games["18Test"].trains[1]);
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    // Undo is back to the original game
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("the focus goes to Add train after removing the last train", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Remove train 8E"));
    expect(names(store)).toEqual(["2", "3+1", "4D"]);
    expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();
    // The next card does not exist: the focus is not lost
    expect(screen.getByRole("button", { name: "Add train" })).toHaveFocus();
  });

  it("moves a train up and down, the focus stays on the button", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    expect(button("Move train 2 up")).toBeDisabled();
    expect(button("Move train 8E down")).toBeDisabled();

    await user.click(button("Move train 2 down"));
    expect(names(store)).toEqual(["3+1", "2", "4D", "8E"]);
    expect(button("Move train 2 down")).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Moved train 2 to position 2 of 4",
    );

    await user.click(button("Move train 2 up"));
    expect(names(store)).toEqual(["2", "3+1", "4D", "8E"]);
    // At the top the button is disabled: the focus moves to the other one
    expect(button("Move train 2 down")).toHaveFocus();
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("duplicates a train after the source with a name that is free", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Duplicate train 3+1"));

    expect(names(store)).toEqual(["2", "3+1", "5", "4D", "8E"]);
    expect(trains(store)[2]).toEqual({ ...trains(store)[1], name: "5" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Duplicated train as 5",
    );
  });

  it("edits the right train after a reorder", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Move train 2 down"));

    const price = within(cards()[1]).getByRole("textbox", { name: "Price" });
    expect(price).toHaveValue("80");
    await user.clear(price);
    await user.type(price, "99{Enter}");
    expect(trains(store)[1]).toMatchObject({ name: "2", price: 99 });
    expect(trains(store)[0].name).toBe("3+1");
    expect(trains(store)[0].price).not.toBe(99);
  });

  it("passes on what is typed before it removes another train", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const name = within(cards()[1]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.type(name, "typed");

    // A click that does not move the focus, as on Safari
    act(() => button("Remove train 2").click());
    expect(names(store)).toEqual(["typed", "4D", "8E"]);
    expect(trains(store)[0].name).toBe("typed");
  });

  it("duplicates and undoes a removal with what was typed, without a focus change", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const name = within(cards()[1]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.type(name, "5");

    act(() => button("Duplicate train 3+1").click());
    expect(names(store)).toEqual(["2", "5", "6", "4D", "8E"]);
    expect(trains(store)[2]).toEqual({ ...trains(store)[1], name: "6" });

    const typed = within(cards()[3]).getByRole("textbox", { name: "Name" });
    await user.clear(typed);
    await user.type(typed, "x");
    act(() => button("Remove train 4D").click());
    expect(names(store)).toEqual(["2", "5", "6", "8E"]);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(names(store)).toEqual(["2", "5", "6", "x", "8E"]);
  });

  it("undo passes on what is typed first", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Remove train 8E"));
    const name = within(cards()[0]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.type(name, "typed");
    act(() => button("Undo").click());
    expect(names(store)).toEqual(["typed", "3+1", "4D", "8E"]);
  });

  it("keeps the undo note until the next action on the list", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { user } = open(trainsRoute);
      await screen.findByRole("button", { name: "Add train" });
      await user.click(button("Remove train 2"));
      await act(() => vi.advanceTimersByTimeAsync(30000));
      expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();
      await user.click(button("Move train 3+1 down"));
      expect(
        screen.queryByRole("button", { name: "Undo" }),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("a collapsed card and More fields follow the train when it moves or one is removed", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(within(cards()[0]).getByRole("button", { name: "2" }));
    await user.click(
      within(cards()[1]).getByRole("button", { name: "More fields" }),
    );

    await user.click(button("Move train 2 down"));
    expect(
      within(cards()[1]).getByRole("button", { name: "2" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(cards()[0]).getByRole("textbox", { name: "Description" }),
    ).toBeVisible();
    expect(
      within(cards()[1]).queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();

    await user.click(button("Remove train 3+1"));
    expect(
      within(cards()[0]).getByRole("button", { name: "2" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(cards()[0]).queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();
    expect(
      within(cards()[1]).getByRole("button", { name: "4D" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps working after the changes are reverted with the panel open", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Remove train 2"));
    expect(names(store)).toEqual(["3+1", "4D", "8E"]);

    act(() => store.dispatch(editGame(() => store.getState().gameOriginal)));
    await waitFor(() => expect(cards()).toHaveLength(4));
    const name = within(cards()[0]).getByRole("textbox", { name: "Name" });
    expect(name).toHaveValue("2");
    await user.clear(name);
    await user.type(name, "two{Enter}");
    expect(names(store)).toEqual(["two", "3+1", "4D", "8E"]);
  });

  it("an empty name shows it is required and keeps the old name", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const name = within(cards()[0]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.tab();

    expect(trains(store)[0].name).toBe("2");
    expect(await screen.findByText("This field is required.")).toBeVisible();
  });

  it("shows the problem of a train on its card", async () => {
    const { store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    act(() =>
      store.dispatch(
        editGame((game) => ({
          ...game,
          trains: game.trains.map(({ color, ...train }, index) =>
            index === 1 ? train : { color, ...train },
          ),
        })),
      ),
    );
    await waitFor(
      () =>
        expect(within(cards()[1]).getAllByRole("alert").length).toBeGreaterThan(
          0,
        ),
      { timeout: 5000 },
    );
    expect(within(cards()[0]).queryAllByRole("alert")).toHaveLength(0);
  });

  it("the live region says what changed", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    await user.click(button("Remove train 8E"));
    expect(status).toHaveTextContent("Removed train 8E");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(status).toHaveTextContent("Restored train 8E");
  });

  it("a card collapses", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const toggle = within(cards()[0]).getByRole("button", { name: "2" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      within(cards()[0]).getByRole("textbox", { name: "Name" }),
    ).not.toBeVisible();
  });
});

describe("edit panel market", () => {
  const marketRoute = `${route}?edit=true&editSection=market`;
  const stock = (store) => store.getState().game.stock;
  const market = (store) => stock(store).market;
  const grid = () => screen.findByRole("grid", { name: "Stock market cells" });
  const cell = (row, column) =>
    screen.getByRole("gridcell", {
      name: new RegExp(`^Row ${row}, column ${column}:`),
    });
  const cells = (index) =>
    within(
      within(screen.getByRole("grid")).getAllByRole("row")[index],
    ).queryAllByRole("gridcell");
  const inspector = () => screen.findByTestId("cell-inspector");
  const oneD = {
    ...games["1858"],
    stock: { ...games["1858"].stock, legend: undefined },
  };

  it("] and [ reach the Market tab and keep the panel", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await screen.findByRole("tab", { name: "Market" });
    await user.keyboard("]]");
    await waitFor(() =>
      expect(router.state.location.search).toBe(
        "?edit=true&editSection=market",
      ),
    );
    expect(await grid()).toBeVisible();
    expect(screen.getByRole("tab", { name: "Market" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
  });

  it("shows the rows and cells of the market, a triangle stays one", async () => {
    open(marketRoute);
    await grid();
    const rows = within(screen.getByRole("grid")).getAllByRole("row");
    expect(rows).toHaveLength(11);
    expect(
      rows.map((row) => within(row).queryAllByRole("gridcell").length),
    ).toEqual(games["18Test"].stock.market.map((row) => row.length));
    expect(cell(1, 1)).toHaveAccessibleName(
      "Row 1, column 1: 60, legend 0, down",
    );
    expect(cell(1, 7)).toHaveAccessibleName("Row 1, column 7: 100, par");
    expect(cell(1, 2)).toHaveAccessibleName("Row 1, column 2: 67");
    // The row number is the first column
    expect(cells(1)[0]).toHaveAttribute("aria-colindex", "2");
    expect(within(rows[0]).getByRole("rowheader")).toHaveAttribute(
      "aria-colindex",
      "1",
    );
    expect(screen.getByRole("grid")).toHaveAttribute(
      "aria-colcount",
      String(
        Math.max(...games["18Test"].stock.market.map((r) => r.length)) + 1,
      ),
    );
    expect(rows[2]).toHaveAttribute("aria-rowindex", "3");
    // Empty cells are not drawn past the end of a row
    expect(
      screen.queryByRole("gridcell", { name: /^Row 11, column 8:/ }),
    ).not.toBeInTheDocument();
  });

  it("colors a legend cell and a par cell and marks them without color", async () => {
    open(marketRoute);
    await grid();
    const plain = getComputedStyle(cell(1, 2)).backgroundColor;
    const legend = getComputedStyle(cell(1, 1)).backgroundColor;
    const par = getComputedStyle(cell(1, 7)).backgroundColor;
    expect(new Set([plain, legend, par]).size).toBe(3);
    expect(cell(1, 7)).toHaveTextContent("P");
    expect(cell(1, 1)).toHaveTextContent("60↓0");
    expect(cell(1, 1)).toHaveTextContent("↓");
  });

  it("selects with a click and the arrow keys and shows the cell", async () => {
    const { user } = open(marketRoute);
    await grid();
    expect(screen.queryByTestId("cell-inspector")).not.toBeInTheDocument();

    await user.click(cell(2, 4));
    expect(cell(2, 4)).toHaveAttribute("aria-selected", "true");
    expect(cell(2, 4)).toHaveAttribute("tabindex", "0");
    expect(cell(1, 1)).toHaveAttribute("tabindex", "-1");
    expect(within(await inspector()).getByRole("heading")).toHaveTextContent(
      "Row 2, column 4",
    );
    expect(
      within(await inspector()).getByRole("textbox", { name: "Value" }),
    ).toHaveValue("70");

    await user.keyboard("{ArrowRight}");
    expect(cell(2, 5)).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(cell(3, 5)).toHaveFocus();
    await user.keyboard("{ArrowUp}{ArrowLeft}");
    expect(cell(2, 4)).toHaveFocus();
    await user.keyboard("{End}");
    expect(cell(2, 19)).toHaveFocus();
    await user.keyboard("{Home}");
    expect(cell(2, 1)).toHaveFocus();
    // The last cell of a short row: down goes to the last cell of the next
    await user.click(cell(3, 16));
    await user.keyboard("{ArrowDown}");
    expect(cell(4, 13)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(cell(4, 13)).toHaveFocus();
  });

  it("edits the value of a cell in the game", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    expect(selectGameChanged(store.getState())).toBe(false);
    await user.click(cell(1, 2));
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    await user.clear(value);
    await user.type(value, "68{Enter}");

    // The shorthand stays: only a value
    expect(market(store)[0][1]).toBe(68);
    expect(cell(1, 2)).toHaveAccessibleName("Row 1, column 2: 68");
    expect(selectGameChanged(store.getState())).toBe(true);
  });

  it("promotes a number to an object with a second field and demotes it again", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    expect(
      within(await inspector()).getByText(/saved as 67 until/),
    ).toBeVisible();

    await user.click(
      within(await inspector()).getByRole("combobox", { name: "Par" }),
    );
    await user.click(await screen.findByRole("option", { name: "Yes" }));
    expect(market(store)[0][1]).toEqual({ value: 67, par: true });
    expect(screen.queryByText(/saved as/)).not.toBeInTheDocument();

    await user.click(
      within(await inspector()).getByRole("combobox", { name: "Par" }),
    );
    await user.click(await screen.findByRole("option", { name: "Not set" }));
    expect(market(store)[0][1]).toBe(67);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("a label on an empty cell is a string, a value and a label an object", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    act(() =>
      store.dispatch(
        editGame((g) => ({
          ...g,
          stock: {
            ...g.stock,
            market: [[null, "Close"], ...g.stock.market.slice(1)],
          },
        })),
      ),
    );
    await user.click(cell(1, 1));
    expect(within(await inspector()).getByText(/saved as null/)).toBeVisible();
    await user.type(
      within(await inspector()).getByRole("textbox", { name: "Label" }),
      "x{Enter}",
    );
    expect(market(store)[0][0]).toBe("x");

    await user.type(
      within(await inspector()).getByRole("textbox", { name: "Value" }),
      "9{Enter}",
    );
    expect(market(store)[0][0]).toEqual({ label: "x", value: 9 });
    await user.click(cell(1, 2));
    expect(
      within(await inspector()).getByText(/saved as "Close"/),
    ).toBeVisible();
  });

  it("sets and clears the arrows of a cell", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    await user.click(
      within(await inspector()).getByRole("button", { name: "More fields" }),
    );
    const arrows = within(await inspector()).getByRole("group", {
      name: "Arrows",
    });
    await user.click(within(arrows).getByRole("button", { name: "Up" }));
    expect(market(store)[0][1]).toEqual({ value: 67, arrow: "up" });
    await user.click(within(arrows).getByRole("button", { name: "Right" }));
    expect(market(store)[0][1].arrow).toEqual(["up", "right"]);
    await user.click(within(arrows).getByRole("button", { name: "Up" }));
    expect(market(store)[0][1].arrow).toBe("right");
    await user.click(within(arrows).getByRole("button", { name: "Right" }));
    expect(market(store)[0][1]).toBe(67);
  });

  it("Delete empties the cell, but not while typing in the inspector", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    await user.click(value);
    await user.keyboard("{Backspace}{Backspace}{Delete}{ArrowLeft}8");
    expect(value).toHaveValue("8");
    expect(market(store)[0][1]).toBe(67);
    await user.clear(value);
    await user.type(value, "67");
    expect(cell(1, 2)).toHaveAttribute("aria-selected", "true");

    act(() => cell(1, 2).focus());
    await user.keyboard("{Delete}");
    expect(market(store)[0][1]).toBeNull();
    expect(cell(1, 2)).toHaveAccessibleName("Row 1, column 2: empty");
  });

  it("a digit on a cell goes on in its value field", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    await inspector();
    act(() => cell(1, 2).focus());
    await user.keyboard("5");
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    expect(value).toHaveFocus();
    expect(value).toHaveValue("5");
    await user.keyboard("0{Enter}");
    expect(market(store)[0][1]).toBe(50);
  });

  it("adds, moves, duplicates and removes a row", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(2, 2));
    const before = structuredClone(market(store));

    await user.click(button("Add row above"));
    expect(market(store)).toHaveLength(12);
    expect(market(store)[1]).toEqual(Array(19).fill(null));
    expect(market(store)[2]).toEqual(before[1]);
    expect(cell(2, 2)).toHaveFocus();
    expect(screen.getByTestId("market-status")).toHaveTextContent(
      "Added row 2",
    );

    await user.click(button("Move row 2 down"));
    expect(market(store)[2]).toEqual(Array(19).fill(null));
    await user.click(button("Duplicate row 3"));
    expect(market(store)[3]).toEqual(market(store)[2]);
    await user.click(button("Remove row 4"));
    await user.click(cell(3, 1));
    await user.click(button("Remove row 3"));
    expect(market(store)).toHaveLength(11);
    expect(market(store)[1]).toEqual(before[1]);
    expect(market(store)[2]).toEqual(before[2]);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("removes a row and puts it back with undo", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(3, 2));
    await user.click(button("Remove row 3"));
    expect(market(store)).toHaveLength(10);
    expect(
      screen.getByText("Removed row 3", { selector: "span" }),
    ).toBeVisible();
    // The cell that took the place is selected
    expect(cell(3, 1)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(market(store)).toEqual(games["18Test"].stock.market);
    expect(selectGameChanged(store.getState())).toBe(false);
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
  });

  it("disables moving at the edges", async () => {
    const { user } = open(marketRoute);
    await grid();
    expect(button("Add row above")).toBeDisabled();
    await user.click(cell(1, 1));
    expect(button("Move row 1 up")).toBeDisabled();
    expect(button("Move column 1 left")).toBeDisabled();
    expect(button("Move row 1 down")).toBeEnabled();
    await user.click(cell(11, 7));
    expect(button("Move row 11 down")).toBeDisabled();
  });

  it("adds, moves, duplicates and removes a column, the triangle stays one", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    const lengths = () => market(store).map((row) => row.length);
    const before = lengths();

    await user.click(button("Add column to the right"));
    // Rows with at least 3 cells get one
    expect(lengths()).toEqual(before.map((n) => (n >= 2 ? n + 1 : n)));
    expect(market(store)[0][2]).toBeNull();
    await user.click(button("Duplicate column 3"));
    expect(market(store)[0][3]).toBeNull();
    await user.click(button("Move column 4 left"));
    await user.click(button("Remove column 3"));
    await user.click(button("Remove column 3"));
    expect(market(store)).toEqual(games["18Test"].stock.market);
  });

  it("removes the last column and the last row, the market stays", async () => {
    const { user, store } = open(marketRoute, {
      ...games["18Test"],
      stock: { ...games["18Test"].stock, market: [[5]] },
    });
    await grid();
    await user.click(cell(1, 1));
    await user.click(button("Remove column 1"));
    expect(market(store)).toEqual([[]]);
    expect(stock(store).type).toBe("2D");
    expect(await screen.findByText("The market has no cells.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(market(store)).toEqual([[5]]);
  });

  it("shows a market of one row for 1D, with column actions only", async () => {
    const { user, store } = open(marketRoute, oneD);
    await grid();
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      1,
    );
    await user.click(screen.getAllByRole("gridcell")[3]);
    expect(
      screen.queryByRole("group", { name: "Row" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Column" })).toBeVisible();
    expect(screen.getByRole("gridcell", { name: /^Cell 4:/ })).toBeVisible();
    const count = market(store).length;
    await user.click(button("Add column to the left"));
    expect(market(store)).toHaveLength(count + 1);
    expect(market(store)[3]).toBeNull();
    await user.keyboard("{ArrowDown}");
  });

  it("draws a 1Diag market in two rows, a column is two cells", async () => {
    const diag = {
      ...games["18Test"],
      stock: { type: "1Diag", market: [1, 2, 3, 4, 5] },
    };
    const { user, store } = open(marketRoute, diag);
    await grid();
    const rows = within(screen.getByRole("grid")).getAllByRole("row");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getAllByRole("gridcell")).toHaveLength(3);
    expect(within(rows[1]).getAllByRole("gridcell")).toHaveLength(2);
    expect(screen.getByText(/two rows: the even cells on top/)).toBeVisible();

    const diagCell = (name) =>
      screen.getByRole("gridcell", { name: new RegExp(`^${name}:`) });
    await user.click(diagCell("Column 1, bottom"));
    await user.keyboard("{ArrowRight}");
    expect(diagCell("Column 2, bottom")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(diagCell("Column 2, top")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(diagCell("Column 2, bottom")).toHaveFocus();
    // The inspector names the cell as the grid does
    expect(await inspector()).toHaveTextContent("Column 2, bottom");

    await user.click(button("Add column to the left"));
    expect(market(store)).toEqual(
      [1, 2, 3, 4, 5].flatMap((n, i) => (i === 2 ? [null, null, n] : [n])),
    );
    await user.click(button("Remove column 2"));
    expect(market(store)).toEqual([1, 2, 3, 4, 5]);
  });

  it("adds, duplicates and moves the half full last column of a 1Diag market", async () => {
    const diag = {
      ...games["18Test"],
      stock: { type: "1Diag", market: [1, 2, 3, 4, 5] },
    };
    const { user, store } = open(marketRoute, diag);
    await grid();
    await user.click(screen.getByRole("gridcell", { name: /^Column 3, top:/ }));
    await user.click(button("Add column to the right"));
    expect(market(store)).toEqual([1, 2, 3, 4, 5, null, null, null]);
    await user.click(button("Remove column 4"));
    await user.click(screen.getByRole("gridcell", { name: /^Column 3, top:/ }));
    await user.click(button("Duplicate column 3"));
    expect(market(store)).toEqual([1, 2, 3, 4, 5, null, 5, null]);
    await user.click(button("Remove column 4"));
    await user.click(button("Move column 3 left"));
    expect(market(store)).toEqual([1, 2, 5, null, 3, 4]);
  });

  it("removing a column that empties rows drops them, undo brings them back", async () => {
    const { user, store } = open(marketRoute, {
      ...games["18Test"],
      stock: { ...games["18Test"].stock, market: [[1, 2], [3], [4, 5]] },
    });
    await grid();
    await user.click(cell(1, 1));
    await user.click(button("Remove column 1"));
    expect(market(store)).toEqual([[2], [5]]);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(market(store)).toEqual([[1, 2], [3], [4, 5]]);
  });

  it("forgets the undo of a removed row when the type changes", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(3, 1));
    await user.click(button("Remove row 3"));
    expect(
      screen.getByText("Removed row 3", { selector: "span" }),
    ).toBeVisible();
    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "1Diag" }));
    expect(
      screen.queryByText("Removed row 3", { selector: "span" }),
    ).not.toBeInTheDocument();
    expect(stock(store).type).toBe("1Diag");
  });

  it("forgets the note of the rows a type change dropped at the next edit", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "1D" }));
    expect(
      await screen.findByText("10 rows were removed from the market."),
    ).toBeVisible();
    await user.click(screen.getByRole("gridcell", { name: /^Cell 2:/ }));
    await user.keyboard("{Delete}");
    expect(market(store)[1]).toBeNull();
    await waitFor(() =>
      expect(
        screen.queryByText("10 rows were removed from the market."),
      ).not.toBeInTheDocument(),
    );
  });

  it("changes the type, warns when rows are dropped and undoes it", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    const changes = [];
    store.subscribe(() => changes.push(stock(store).type));

    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "1D" }));
    expect(stock(store).type).toBe("1D");
    expect(market(store)).toEqual(games["18Test"].stock.market[0]);
    expect(stock(store).legend).toEqual(games["18Test"].stock.legend);
    expect(
      await screen.findByText("10 rows were removed from the market."),
    ).toBeVisible();
    expect(within(screen.getByRole("grid")).getAllByRole("row")).toHaveLength(
      1,
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(stock(store).type).toBe("2D");
    expect(market(store)).toEqual(games["18Test"].stock.market);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("a flat market becomes the row of a 2D market, in one edit", async () => {
    const { user, store } = open(marketRoute, oneD);
    await grid();
    let edits = 0;
    store.subscribe(() => edits++);
    await user.click(screen.getByRole("combobox", { name: /Type/ }));
    await user.click(await screen.findByRole("option", { name: "2D" }));
    expect(market(store)).toEqual([oneD.stock.market]);
    expect(edits).toBe(1);
    expect(
      screen.queryByText(/rows? w(as|ere) removed/),
    ).not.toBeInTheDocument();
  });

  it("shows the problems of a cell on the cell and its field", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    act(() =>
      store.dispatch(
        editGame((g) => ({
          ...g,
          stock: {
            ...g.stock,
            market: [
              [
                { value: 60, legend: -1, par: "yes" },
                ...g.stock.market[0].slice(1),
              ],
              ...g.stock.market.slice(1),
            ],
          },
        })),
      ),
    );
    await waitFor(() =>
      expect(cell(1, 1)).toHaveAccessibleName(/has a problem/),
    );
    await user.click(cell(1, 1));
    const fields = await inspector();
    await waitFor(() =>
      expect(within(fields).getAllByRole("alert").length).toBeGreaterThan(0),
    );
    expect(
      selectGameProblems(store.getState(), "internal:abc").some((i) =>
        i.pointer.startsWith("stock.market[0][0]"),
      ),
    ).toBe(true);
  });

  it("warns about a legend number and a par without a chart, outside the problems", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await settled();
    const before = selectGameProblems(store.getState(), "internal:abc");
    act(() =>
      store.dispatch(
        editGame((g) => ({
          ...g,
          stock: {
            ...g.stock,
            par: undefined,
            market: [
              [
                { value: 60, legend: 9, par: true },
                ...g.stock.market[0].slice(1),
              ],
              ...g.stock.market.slice(1),
            ],
          },
        })),
      ),
    );
    await user.click(cell(1, 1));
    expect(
      await screen.findByText("The legend has no entry 9 (the first is 0)."),
    ).toBeVisible();
    expect(
      screen.getByText(
        "This cell is a par value, but the market has no par chart.",
      ),
    ).toBeVisible();
    await settled();
    expect(selectGameProblems(store.getState(), "internal:abc")).toEqual(
      before,
    );
  });

  it("warns when a legend entry that cells use is moved or removed", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    const used = (legend) =>
      within(screen.getByRole("grid"))
        .getAllByRole("gridcell")
        .filter((c) =>
          c.getAttribute("aria-label").includes(`legend ${legend}`),
        ).length;
    expect(used(1)).toBeGreaterThan(0);

    await user.click(
      screen.getAllByRole("button", { name: /^Move legend entry .* down$/ })[0],
    );
    expect(store.getState().game.stock.legend[1].color).toBe("yellow");
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      /cells? uses? a legend number that now means another entry/,
    );

    await user.click(
      screen.getAllByRole("button", { name: /^Remove legend entry / })[2],
    );
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      /cells? uses? a legend number/,
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByTestId("list-warning")).not.toBeInTheDocument();
  });

  it("a new legend entry has its description, and is a legend entry", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    await user.click(screen.getByRole("button", { name: "Add legend entry" }));
    expect(stock(store).legend).toHaveLength(4);
    expect(stock(store).legend[3]).toEqual({ description: "New entry" });
    await user.click(
      screen.getByRole("button", { name: "Duplicate legend entry New entry" }),
    );
    expect(stock(store).legend[4]).toEqual({ description: "New entry" });
  });

  it("warns when duplicating a legend entry moves the ones after it", async () => {
    const { user } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Legend" }));
    await user.click(
      screen.getAllByRole("button", { name: /^Duplicate legend entry / })[0],
    );
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      /cells? uses? a legend number that now means another entry/,
    );
  });

  it("edits the cell defaults", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Cell defaults" }));
    await user.type(await field("Color"), "blue{Enter}");
    expect(stock(store).cell).toEqual({ color: "blue" });
    await user.clear(await field("Color"));
    await user.tab();
    expect("cell" in stock(store)).toBe(false);
  });

  it("edits the movement and never the place it is drawn", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Movement" }));
    const up = screen.getByRole("textbox", { name: "Up" });
    expect(up).toHaveValue("Sold out");
    await user.clear(up);
    await user.type(up, "First{Enter}Second");
    await user.tab();
    expect(stock(store).movement.up).toEqual(["First", "Second"]);
    expect(stock(store).display).toEqual(games["18Test"].stock.display);

    await user.type(screen.getByRole("textbox", { name: "New key" }), "3x");
    await user.type(
      screen.getByRole("textbox", { name: "Text" }),
      "Far{Enter}",
    );
    expect(stock(store).movement["3x"]).toEqual(["Far"]);
    await user.clear(screen.getByRole("textbox", { name: "3x" }));
    await user.tab();
    expect("3x" in stock(store).movement).toBe(false);
    expect(stock(store).display).toEqual(games["18Test"].stock.display);
  });

  it("does not add a movement key that is there, it would replace its texts", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: "Movement" }));
    await user.type(screen.getByRole("textbox", { name: "New key" }), "up");
    await user.type(screen.getByRole("textbox", { name: "Text" }), "Other");
    expect(screen.getByRole("button", { name: "Add key" })).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Text" }), "{Enter}");
    expect(stock(store).movement.up).toEqual(["Sold out"]);
  });

  it("keeps ledges, limits and display as JSON", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(screen.getByRole("button", { name: /^Advanced/ }));
    const display = screen.getByRole("textbox", { name: "Display" });
    expect(JSON.parse(display.value)).toEqual(games["18Test"].stock.display);
    await user.clear(screen.getByRole("textbox", { name: "Limits" }));
    await user.type(screen.getByRole("textbox", { name: "Limits" }), "[[]");
    await user.tab();
    expect(stock(store).limits).toEqual([]);
  });

  it("an empty market renders the panel and the market page, without leaving", async () => {
    const { user, router, store } = open(
      `${route.replace("map", "market")}?edit=true&editSection=market`,
    );
    await grid();
    for (const [index] of market(store).entries()) {
      void index;
    }
    act(() =>
      store.dispatch(
        editGame((g) => ({ ...g, stock: { ...g.stock, market: [] } })),
      ),
    );
    expect(await screen.findByText("The market has no cells.")).toBeVisible();
    expect(router.state.location.pathname).toContain("/market");
    await user.click(screen.getByRole("button", { name: "Add row" }));
    expect(market(store)).toEqual([[null]]);
    expect(screen.getByRole("gridcell", { name: /empty/ })).toBeVisible();
  });

  it("a game without a stock market can create one", async () => {
    const { user, store } = open(marketRoute, omit(["stock"], games["18Test"]));
    expect(
      await screen.findByText("This game has no stock market yet."),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Create a market" }));
    expect(stock(store)).toEqual({
      type: "2D",
      market: Array.from({ length: 3 }, () => [null, null, null]),
    });
    expect(await grid()).toBeVisible();
  });

  it("edits the right cell after a row was moved", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    await user.click(button("Move row 1 down"));
    expect(cell(2, 2)).toHaveAttribute("aria-selected", "true");
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    expect(value).toHaveValue("67");
    await user.clear(value);
    await user.type(value, "77{Enter}");
    expect(market(store)[1][1]).toBe(77);
    expect(market(store)[0][1]).toEqual(games["18Test"].stock.market[1][1]);
  });

  it("keeps what is typed in a field when another cell is picked", async () => {
    const { user, store } = open(marketRoute);
    await grid();
    await user.click(cell(1, 2));
    const value = within(await inspector()).getByRole("textbox", {
      name: "Value",
    });
    await user.clear(value);
    await user.type(value, "99");
    await user.click(cell(1, 3));
    expect(market(store)[0][1]).toBe(99);
    expect(market(store)[0][2]).toBe(71);
  });
});
