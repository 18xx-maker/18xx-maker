import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import { omit } from "ramda";

import games from "@/data/games";
import { editGame } from "@/state";
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

const open = (route) => {
  const game = {
    ...structuredClone(games["18Test"]),
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
    expect(info).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(trainsTab).toHaveFocus();
    await user.keyboard("{Home}");
    expect(info).toHaveFocus();
    await user.keyboard("{End}");
    expect(trainsTab).toHaveFocus();
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
      expect(router.state.location.search).toBe("?edit=true"),
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
