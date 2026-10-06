/* eslint-disable testing-library/no-node-access */
import { EditorView } from "@codemirror/view";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import games from "@/data/games";

import { renderApp } from "@tests/support/helpers.jsx";

let opened;

// An edit starts the check of the game in the background: let it end inside
// the test
const settled = () =>
  waitFor(() => {
    if (opened.getState().gameProblems.status === "running") {
      throw new Error("still checking the game");
    }
  });

afterEach(async () => {
  if (opened) await settled();
  opened = undefined;
  vi.restoreAllMocks();
  style?.remove();
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let style;

beforeEach(async () => {
  // The editor applies typing after a pause, outside of any act
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  await browser.viewport(1280, 900);
  // The test page has no stylesheet: the panel would be above the map in the
  // page and push it out of the window. Put it in a corner, out of the way of
  // the hexes the tests use.
  style = document.createElement("style");
  style.textContent =
    "[data-edit-panel]{position:fixed;right:0;bottom:0;width:200px;height:100px;overflow:auto;z-index:50;background:white}";
  document.head.append(style);
});

const open = (route, source = games["18Test"]) => {
  const game = {
    ...structuredClone(source),
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
const editRoute = `${route}?edit=true`;
const cell = (coord) => document.querySelector(`[data-coord="${coord}"]`);
// The cell is there and has stopped moving: the view fits the window after the
// first render and again when the window is resized
const waitForCell = async (coord) => {
  let last;
  await waitFor(async () => {
    const box = cell(coord)?.getBoundingClientRect();
    const now = box && JSON.stringify(box);
    const same = now !== undefined && now === last;
    last = now;
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (!same) throw new Error("the map is still moving");
  });
};
const hexes = () => opened.getState().game.map.hexes;
const groupOf = (coord) => hexes().find((group) => group.hexes.includes(coord));
const svg = () => document.querySelector("svg.printElement");
const marks = () =>
  [...document.querySelectorAll('[data-testid="hex-selected"]')].map((el) =>
    el.getAttribute("data-selected"),
  );

const editor = async () => {
  const host = await screen.findByTestId("json-editor");
  return waitFor(() => {
    const found = EditorView.findFromDOM(host);
    if (!found) throw new Error("no editor yet");
    return found;
  });
};
const editorGroup = async () =>
  JSON.parse((await editor()).state.doc.toString());

const asMac = (mac) =>
  vi
    .spyOn(navigator, "platform", "get")
    .mockReturnValue(mac ? "MacIntel" : "Linux x86_64");
const params = (router) =>
  Object.fromEntries(new URLSearchParams(router.state.location.search));

// Selects a group with a click. The editor opens below the map in these tests
// (they have no stylesheet), which resizes the window: wait for it, so the
// next click is not at a position that has moved.
const pick = async (router, coord, anchor = coord) => {
  await waitForCell(coord);
  await realUser.click(cell(coord));
  await waitFor(() => expect(params(router).hex).toBe(anchor));
  await editor();
};
const modifier = (mac) => (mac ? "Meta" : "Control");

describe("hex editor overlay", () => {
  it("only exists while the edit panel is open", async () => {
    const { user } = open(route);
    await screen.findByTestId("game-internal:abc-map");
    expect(screen.queryByTestId("hex-overlay")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    const overlay = await screen.findByTestId("hex-overlay");
    // A pointer layer: nothing for a screen reader
    expect(overlay).toHaveAttribute("aria-hidden", "true");

    await user.click(
      await screen.findByRole("button", { name: "Close the edit panel" }),
    );
    await waitFor(() =>
      expect(screen.queryByTestId("hex-overlay")).not.toBeInTheDocument(),
    );
  });

  it("is not on the paginated map or the print page", async () => {
    const paginated = open(`${editRoute}&paginated=true`);
    await screen.findByTestId("edit-panel");
    expect(screen.queryByTestId("hex-overlay")).not.toBeInTheDocument();
    paginated.unmount();

    open(`${editRoute}&print=true`);
    await screen.findByTestId("game-internal:abc-map");
    expect(screen.queryByTestId("hex-overlay")).not.toBeInTheDocument();
  });

  it("has a target for every hex and the empty positions, but not for column 0 or one too far", async () => {
    open(editRoute);
    await waitForCell("C11");
    // The map is columns 9 to 17 and rows A to D: one past each is a target
    expect(cell("E19")).toBeNull();
    expect(cell("E9")).toBeTruthy();
    expect(cell("D18")).toBeTruthy();
    expect(cell("A1")).toBeTruthy();
    expect(cell("A0")).toBeNull();
    // Only the positions a hex can sit on
    expect(cell("A2")).toBeNull();
    expect(cell("B2")).toBeTruthy();
  });

  it("prevents the context menu on the targets", async () => {
    open(editRoute);
    await waitForCell("C11");
    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    cell("C11").dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("outlines the hex under the pointer, empty positions too", async () => {
    open(editRoute);
    await waitForCell("C11");
    expect(screen.queryByTestId("hex-hover")).not.toBeInTheDocument();

    await realUser.hover(cell("C11"));
    await waitFor(() =>
      expect(screen.getByTestId("hex-hover")).toHaveAttribute(
        "data-hover",
        "C11",
      ),
    );

    await realUser.hover(cell("B2"));
    await waitFor(() =>
      expect(screen.getByTestId("hex-hover")).toHaveAttribute(
        "data-hover",
        "B2",
      ),
    );
  });
});

describe("selecting a group", () => {
  it("opens the hex tab with only that group and outlines its hexes", async () => {
    const { router } = open(`${editRoute}&editSection=trains`);
    await waitForCell("C11");

    await realUser.click(cell("D12"));
    // The anchor is the first coordinate of the group
    await waitFor(() =>
      expect(params(router)).toEqual({
        edit: "true",
        editSection: "hex",
        hex: "C11",
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "Hex" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    expect(await editorGroup()).toEqual(groupOf("C11"));
    expect(marks()).toEqual(groupOf("C11").hexes);
    // No history entry for a selection
    expect(router.state.historyAction).toBe("REPLACE");
  });

  it("switches to another group", async () => {
    const { router } = open(editRoute);
    await pick(router, "B12");
    expect(await editorGroup()).toEqual(groupOf("B12"));

    await realUser.click(cell("B14"));
    await waitFor(() => expect(params(router).hex).toBe("B14"));
    await waitFor(async () =>
      expect(await editorGroup()).toEqual(groupOf("B14")),
    );
    expect(marks()).toEqual(["B14"]);
  });

  it("selects an empty position without changing the game", async () => {
    const { router, store } = open(editRoute);
    const before = store.getState().game;

    await pick(router, "B2");
    expect(params(router).editSection).toBe("hex");
    expect(screen.getByRole("note")).toHaveTextContent("B2 has no hex yet");
    expect(await editorGroup()).toEqual({ color: "plain", hexes: ["B2"] });
    expect(store.getState().game).toBe(before);
  });

  it("is not a tap when the pointer was dragged", async () => {
    const { router } = open(editRoute);
    await waitForCell("C11");
    const down = { pointerId: 7, button: 0, buttons: 1, bubbles: true };
    const at = (x, y) => ({ clientX: x, clientY: y });

    // Synthetic pointer events: a real drag would be captured by the svg, and
    // the target of the pointerdown is what is checked
    fireEvent.pointerDown(cell("C11"), { ...down, ...at(700, 700) });
    fireEvent.pointerMove(svg(), { ...down, ...at(740, 700) });
    fireEvent.pointerUp(svg(), { ...down, buttons: 0, ...at(740, 700) });
    expect(params(router).hex).toBeUndefined();

    // Back at the start is a drag too
    fireEvent.pointerDown(cell("C11"), { ...down, ...at(700, 700) });
    fireEvent.pointerMove(svg(), { ...down, ...at(740, 700) });
    fireEvent.pointerMove(svg(), { ...down, ...at(700, 700) });
    fireEvent.pointerUp(svg(), { ...down, buttons: 0, ...at(700, 700) });
    expect(params(router).hex).toBeUndefined();

    // A press that stays is a tap
    fireEvent.pointerDown(cell("C11"), { ...down, ...at(700, 700) });
    fireEvent.pointerUp(svg(), { ...down, buttons: 0, ...at(702, 701) });
    await waitFor(() => expect(params(router).hex).toBe("C11"));
  });

  it("is not a tap with a second pointer down", async () => {
    const { router } = open(editRoute);
    await waitForCell("C11");
    const down = { button: 0, buttons: 1, bubbles: true, clientX: 700 };

    fireEvent.pointerDown(cell("C11"), { ...down, pointerId: 1, clientY: 700 });
    fireEvent.pointerDown(cell("C11"), { ...down, pointerId: 2, clientY: 710 });
    fireEvent.pointerUp(svg(), {
      ...down,
      pointerId: 2,
      buttons: 0,
      clientY: 710,
    });
    fireEvent.pointerUp(svg(), {
      ...down,
      pointerId: 1,
      buttons: 0,
      clientY: 700,
    });
    expect(params(router).hex).toBeUndefined();
  });

  it("shows a hint without a selection", async () => {
    open(`${editRoute}&editSection=hex`);
    expect(
      await screen.findByText(/Click a hex on the map to edit its group/),
    ).toBeVisible();
    expect(screen.queryByTestId("json-editor")).not.toBeInTheDocument();
  });

  it("keeps the selection of a link while the game loads", async () => {
    // No game in the store yet: the panel is not available until it is loaded
    const { router } = renderApp(
      `/games/18Test/map?edit=true&editSection=hex&hex=C11`,
    );
    expect(await editorGroup()).toEqual(games["18Test"].map.hexes[8]);
    expect(params(router).hex).toBe("C11");
    expect(marks()).toEqual(games["18Test"].map.hexes[8].hexes);
  });

  it("has the tab on the map only, and drops a selection elsewhere", async () => {
    const { router } = open(
      "/games/internal:abc/tokens?edit=true&editSection=hex&hex=C11",
    );
    await screen.findByTestId("edit-panel");
    expect(screen.queryByRole("tab", { name: "Hex" })).not.toBeInTheDocument();
    await waitFor(() => expect(params(router).hex).toBeUndefined());
  });

  it("is let go with Escape, the panel closes with the next one", async () => {
    const { user, router } = open(editRoute);
    await pick(router, "C11");
    document.activeElement?.blur?.();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(params(router).hex).toBeUndefined());
    expect(params(router).edit).toBe("true");
    expect(marks()).toEqual([]);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(router.state.location.search).toBe(""));
  });

  it("is let go when the panel closes", async () => {
    const { user, router } = open(editRoute);
    await pick(router, "C11");

    await user.click(
      screen.getByRole("button", { name: "Close the edit panel" }),
    );
    await waitFor(() => expect(router.state.location.search).toBe(""));
  });

  it("is let go when the variation changes", async () => {
    const copy = structuredClone(games["18Test"]);
    copy.map = [copy.map, { copy: 0, hexes: [{ hexes: ["B2"] }] }];
    const { router } = open(`${editRoute}&hex=C11&editSection=hex`, copy);
    await screen.findByTestId("edit-panel");
    expect(params(router).hex).toBe("C11");

    await router.navigate(
      { search: "?edit=true&editSection=hex&hex=C11&variation=1" },
      { replace: true },
    );
    await waitFor(() => expect(params(router).hex).toBeUndefined());
    expect(params(router).variation).toBe("1");
  });
});

describe.each([
  ["on macOS with Cmd", true],
  ["elsewhere with Ctrl", false],
])("moving hexes between groups %s", (_, mac) => {
  beforeEach(() => asMac(mac));

  it("adds a hex to the selected group and takes it from its group", async () => {
    const { router } = open(editRoute);
    await pick(router, "B12");

    await realUser.click(cell("C13"), { modifiers: [modifier(mac)] });
    await waitFor(() => expect(groupOf("C13").hexes).toContain("B12"));
    expect(groupOf("B12").hexes).toEqual(["B12", "C13"]);
    expect(groupOf("C11").hexes).not.toContain("C13");
    // The selection and the text follow
    expect(params(router).hex).toBe("B12");
    await waitFor(async () =>
      expect((await editorGroup()).hexes).toEqual(["B12", "C13"]),
    );
    expect(marks()).toEqual(["B12", "C13"]);
  });

  it("takes a hex out of the selected group", async () => {
    const { router } = open(editRoute);
    await pick(router, "C11");

    await realUser.click(cell("C13"), { modifiers: [modifier(mac)] });
    await waitFor(() => expect(groupOf("C13")).toBeUndefined());
    expect(groupOf("C11").hexes).toEqual([
      "C11",
      "C15",
      "C17",
      "D12",
      "D14",
      "D16",
    ]);
  });

  it("moves the selection with the first hex of the group", async () => {
    const { router } = open(editRoute);
    await pick(router, "C11");

    await realUser.click(cell("C11"), { modifiers: [modifier(mac)] });
    await waitFor(() => expect(params(router).hex).toBe("C13"));
    expect(groupOf("C13").hexes[0]).toBe("C13");
  });

  it("removes a group that has no hex left and lets go of it", async () => {
    const { router } = open(editRoute);
    await pick(router, "B12");
    const count = hexes().length;

    await realUser.click(cell("B12"), { modifiers: [modifier(mac)] });
    await waitFor(() => expect(hexes()).toHaveLength(count - 1));
    expect(groupOf("B12")).toBeUndefined();
    await waitFor(() => expect(params(router).hex).toBeUndefined());
    expect(params(router).editSection).toBe("hex");
  });

  it("makes a group of an empty position that gets a hex", async () => {
    const { router } = open(editRoute);
    await pick(router, "B2");

    await realUser.click(cell("B12"), { modifiers: [modifier(mac)] });
    await waitFor(() => expect(groupOf("B2")).toBeTruthy());
    expect(groupOf("B2")).toEqual({ color: "plain", hexes: ["B2", "B12"] });
    expect(groupOf("B14")).toBeTruthy();
  });

  it("keeps the last hex of the map", async () => {
    const one = structuredClone(games["18Test"]);
    one.map = { hexes: [{ color: "plain", hexes: ["A1"] }] };
    const { router, store } = open(editRoute, one);
    await pick(router, "A1");
    const before = store.getState().game;

    await realUser.click(cell("A1"), { modifiers: [modifier(mac)] });
    expect(
      await screen.findByText("The last hex of the map stays."),
    ).toBeVisible();
    expect(store.getState().game).toBe(before);
    expect(params(router).hex).toBe("A1");
  });

  it("does not move the view", async () => {
    const { router } = open(editRoute);
    await pick(router, "C11");
    const fitted = svg().getAttribute("viewBox");
    fireEvent.wheel(svg(), { deltaY: -200 });
    await waitFor(() => expect(svg()).not.toHaveAttribute("viewBox", fitted));
    const box = svg().getAttribute("viewBox");

    // A hex past the edge of the map makes it bigger
    // (a synthetic tap: the zoomed map can put the hex out of the window)
    const down = {
      pointerId: 7,
      button: 0,
      buttons: 1,
      bubbles: true,
      clientX: 700,
      clientY: 700,
      [mac ? "metaKey" : "ctrlKey"]: true,
    };
    fireEvent.pointerDown(cell("E9"), down);
    fireEvent.pointerUp(svg(), { ...down, buttons: 0 });
    await waitFor(() => expect(groupOf("E9")).toBeTruthy());
    expect(svg()).toHaveAttribute("viewBox", box);
  });
});

describe("editing the group as JSON", () => {
  const type = async (value) => {
    const v = await editor();
    v.dispatch({
      changes: {
        from: 0,
        to: v.state.doc.length,
        insert: JSON.stringify(value),
      },
    });
  };

  it("changes the group and nothing else", async () => {
    const { router, store } = open(editRoute);
    await pick(router, "B12");
    const before = store.getState().game;

    await type({ color: "red", hexes: ["B12"] });
    await waitFor(() => expect(groupOf("B12").color).toBe("red"));
    const after = store.getState().game;
    expect(after.map.hexes[5]).toEqual({ color: "red", hexes: ["B12"] });
    expect(after.map.hexes[6]).toBe(before.map.hexes[6]);
    expect(after.trains).toBe(before.trains);
  });

  it("keeps the game while the group is not valid", async () => {
    const { router, store } = open(editRoute);
    await pick(router, "B12");
    const before = store.getState().game;

    for (const value of [
      { color: "red", hexes: [] },
      { color: "red" },
      { color: "red", hexes: ["b"] },
      { color: "red", hexes: [3] },
      [],
    ]) {
      await type(value);
      await waitFor(() =>
        expect(screen.getByRole("status")).toHaveTextContent(
          "The game was not updated",
        ),
      );
      expect(store.getState().game).toBe(before);
    }
    // The map is still drawn
    expect(screen.getByTestId("game-internal:abc-map")).toBeVisible();
  });

  it("moves the selection when the first coordinate changes", async () => {
    const { router } = open(editRoute);
    await pick(router, "C11");
    const v = await editor();

    await type({ color: "plain", hexes: ["C13", "C11"] });
    await waitFor(() => expect(params(router).hex).toBe("C13"));
    // The editor is the same, its text is what was typed
    expect(await editor()).toBe(v);
    expect(JSON.parse(v.state.doc.toString()).hexes).toEqual(["C13", "C11"]);
    expect(hexes()[8].hexes).toEqual(["C13", "C11"]);
  });

  it("creates the group of an empty position on the first change", async () => {
    const { router, store } = open(editRoute);
    await pick(router, "B2");
    const count = hexes().length;

    await type({ color: "red", hexes: ["B2"] });
    await waitFor(() => expect(hexes()).toHaveLength(count + 1));
    expect(store.getState().game.map.hexes.at(-1)).toEqual({
      color: "red",
      hexes: ["B2"],
    });
    await waitFor(() =>
      expect(screen.queryByRole("note")).not.toBeInTheDocument(),
    );
  });
});

describe("a map that copies another", () => {
  const source = () => {
    const copy = structuredClone(games["18Test"]);
    copy.map = [
      { hexes: [{ color: "red", hexes: ["A1", "B2"] }] },
      { copy: 0, remove: ["B2"], hexes: [{ color: "gray", hexes: ["C3"] }] },
    ];
    return copy;
  };
  const copyRoute = `${editRoute}&variation=1`;

  it("shows the group of the copied map as it is, read only", async () => {
    const { router } = open(copyRoute, source());
    await waitForCell("A1");

    await realUser.click(cell("A1"));
    await waitFor(() => expect(params(router).hex).toBe("A1"));
    expect(await screen.findByRole("note")).toHaveTextContent(
      "copied from the map variation 1",
    );
    expect(screen.queryByTestId("json-editor")).not.toBeInTheDocument();
  });

  it("edits the groups of the variation itself", async () => {
    const { router } = open(copyRoute, source());
    await pick(router, "C3");
    expect(await editorGroup()).toEqual({ color: "gray", hexes: ["C3"] });
  });

  it("does not move a hex into the group of the copied map", async () => {
    const { router, store } = open(copyRoute, source());
    await waitForCell("A1");
    await realUser.click(cell("A1"));
    await waitFor(() => expect(params(router).hex).toBe("A1"));
    const before = store.getState().game;
    asMac(true);

    await realUser.click(cell("C3"), { modifiers: ["Meta"] });
    expect(await screen.findByText(/can only be changed there/)).toBeVisible();
    expect(store.getState().game).toBe(before);
  });

  it("does not add a hex the variation removes", async () => {
    const { router, store } = open(copyRoute, source());
    await pick(router, "C3");
    const before = store.getState().game;
    asMac(true);

    await realUser.click(cell("B2"), { modifiers: ["Meta"] });
    expect(await screen.findByText(/removes B2/)).toBeVisible();
    expect(store.getState().game).toBe(before);
  });
});
