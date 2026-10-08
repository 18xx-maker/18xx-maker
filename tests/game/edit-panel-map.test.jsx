import { screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";

import { renderApp } from "@tests/support/helpers.jsx";

// The Map tab: everything of the selected map variation but its hexes.

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
});

beforeEach(async () => {
  await browser.viewport(1280, 900);
});

const first = games["18Test"].map;
const variations = () => [
  {
    name: "First",
    hexes: structuredClone(first.hexes),
    trim: { bottom: true },
    roundTracker: { type: "row" },
    borders: [{ color: "white", coords: ["B16p4", "B16p5"], width: 6 }],
  },
  { name: "Second", copy: 0, hexes: [{ color: "plain", hexes: ["C3"] }] },
];

const open = (route, map) => {
  const game = {
    ...structuredClone(games["18Test"]),
    map,
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

const route = "/games/internal:abc/map?edit=true&editSection=map";
const map = () => opened.getState().game.map;
describe("edit panel map tab", () => {
  it("edits the trim and the round tracker of the first variation", async () => {
    const { user } = open(route, variations());
    const trim = await screen.findByRole("group", { name: "Trim" });
    await user.click(within(trim).getByRole("combobox", { name: "Top" }));
    await user.click(await screen.findByRole("option", { name: "Yes" }));
    expect(map()[0].trim).toEqual({ top: true, bottom: true });

    await user.click(screen.getByRole("combobox", { name: "Type" }));
    await user.click(await screen.findByRole("option", { name: "col" }));
    expect(map()[0].roundTracker).toEqual({ type: "col" });
    expect(map()[0].hexes).toEqual(first.hexes);
  });

  it("adds a border, a line and a border text with valid defaults", async () => {
    const { user } = open(route, variations());
    for (const name of ["Add border", "Add line", "Add border text"]) {
      await user.click(await screen.findByRole("button", { name }));
    }
    await waitFor(() => expect(map()[0].lines).toHaveLength(1));
    expect(map()[0].borders).toHaveLength(2);
    expect(map()[0].borders[1].coords).toHaveLength(2);
    expect(map()[0].lines[0].coords).toHaveLength(2);
    expect(map()[0].borderTexts).toHaveLength(1);
    expect(map()[0].borderTexts[0].coord).toBeTruthy();
    await settled();
    expect(
      opened
        .getState()
        .gameProblems.issues.filter((issue) =>
          issue.pointer.startsWith("map[0]."),
        ),
    ).toEqual([]);
  });

  it("edits the variation of the url and leaves the other and the hexes", async () => {
    const { user } = open(`${route}&variation=1`, variations());
    const name = await screen.findByRole("textbox", { name: "Name" });
    expect(name).toHaveValue("Second");
    await user.clear(name);
    await user.type(name, "Other");
    await user.tab();
    const trim = screen.getByRole("group", { name: "Trim" });
    await user.click(within(trim).getByRole("combobox", { name: "Left" }));
    await user.click(await screen.findByRole("option", { name: "Yes" }));

    expect(map()[1].name).toBe("Other");
    expect(map()[1].trim).toEqual({ left: true });
    expect(map()[1].hexes).toEqual([{ color: "plain", hexes: ["C3"] }]);
    expect(map()[0]).toEqual(variations()[0]);
  });

  it("offers the other variations to copy, and remove only for a copy", async () => {
    const { user } = open(`${route}&variation=1`, variations());
    const copy = await screen.findByRole("combobox", { name: "Copy of" });
    expect(copy).toHaveTextContent("First");
    expect(screen.getByRole("note")).toHaveTextContent("First");
    expect(screen.getByRole("textbox", { name: "Remove" })).toBeVisible();

    await user.click(copy);
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Not set",
      "First",
    ]);
    await user.click(screen.getByRole("option", { name: "Not set" }));
    expect(map()[1]).not.toHaveProperty("copy");
    expect(
      screen.queryByRole("textbox", { name: "Remove" }),
    ).not.toBeInTheDocument();
  });

  it("labels unnamed variations by number and skips copies as sources", async () => {
    const maps = [
      { hexes: [{ color: "plain", hexes: ["A1"] }] },
      { name: "", copy: 0, hexes: [{ color: "plain", hexes: ["C3"] }] },
      { name: "Third", hexes: [{ color: "plain", hexes: ["D4"] }] },
      { copy: 0, hexes: [{ color: "plain", hexes: ["E5"] }] },
    ];
    const { user } = open(`${route}&variation=2`, maps);
    const copy = await screen.findByRole("combobox", { name: "Copy of" });
    await user.click(copy);
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Not set",
      "Variation 1",
    ]);
  });

  it("shows remove while it has a value, even without a copy", async () => {
    const maps = variations();
    maps[1] = { ...maps[1], remove: ["A1"] };
    delete maps[1].copy;
    open(`${route}&variation=1`, maps);
    expect(
      await screen.findByRole("textbox", { name: "Remove" }),
    ).toBeVisible();
  });

  it("removes copied hexes one coordinate a line", async () => {
    const { user } = open(`${route}&variation=1`, variations());
    const remove = await screen.findByRole("textbox", { name: "Remove" });
    await user.type(remove, "A1{Enter}B2");
    await user.tab();
    expect(map()[1].remove).toEqual(["A1", "B2"]);
  });

  it("has no copy for a map that is not a list", async () => {
    open(route, structuredClone(first));
    await screen.findByRole("textbox", { name: "Name" });
    expect(
      screen.queryByRole("combobox", { name: "Copy of" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Remove" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Trim" })).toBeVisible();
  });

  it("hides the title with one checkbox, false or not set", async () => {
    const { user } = open(route, structuredClone(first));
    const box = await screen.findByRole("checkbox", {
      name: "Hide the title of the map",
    });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(map().title).toBe(false);
    await user.click(box);
    expect(map()).not.toHaveProperty("title");
  });

  it("is a tab of the map page only", async () => {
    open(route, variations());
    expect(await screen.findByRole("tab", { name: "Map" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Hex" })).toBeVisible();
  });

  it("is not a tab of another page", async () => {
    open("/games/internal:abc/tokens?edit=true", variations());
    await screen.findByTestId("edit-panel");
    expect(screen.queryByRole("tab", { name: "Map" })).not.toBeInTheDocument();
  });
});
