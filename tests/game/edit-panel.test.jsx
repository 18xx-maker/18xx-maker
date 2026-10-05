import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

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

    // e elsewhere in the page toggles it
    await user.click(
      screen.getByRole("button", { name: "Close the edit panel" }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
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

  it("keeps the panel for [ and ], drops it for a number", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");
    await user.keyboard("e");
    await panel();

    await user.keyboard("]");
    await waitFor(() => expect(router.state.location.pathname).not.toBe(route));
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
