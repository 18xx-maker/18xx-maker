import { screen, waitFor, within } from "@testing-library/react";

import { omit } from "ramda";

import games from "@/data/games";

import { renderApp } from "@tests/support/helpers.jsx";

// The Tiles tab: the tiles of the game, added, renamed, copied, customized and
// removed, and the editor of the one picked. Everything is read back from the
// game.

let opened;

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

const open = (route, mutate = (game) => game) => {
  const game = mutate({
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  });
  const view = renderApp(route, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
  });
  opened = view.store;
  return view;
};

const route = "/games/internal:abc/tiles?edit=true&editSection=tiles";
const tiles = () => opened.getState().game.tiles;
const privates = () => opened.getState().game.privates;
const list = () => screen.findByRole("list", { name: "Tiles of the game" });
const tile = (id) =>
  screen.getByRole("button", {
    name: new RegExp(`^${id.replace("|", "\\|")} `),
  });
const editor = () => screen.findByTestId("tile-editor");

describe("the tiles list", () => {
  it("lists the tiles of the game, in the order of the game", async () => {
    open(route);
    const items = within(await list()).getAllByRole("listitem");
    expect(items.map((li) => li.textContent.split(" ")[0])).toEqual(
      Object.keys(tiles()),
    );
    expect(screen.getByText("Pick a tile to edit it.")).toBeVisible();
  });

  it("picks a tile into the url, even one with a variant", async () => {
    const { user, router } = open(route);
    await list();
    await user.click(tile("26|T2"));
    expect(router.state.location.search).toContain("tile=26%257CT2");
    expect(await editor()).toHaveAccessibleName("Tile 26|T2");
    await user.click(tile("26|T2"));
    expect(router.state.location.search).not.toContain("tile=");
  });

  it("opens on the tile in the link", async () => {
    open(`${route}&tile=T1`);
    expect(await editor()).toHaveAccessibleName("Tile T1");
    expect(screen.getByText("your own tile")).toBeVisible();
  });
});

describe("adding", () => {
  it("adds a library tile as its quantity and picks it", async () => {
    const { user } = open(route);
    await list();
    await user.type(
      screen.getByRole("textbox", { name: "New tile id" }),
      "57{Enter}",
    );
    await waitFor(() => expect(tiles()["57"]).toBe(1));
    expect(await editor()).toHaveAccessibleName("Tile 57");
  });

  it("starts a tile of your own for an id the library does not have", async () => {
    const { user } = open(route);
    await list();
    await user.type(screen.getByRole("textbox", { name: "New tile id" }), "Z9");
    await user.click(screen.getByRole("button", { name: "Add tile" }));
    await waitFor(() =>
      expect(tiles().Z9).toEqual({ color: "yellow", quantity: 1 }),
    );
    expect(await screen.findByTestId("hex-editor")).toBeVisible();
  });

  it("says why an id is not added", async () => {
    const { user } = open(route);
    await list();
    const before = opened.getState().game;
    await user.click(screen.getByRole("button", { name: "Add tile" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a tile id.",
    );
    await user.type(
      screen.getByRole("textbox", { name: "New tile id" }),
      "T1{Enter}",
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "already exists",
    );
    expect(opened.getState().game).toBe(before);
  });

  it("offers the first tile of a game that has none", async () => {
    const { user } = open(route, (game) => omit(["tiles"], game));
    expect(await screen.findByText(/has no tiles yet/)).toBeVisible();
    await user.type(
      screen.getByRole("textbox", { name: "New tile id" }),
      "T1{Enter}",
    );
    await waitFor(() =>
      expect(tiles()).toEqual({ T1: { color: "yellow", quantity: 1 } }),
    );
  });
});

describe("renaming", () => {
  it("renames a tile where it is and the privates that draw it", async () => {
    const { user, router } = open(`${route}&tile=T1`);
    const section = await editor();
    expect(within(section).getByRole("note")).toHaveTextContent(
      "1 private draws this tile",
    );
    const order = Object.keys(tiles());
    const id = within(section).getByRole("textbox", { name: "Tile id" });
    await user.clear(id);
    await user.type(id, "T9{Enter}");
    await waitFor(() => expect(tiles().T9).toBeDefined());
    expect(Object.keys(tiles())).toEqual(
      order.map((key) => (key === "T1" ? "T9" : key)),
    );
    expect(privates().find((p) => p.tile === "T9")).toBeTruthy();
    expect(privates().some((p) => p.tile === "T1")).toBe(false);
    // The selection follows
    expect(router.state.location.search).toContain("tile=T9");
    expect(await editor()).toHaveAccessibleName("Tile T9");
  });

  it("refuses an id another tile has and one that changes a library tile", async () => {
    const { user } = open(`${route}&tile=T1`);
    const section = await editor();
    const before = opened.getState().game;
    const id = within(section).getByRole("textbox", { name: "Tile id" });
    await user.clear(id);
    await user.type(id, "B1{Enter}");
    expect(await within(section).findByRole("alert")).toHaveTextContent(
      "already exists",
    );

    await user.click(tile("63"));
    const library = await editor();
    const lid = within(library).getByRole("textbox", { name: "Tile id" });
    await user.clear(lid);
    await user.type(lid, "T7{Enter}");
    expect(await within(library).findByRole("alert")).toHaveTextContent(
      "only the part after |",
    );
    expect(opened.getState().game).toBe(before);
  });
});

describe("copying and removing", () => {
  it("copies a tile right after the original and picks the copy", async () => {
    const { user } = open(`${route}&tile=B1`);
    const section = await editor();
    await user.click(
      within(section).getByRole("button", { name: "Copy tile" }),
    );
    await waitFor(() => expect(tiles()["B1-copy"]).toEqual(tiles().B1));
    const keys = Object.keys(tiles());
    expect(keys.indexOf("B1-copy")).toBe(keys.indexOf("B1") + 1);
    expect(await editor()).toHaveAccessibleName("Tile B1-copy");
  });

  it("removes a tile and lets go of it", async () => {
    const { user, router } = open(`${route}&tile=B3`);
    const section = await editor();
    await user.click(
      within(section).getByRole("button", { name: "Remove tile" }),
    );
    await waitFor(() => expect(tiles().B3).toBeUndefined());
    expect(screen.queryByTestId("tile-editor")).not.toBeInTheDocument();
    expect(router.state.location.search).not.toContain("tile=");
  });

  it("removes tiles from the game with the last one", async () => {
    const { user } = open(route, (game) => ({ ...game, tiles: { T1: 1 } }));
    await list();
    await user.click(tile("T1"));
    await user.click(
      within(await editor()).getByRole("button", { name: "Remove tile" }),
    );
    await waitFor(() => expect(opened.getState().game.tiles).toBeUndefined());
    expect(await screen.findByText(/has no tiles yet/)).toBeVisible();
  });
});

describe("the shapes of an entry", () => {
  it("keeps a quantity an integer while only the quantity changes", async () => {
    const { user } = open(`${route}&tile=1`);
    const section = await editor();
    expect(screen.queryByTestId("hex-inspector")).not.toBeInTheDocument();
    // A library tile is only drawn
    expect(within(section).getByText(/never edited/)).toBeVisible();
    const quantity = within(section).getByRole("textbox", { name: "Quantity" });
    await user.clear(quantity);
    await user.type(quantity, "4");
    await user.tab();
    await waitFor(() => expect(tiles()["1"]).toBe(4));
  });

  it("makes a quantity an object when the change needs one", async () => {
    const { user } = open(`${route}&tile=1`);
    const section = await editor();
    const print = within(section).getByRole("spinbutton", { name: "Print" });
    await user.type(print, "2");
    await user.tab();
    await waitFor(() =>
      expect(tiles()["1"]).toEqual({ quantity: 1, print: 2 }),
    );
  });

  it("edits an alias and leaves the tile it is an alias of", async () => {
    const { user } = open(`${route}&tile=2`);
    const section = await editor();
    expect(within(section).getByText("alias of 57")).toBeVisible();
    const quantity = within(section).getByRole("textbox", { name: "Quantity" });
    await user.clear(quantity);
    await user.type(quantity, "3");
    await user.tab();
    await waitFor(() =>
      expect(tiles()["2"]).toEqual({ tile: "57", quantity: 3 }),
    );
  });

  it("keeps an override an override", async () => {
    const { user } = open(`${route}&tile=63`);
    const section = await editor();
    const quantity = within(section).getByRole("textbox", { name: "Quantity" });
    await user.clear(quantity);
    await user.type(quantity, "5");
    await user.tab();
    await waitFor(() =>
      expect(tiles()["63"]).toEqual({ quantity: 5, group: "spare" }),
    );
  });

  it("customizes a library tile into a definition of the game, in place", async () => {
    const { user } = open(`${route}&tile=1`);
    const section = await editor();
    const order = Object.keys(tiles());
    await user.click(
      within(section).getByRole("button", { name: "Customize" }),
    );
    await waitFor(() => expect(tiles()["1"].color).toBeTruthy());
    expect(tiles()["1"].quantity).toBe(1);
    expect(tiles()["1"].id).toBeUndefined();
    expect(Object.keys(tiles())).toEqual(order);
    expect(await screen.findByTestId("hex-editor")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Customize" }),
    ).not.toBeInTheDocument();
  });

  it("edits a tile of your own with the hex editor, without half", async () => {
    const { user } = open(`${route}&tile=B1`);
    const hexEditor = await screen.findByTestId("hex-editor");
    expect(within(hexEditor).queryByText("Half")).not.toBeInTheDocument();
    expect(
      within(hexEditor).getByRole("group", { name: "Printing" }),
    ).toBeVisible();
    const quantity = within(hexEditor).getByRole("textbox", {
      name: "Quantity",
    });
    await user.clear(quantity);
    await user.type(quantity, "6");
    await user.tab();
    await waitFor(() => expect(tiles().B1.quantity).toBe(6));
    // The rest of the tile is as it was
    expect(tiles().B1.track).toEqual(games["18Test"].tiles.B1.track);
  });
});
