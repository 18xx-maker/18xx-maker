/* eslint-disable testing-library/no-node-access */
import { EditorView } from "@codemirror/view";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import games from "@/data/games";
import { editGame } from "@/state";

import { allowConsole } from "@tests/support/console.js";
import { renderApp } from "@tests/support/helpers.jsx";

// The Hex tab as a form: a drawing of the hex of the group picked on the map,
// its elements and their fields. Everything is read back from the game.

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
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
  // The JSON editor applies typing after a pause, outside of any act
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
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

const route = "/games/internal:abc/map?edit=true&editSection=hex";
const hexes = () => opened.getState().game.map.hexes;
const groupOf = (coord) => hexes().find((group) => group.hexes.includes(coord));
const form = () => screen.findByTestId("hex-editor");
const edge = (side, name = /start a track here/) =>
  screen.getByRole("button", {
    name: new RegExp(`^Side ${side}: .*${name.source}`),
  });

describe("the form", () => {
  it("is the Hex tab until JSON is chosen, with the drawing of the hex", async () => {
    open(`${route}&hex=C11`);
    const editor = await form();
    expect(screen.getByRole("radio", { name: "Form" })).toBeChecked();
    expect(screen.queryByTestId("json-editor")).not.toBeInTheDocument();
    expect(within(editor).getByTestId("hex-canvas")).toBeVisible();
    // The real hex is drawn in it: a plain hex has its polygon
    expect(
      within(editor).getByTestId("hex-canvas").querySelector("polygon"),
    ).toBeTruthy();
    expect(
      screen.getByText("Nothing is drawn on this hex yet", { exact: false }),
    ).toBeVisible();
  });

  it("says that the changes apply to every hex of the group", async () => {
    open(`${route}&hex=C11`);
    await form();
    expect(screen.getByText(/all 7 hexes of this group/)).toBeVisible();
  });

  it("draws track from two clicks on the edges", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();

    await user.click(edge(1));
    expect(screen.getByTestId("hex-canvas")).toHaveAttribute(
      "data-pending",
      "1",
    );
    await user.click(edge(4, /end the track/));
    await waitFor(() =>
      expect(groupOf("C11").track).toEqual([{ side: 1, type: "straight" }]),
    );
    // The new track is picked, and the group is still the group
    expect(groupOf("C11").hexes).toHaveLength(7);
    expect(await screen.findByTestId("hex-inspector")).toHaveAccessibleName(
      "Fields of Track",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Added a track from side 1 to side 4",
    );
  });

  it("cancels a track started with a second click on the same edge or Escape", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();
    const before = opened.getState().game;

    await user.click(edge(2));
    await user.click(edge(2, /cancel the track/));
    expect(screen.getByTestId("hex-canvas")).not.toHaveAttribute(
      "data-pending",
    );

    await user.click(edge(2));
    await user.keyboard("{Escape}");
    expect(screen.getByTestId("hex-canvas")).not.toHaveAttribute(
      "data-pending",
    );
    expect(opened.getState().game).toBe(before);
  });

  it("works from the keyboard", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();

    edge(2).focus();
    await user.keyboard("{Enter}");
    edge(3, /end the track/).focus();
    await user.keyboard(" ");
    await waitFor(() =>
      expect(groupOf("C11").track).toEqual([{ side: 2, type: "sharp" }]),
    );
  });

  it("adds a city from the list and edits a field of a label", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();

    await user.click(screen.getByRole("combobox", { name: "Add an element" }));
    await user.click(await screen.findByRole("option", { name: "Label" }));
    await waitFor(() =>
      expect(groupOf("C11").labels).toEqual([{ label: "A" }]),
    );

    const inspector = await screen.findByTestId("hex-inspector");
    const field = await within(inspector).findByRole("textbox", {
      name: /^Label/,
    });
    await user.clear(field);
    await user.type(field, "Z");
    await user.tab();
    await waitFor(() =>
      expect(groupOf("C11").labels).toEqual([{ label: "Z" }]),
    );
    // Nothing was written that was not asked for
    expect(Object.keys(groupOf("C11"))).toEqual(["color", "hexes", "labels"]);
  });

  it("keeps a town when its last field is cleared", async () => {
    const source = structuredClone(games["18Test"]);
    const group = source.map.hexes.find((g) => g.hexes.includes("C11"));
    group.towns = [{ angle: 90 }];
    const { user } = open(`${route}&hex=C11`, source);
    await form();
    await user.click(
      screen
        .getByTestId("hex-canvas-elements")
        .querySelector('[data-element="towns:0"]'),
    );
    const inspector = await screen.findByTestId("hex-inspector");
    await user.click(
      within(inspector).getByRole("button", { name: "More fields" }),
    );
    const field = await within(inspector).findByDisplayValue("90");
    await user.clear(field);
    await user.tab();
    await waitFor(() =>
      expect(groupOf("C11").towns?.[0]?.angle).toBeUndefined(),
    );
    // The town stays, as an empty element, and so does the list
    expect(groupOf("C11").towns).toEqual([{}]);
  });

  it("removes an element, and the list with its last one", async () => {
    const { user } = open(`${route}&hex=B14`);
    await form();
    expect(groupOf("B14").terrain).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Remove Terrain" }));
    await waitFor(() => expect(groupOf("B14").terrain).toBeUndefined());
    expect("terrain" in groupOf("B14")).toBe(false);
    expect(screen.getByRole("status")).toHaveTextContent("Removed Terrain");
  });

  it("picks an element from the drawing", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    expect(groupOf("B12").cities).toBeTruthy();

    await user.click(
      screen
        .getByTestId("hex-canvas-elements")
        .querySelector('[data-element="cities:0"]'),
    );
    expect(await screen.findByTestId("hex-inspector")).toHaveAccessibleName(
      "Fields of City",
    );
  });

  it("changes the color of the hex", async () => {
    const { user } = open(`${route}&hex=B14`);
    await form();
    await user.click(screen.getByRole("combobox", { name: "Color" }));
    await user.click(await screen.findByRole("option", { name: "red" }));
    await waitFor(() => expect(groupOf("B14").color).toBe("red"));
  });

  it("removes a border from a side", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();
    const picker = screen.getAllByRole("group", {
      name: "Borders removed",
    })[0];
    await user.click(within(picker).getByRole("button", { name: "Side 3" }));
    await waitFor(() => expect(groupOf("C11").removeBorders).toEqual([3]));
  });
});

describe("direct manipulation and undo", () => {
  const circle = (id) =>
    screen
      .getByTestId("hex-canvas-elements")
      .querySelector(`[data-element="${id}"]`);
  const dragBy = async (user, id, dx, dy) => {
    const box = circle(id).getBoundingClientRect();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await user.pointer([
      {
        keys: "[MouseLeft>]",
        target: circle(id),
        coords: { clientX: x, clientY: y },
      },
      { coords: { clientX: x + dx / 2, clientY: y + dy / 2 } },
      { coords: { clientX: x + dx, clientY: y + dy } },
      { keys: "[/MouseLeft]", coords: { clientX: x + dx, clientY: y + dy } },
    ]);
  };

  it("drags an element to a new x and y, as one step", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    const before = structuredClone(groupOf("B12").cities[0]);

    await dragBy(user, "cities:0", 40, 20);
    await waitFor(() => expect(groupOf("B12").cities[0].x).toBeGreaterThan(0));
    const moved = groupOf("B12").cities[0];
    expect(moved.y).toBeGreaterThan(0);
    expect(screen.getByRole("status")).toHaveTextContent("Moved City");
    // It is picked, and the whole drag undoes in one step
    expect(await screen.findByTestId("hex-inspector")).toHaveAccessibleName(
      "Fields of City",
    );
    await user.click(screen.getByRole("button", { name: /^Undo/ }));
    await waitFor(() => expect(groupOf("B12").cities[0]).toEqual(before));
  });

  it("does not move or record a press without movement", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    const before = opened.getState().game;
    await user.click(circle("cities:0"));
    expect(await screen.findByTestId("hex-inspector")).toBeVisible();
    expect(opened.getState().game).toBe(before);
    expect(screen.getByRole("button", { name: /^Undo/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("undoes and redoes with the buttons and the keys", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();
    const undo = screen.getByRole("button", { name: /^Undo/ });
    const redo = screen.getByRole("button", { name: /^Redo/ });
    expect(undo).toHaveAttribute("aria-disabled", "true");
    expect(redo).toHaveAttribute("aria-disabled", "true");

    await user.click(screen.getByRole("combobox", { name: "Color" }));
    await user.click(await screen.findByRole("option", { name: "red" }));
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));
    await user.click(undo);
    await waitFor(() => expect(groupOf("C11").color).not.toBe("red"));
    expect(redo).toHaveAttribute("aria-disabled", "false");
    await user.click(redo);
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));

    // The keys act when the focus is in the editor, and not in a field
    undo.focus();
    await user.keyboard("{Control>}z{/Control}");
    await waitFor(() => expect(groupOf("C11").color).not.toBe("red"));
    await user.keyboard("{Control>}{Shift>}z{/Shift}{/Control}");
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));
    await user.keyboard("{Control>}z{/Control}");
    await waitFor(() => expect(groupOf("C11").color).not.toBe("red"));
    await user.keyboard("{Control>}y{/Control}");
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));
  });
  it("undoes with the keys right after a drag", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    const before = structuredClone(groupOf("B12").cities[0]);
    await dragBy(user, "cities:0", 40, 20);
    await waitFor(() => expect(groupOf("B12").cities[0].x).toBeGreaterThan(0));
    await user.keyboard("{Control>}z{/Control}");
    await waitFor(() => expect(groupOf("B12").cities[0]).toEqual(before));
  });

  it("keeps the hexes of the group the map changed when it undoes", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();
    await user.click(screen.getByRole("combobox", { name: "Color" }));
    await user.click(await screen.findByRole("option", { name: "red" }));
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));
    // What a Cmd-click on the map does: another hex joins the group
    const hexesBefore = groupOf("C11").hexes;
    opened.dispatch(
      editGame((game) => ({
        ...game,
        map: {
          ...game.map,
          hexes: game.map.hexes.map((group) =>
            group.hexes.includes("C11")
              ? { ...group, hexes: [...group.hexes, "Z99"] }
              : group,
          ),
        },
      })),
    );
    await waitFor(() => expect(groupOf("C11").hexes).toContain("Z99"));
    await user.click(screen.getByRole("button", { name: /^Undo/ }));
    await waitFor(() => expect(groupOf("C11").color).not.toBe("red"));
    expect(groupOf("C11").hexes).toEqual([...hexesBefore, "Z99"]);
    await user.click(screen.getByRole("button", { name: /^Redo/ }));
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));
    expect(groupOf("C11").hexes).toEqual([...hexesBefore, "Z99"]);
  });

  it("picks an element after a drag that was cancelled", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();
    await user.click(edge(1));
    await user.click(edge(4, /end the track/));
    await user.click(screen.getByRole("combobox", { name: "Add an element" }));
    await user.click(await screen.findByRole("option", { name: "City" }));
    await waitFor(() => expect(groupOf("C11").cities).toHaveLength(1));

    const city = circle("cities:0");
    const box = city.getBoundingClientRect();
    const at = {
      clientX: box.x + 3,
      clientY: box.y + 3,
      pointerId: 1,
      button: 0,
    };
    fireEvent.pointerDown(city, at);
    fireEvent.pointerMove(city, { ...at, clientX: at.clientX + 30 });
    fireEvent.pointerCancel(city, at);

    // The track cannot be dragged, so its press does not reset anything: a
    // click on it must still pick it
    await user.click(screen.getByRole("button", { name: /^City/ }));
    await waitFor(() =>
      expect(screen.queryByTestId("hex-inspector")).not.toBeInTheDocument(),
    );
    await user.click(circle("track:0"));
    expect(await screen.findByTestId("hex-inspector")).toHaveAccessibleName(
      "Fields of Track",
    );
  });
});

describe("the JSON view", () => {
  const editor = () =>
    waitFor(() => {
      const host = screen.queryByTestId("json-editor");
      if (!host) throw new Error("no editor yet");
      const found = EditorView.findFromDOM(host);
      if (!found) throw new Error("no editor view yet");
      return found;
    });

  it("shows the same group", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    await user.click(screen.getByRole("radio", { name: "JSON" }));
    const view = await editor();
    expect(JSON.parse(view.state.doc.toString())).toEqual(groupOf("B12"));
    expect(screen.queryByTestId("hex-editor")).not.toBeInTheDocument();
  });

  it("starts over from what the form made, and the form from what the JSON made", async () => {
    const { user } = open(`${route}&hex=C11`);
    await form();
    await user.click(edge(1));
    await user.click(edge(4, /end the track/));
    await waitFor(() => expect(groupOf("C11").track).toBeTruthy());

    await user.click(screen.getByRole("radio", { name: "JSON" }));
    const view = await editor();
    expect(JSON.parse(view.state.doc.toString()).track).toEqual([
      { side: 1, type: "straight" },
    ]);

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: JSON.stringify({ ...groupOf("C11"), color: "red" }),
      },
    });
    await waitFor(() => expect(groupOf("C11").color).toBe("red"));
    await user.click(screen.getByRole("radio", { name: "Form" }));
    await form();
    expect(screen.getByRole("combobox", { name: "Color" })).toHaveTextContent(
      "red",
    );
  });

  it("does not switch to the form while the JSON is not valid", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    await user.click(screen.getByRole("radio", { name: "JSON" }));
    const view = await editor();
    const before = opened.getState().game;

    view.dispatch({ changes: { from: 0, to: 0, insert: "{" } });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("syntax error"),
    );
    await user.click(screen.getByRole("radio", { name: "Form" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The JSON is not valid yet",
    );
    const alertGone = () =>
      waitFor(() =>
        expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
      );
    expect(screen.getByRole("radio", { name: "JSON" })).toBeChecked();
    expect(screen.queryByTestId("hex-editor")).not.toBeInTheDocument();
    expect(opened.getState().game).toBe(before);

    // Fixed, the switch works
    view.dispatch({ changes: { from: 0, to: 1 } });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Valid JSON"),
    );
    await alertGone();
    await user.click(screen.getByRole("radio", { name: "Form" }));
    await form();
  });

  it("keeps an invalid JSON draft when the tab is left and come back to", async () => {
    const { user } = open(`${route}&hex=B12`);
    await form();
    await user.click(screen.getByRole("radio", { name: "JSON" }));
    const view = await editor();
    view.dispatch({ changes: { from: 0, to: 0, insert: "{" } });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("syntax error"),
    );
    const text = view.state.doc.toString();

    await user.click(screen.getByRole("tab", { name: "Trains" }));
    await waitFor(() =>
      expect(screen.queryByTestId("json-editor")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("tab", { name: "Hex" }));
    expect(await screen.findByRole("radio", { name: "JSON" })).toBeChecked();
    expect((await editor()).state.doc.toString()).toBe(text);
  });
});

describe("groups that overlap or copy", () => {
  it("says which other groups list the hex", async () => {
    allowConsole(/same key/);
    const source = structuredClone(games["18Test"]);
    source.map.hexes.push({ color: "red", hexes: ["C11"] });
    open(`${route}&hex=C11`, source);
    await form();
    expect(screen.getByText(/C11 is also in the groups #9/)).toBeVisible();
  });

  it("overrides a hex of a copied map with a group of its own", async () => {
    const source = structuredClone(games["18Test"]);
    source.map = [
      { hexes: [{ color: "red", hexes: ["A1", "B2"] }] },
      { copy: 0, hexes: [{ color: "gray", hexes: ["C3"] }] },
    ];
    const { user } = open(`${route}&hex=A1&variation=1`, source);
    expect(await screen.findByRole("note")).toHaveTextContent(
      "copied from the map variation 1",
    );
    await user.click(screen.getByRole("button", { name: "Override here" }));
    await form();
    expect(opened.getState().game.map[1].hexes.at(-1)).toEqual({
      color: "red",
      hexes: ["A1"],
    });
    expect(screen.getByRole("radio", { name: "Form" })).toBeChecked();
  });
});
