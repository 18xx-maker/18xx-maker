/* eslint-disable testing-library/no-node-access */
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { omit } from "ramda";

import games from "@/data/games";
import { editGame } from "@/state";

import { renderApp } from "@tests/support/helpers.jsx";

// The tile sheet in the editor: a tap on a tile picks it on the Tiles tab, a
// tap on the dashed cell after the last tile adds one.

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

const route = "/games/internal:abc/tiles";
const editRoute = `${route}?edit=true&editSection=json`;
const tiles = () => opened.getState().game.tiles;
const params = (router) =>
  Object.fromEntries(new URLSearchParams(router.state.location.search));
const targets = (id) =>
  [...document.querySelectorAll("[data-tile]")].filter(
    (el) => id === undefined || el.dataset.tile === id,
  );
const next = () => document.querySelector("[data-next]");
const pages = () => document.querySelectorAll(".TileSheet--Page");
const marks = () =>
  [...document.querySelectorAll('[data-testid="tile-selected"]')].map((el) =>
    el.getAttribute("data-selected"),
  );

const down = { pointerId: 7, button: 0, buttons: 1, bubbles: true };
const at = (x, y) => ({ clientX: x, clientY: y });
const tap = (el, x = 100, y = 100) => {
  const view = document.getElementById("editor");
  fireEvent.pointerDown(el, { ...down, ...at(x, y) });
  fireEvent.pointerUp(view, { ...down, buttons: 0, ...at(x + 1, y) });
};

describe("tile sheet overlay", () => {
  it("is only there while the edit panel is open", async () => {
    const view = open(route);
    await screen.findByTestId("game-internal:abc-tiles");
    expect(screen.queryByTestId("tiles-overlay")).not.toBeInTheDocument();
    expect(next()).toBeNull();
    view.unmount();

    open(`${route}?edit=true&print=true`);
    await screen.findByTestId("game-internal:abc-tiles");
    expect(screen.queryByTestId("tiles-overlay")).not.toBeInTheDocument();
  });

  it("has a target for every printed tile and one cell after the last", async () => {
    open(editRoute);
    await screen.findAllByTestId("tiles-overlay");
    expect(targets().length).toBeGreaterThan(10);
    expect(document.querySelectorAll("[data-next]")).toHaveLength(1);
    expect(screen.getAllByTestId("tiles-overlay")[0]).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("selects the tile on the Tiles tab and drops the lines of the json tab", async () => {
    const { router } = open(`${editRoute}&lines=1-2`);
    await screen.findAllByTestId("tiles-overlay");
    const [first] = targets();
    const id = first.dataset.tile;

    tap(first);
    await waitFor(() =>
      expect(params(router).tile).toBe(encodeURIComponent(id)),
    );
    expect(params(router).editSection).toBe("tiles");
    expect(params(router).lines).toBeUndefined();
    expect(await screen.findByTestId("tile-editor")).toBeVisible();
  });

  it("keeps the encoding of an id with a variant and outlines every copy", async () => {
    const { router } = open(editRoute, (game) => ({
      ...game,
      tiles: { ...game.tiles, "26|T2": 3 },
    }));
    await screen.findAllByTestId("tiles-overlay");
    const copies = targets("26|T2");
    expect(copies).toHaveLength(3);

    tap(copies[0]);
    await waitFor(() => expect(params(router).tile).toBe("26%7CT2"));
    await waitFor(() => expect(marks()).toEqual(["26|T2", "26|T2", "26|T2"]));
  });

  it("is not a tap when the pointer was dragged", async () => {
    const { router } = open(editRoute);
    await screen.findAllByTestId("tiles-overlay");
    const view = document.getElementById("editor");

    fireEvent.pointerDown(targets()[0], { ...down, ...at(100, 100) });
    fireEvent.pointerMove(view, { ...down, ...at(140, 100) });
    fireEvent.pointerUp(view, { ...down, buttons: 0, ...at(140, 100) });
    expect(params(router).tile).toBeUndefined();
  });

  it("adds a tile from the cell after the last tile and selects it", async () => {
    // 18Test has T1: the first free id is the next one
    const { router } = open(editRoute, (game) => ({
      ...game,
      tiles: omit(["T1"], game.tiles),
    }));
    await screen.findAllByTestId("tiles-overlay");
    const before = Object.keys(tiles());
    expect(before).not.toContain("T1");

    tap(next());
    await waitFor(() => expect(params(router).tile).toBe("T1"));
    expect(Object.keys(tiles())).toEqual([...before, "T1"]);
    expect(tiles().T1).toEqual({ color: "yellow", quantity: 1 });
    expect(params(router).editSection).toBe("tiles");
    await waitFor(() => expect(marks()).toEqual(["T1"]));

    // The cell is still there for the next one
    tap(next());
    await waitFor(() => expect(params(router).tile).toBe("T2"));
    expect(tiles().T2).toEqual({ color: "yellow", quantity: 1 });
  });

  it("adds a tile from any empty cell of the sheet and reveals it", async () => {
    const { router } = open(editRoute);
    await screen.findAllByTestId("tiles-overlay");
    const empty = document.querySelectorAll("[data-empty]");
    expect(empty.length).toBeGreaterThan(0);
    const before = Object.keys(tiles()).length;

    const revealed = [];
    document.addEventListener("reveal", (event) =>
      revealed.push(event.target.dataset.tile),
    );
    tap(empty[empty.length - 1]);
    await waitFor(() => expect(params(router).tile).toBe("T2"));
    expect(Object.keys(tiles())).toHaveLength(before + 1);
    await waitFor(() => expect(revealed).toEqual(["T2"]));
  });

  it("shows the hover outline on an empty cell", async () => {
    open(editRoute);
    await screen.findAllByTestId("tiles-overlay");
    fireEvent.pointerEnter(document.querySelector("[data-empty]"));
    expect(await screen.findByTestId("tile-hover")).toBeInTheDocument();
  });

  it("clears the hover outline of the last tile on the next cell", async () => {
    open(editRoute);
    await screen.findAllByTestId("tiles-overlay");
    const last = targets().at(-1);
    fireEvent.pointerEnter(last);
    await screen.findByTestId("tile-hover");

    fireEvent.pointerEnter(next());
    await waitFor(() =>
      expect(screen.queryByTestId("tile-hover")).not.toBeInTheDocument(),
    );
  });

  it("adds no cell to a game without tiles", async () => {
    open(editRoute, (game) => omit(["tiles"], game));
    await screen.findByTestId("game-internal:abc-tiles");
    expect(next()).toBeNull();
  });

  it("puts the cell on a page of its own when the last page is full", async () => {
    const first = open(editRoute, (game) => ({ ...game, tiles: { 1: 200 } }));
    await screen.findAllByTestId("tiles-overlay");
    const perPage = pages()[0].querySelectorAll("[data-tile]").length;
    expect(perPage).toBeGreaterThan(1);
    first.unmount();

    const second = open(editRoute, (game) => ({
      ...game,
      tiles: { 1: perPage },
    }));
    await screen.findAllByTestId("tiles-overlay");
    expect(pages()).toHaveLength(2);
    expect(pages()[0].querySelector("[data-next]")).toBeNull();
    expect(pages()[1].querySelector("[data-next]")).toBeTruthy();
    expect(pages()[1].querySelectorAll("[data-tile]")).toHaveLength(0);
    // It is no page of the print
    expect(pages()[1]).not.toHaveTextContent("page");
    expect(pages()[0]).toHaveTextContent("page 1 of 1");
    second.unmount();

    // The extra page is only for the editor, never for the print
    open(`${editRoute}&print=true`, (game) => ({
      ...game,
      tiles: { 1: perPage },
    }));
    await screen.findByTestId("game-internal:abc-tiles");
    expect(pages()).toHaveLength(1);
    expect(next()).toBeNull();
  });

  it("works on a page after the tiles of the first page changed", async () => {
    const { router } = open(editRoute, (game) => ({
      ...game,
      tiles: { 1: 60, 2: 60 },
    }));
    await screen.findAllByTestId("tiles-overlay");
    expect(pages().length).toBeGreaterThan(1);

    const [first] = targets("1");
    tap(first);
    await waitFor(() => expect(params(router).tile).toBe("1"));

    // The sheet is drawn again, the tap still goes to the right tile
    act(() => {
      opened.dispatch(
        editGame((game) => ({ ...game, tiles: { 1: 30, 2: 60 } })),
      );
    });
    tap(targets("2").at(-1));
    await waitFor(() => expect(params(router).tile).toBe("2"));
  });
});
