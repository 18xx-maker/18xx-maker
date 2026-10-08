import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import { getDraft, setDraft } from "@/components/editPanel/draftStore";

import games from "@/data/games";
import { revertGame } from "@/state/game";

import { renderApp } from "@tests/support/helpers.jsx";

// The Move map buttons of the Map tab.

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

const route = "/games/internal:abc/map?edit=true&editSection=map";
const game = () => opened.getState().game;
const button = (name) => screen.findByRole("button", { name });
const params = (router) =>
  Object.fromEntries(new URLSearchParams(router.state.location.search));

describe("map move buttons", () => {
  it("renders four buttons in a group", async () => {
    open(route);
    const group = await screen.findByRole("group", { name: "Move map" });
    expect(within(group).getAllByRole("button")).toHaveLength(4);
  });

  it("disables up at row A and left at column 1, with a title", async () => {
    const hexes = [{ color: "plain", hexes: ["A1", "B2"] }];
    open(route, { ...games["18Test"], map: { hexes } });
    expect(await button("Move map up")).toBeDisabled();
    expect(await button("Move map left")).toBeDisabled();
    expect(await button("Move map right")).toBeEnabled();
    expect(screen.getByTitle(/first row \(A\)/)).toBeInTheDocument();
    expect(screen.getByTitle(/first column \(1\)/)).toBeInTheDocument();
  });

  it("moves the map and the references, in one edit", async () => {
    const { user } = open(route);
    const store = opened;
    let edits = 0;
    let last = store.getState().game;
    const stop = store.subscribe(() => {
      if (store.getState().game !== last) edits += 1;
      last = store.getState().game;
    });
    await user.click(await button("Move map right"));
    expect(game().map.hexes[0].hexes).toEqual(["A12"]);
    expect(game().privates.at(-1).hex).toBe("A12");
    expect(game().companies[0].home).toBe("H6");
    expect(game().companies[1].home).toBe("B3");
    expect(edits).toBe(1);
    stop();
    await user.click(await button("Move map down"));
    expect(game().map.hexes[0].hexes).toEqual(["B12"]);
    expect(opened.getState().gameOriginal.map.hexes[0].hexes).toEqual(["A11"]);
  });

  it("clears the drafts of hex groups", async () => {
    const { user } = open(route);
    setDraft("internal:abc#hex:0:A11", "{", "x");
    setDraft("internal:abc", "game", "x");
    await user.click(await button("Move map right"));
    expect(getDraft("internal:abc#hex:0:A11")).toBeUndefined();
    expect(getDraft("internal:abc")).toBeDefined();
  });

  it("moves the selected hex with the map, also an empty cell", async () => {
    const { user, router } = open(`${route}&hex=B12`);
    await user.click(await button("Move map down"));
    await waitFor(() => expect(params(router).hex).toBe("C12"));
    expect(params(router).editSection).toBe("map");
    await user.click(await button("Move map right"));
    await waitFor(() => expect(params(router).hex).toBe("C13"));
  });

  it("leaves the problems of the game as they were", async () => {
    const { user } = open(route);
    await user.click(await button("Move map right"));
    await waitFor(() =>
      expect(opened.getState().gameProblems.status).toBe("done"),
    );
    expect(opened.getState().gameProblems.issues).toEqual([]);
  });

  it("changes the letter with left and right on a horizontal map", async () => {
    const { user } = open(route, games["1858"]);
    const before = game().map;
    const first = (map) => [map].flat()[0].hexes[0].hexes[0];
    await user.click(await button("Move map right"));
    const moved = first(game().map);
    expect(moved).toBe(
      first(before).replace(/^([A-Z]+)/, (l) =>
        String.fromCharCode(l.charCodeAt(0) + 1),
      ),
    );
  });

  it("names the row for left on a horizontal map at row A", async () => {
    const hexes = [{ color: "plain", hexes: ["A5"] }];
    open(route, {
      ...games["18Test"],
      info: { ...games["18Test"].info, orientation: "horizontal" },
      map: { hexes },
    });
    expect(await button("Move map left")).toBeDisabled();
    expect(screen.getByTitle(/first row \(A\)/)).toBeInTheDocument();
    expect(await button("Move map up")).toBeEnabled();
  });

  it("moves a trimmed map like any other", async () => {
    const { user } = open(route);
    expect(game().map.trim).toEqual({ bottom: true, right: true });
    await user.click(await button("Move map right"));
    expect(game().map.trim).toEqual({ bottom: true, right: true });
  });

  it("drops the note about unchanged coordinates after a revert", async () => {
    const { user } = open(route, {
      ...games["18Test"],
      map: { hexes: [{ color: "plain", hexes: ["B2"] }] },
      privates: [{ name: "P", hex: "A1" }],
      companies: [],
    });
    await user.click(await button("Move map up"));
    expect(await screen.findByRole("note")).toHaveTextContent(/left as/);
    await act(() => opened.dispatch(revertGame()));
    await waitFor(() =>
      expect(screen.queryByRole("note")).not.toBeInTheDocument(),
    );
  });
});
