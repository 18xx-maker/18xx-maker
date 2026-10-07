import { EditorView } from "@codemirror/view";
import { screen, waitFor } from "@testing-library/react";
import { page as browser } from "vitest/browser";

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

beforeEach(async () => {
  // The editor applies typing after a pause, outside of any act
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  await browser.viewport(1280, 900);
});

afterEach(async () => {
  if (opened) await settled();
  opened = undefined;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

const open = (config) => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  delete game.config;
  if (config) game.config = config;
  const view = renderApp(
    "/games/internal:abc/map?edit=true&editSection=config",
    {
      game,
      gameOriginal: structuredClone(game),
      gameHistory: [],
      loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
    },
  );
  opened = view.store;
  return view;
};

const view = async () => {
  const host = await screen.findByTestId("json-editor");
  return waitFor(() => {
    const found = EditorView.findFromDOM(host);
    if (!found) throw new Error("no editor yet");
    return found;
  });
};
const setText = async (text) => {
  const v = await view();
  v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } });
};
const game = () => opened.getState().game;

describe("config tab", () => {
  it("shows the config of the game as JSON", async () => {
    open({ margin: 10 });
    const v = await view();
    expect(v.state.doc.toString()).toBe(
      JSON.stringify({ margin: 10 }, null, 2),
    );
    expect(
      screen.getByRole("textbox", { name: "Game config JSON" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Config" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("shows an empty object for a game without config", async () => {
    open();
    expect((await view()).state.doc.toString()).toBe("{}");
  });

  it("writes valid JSON to the config of the game", async () => {
    open();
    const before = game().info;
    await setText(
      '{ "fonts": { "roles": { "title": { "style": "italic" } } } }',
    );
    await waitFor(() =>
      expect(game().config).toEqual({
        fonts: { roles: { title: { style: "italic" } } },
      }),
    );
    // The rest of the game is the same
    expect(game().info).toBe(before);
  });

  it("does not take text that is not an object", async () => {
    open({ margin: 10 });
    await setText("[1, 2]");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "The config must be a JSON object.",
      ),
    );
    expect(game().config).toEqual({ margin: 10 });
  });

  it("removes config from the game when it is emptied", async () => {
    open({ margin: 10 });
    await setText("{}");
    await waitFor(() => expect("config" in game()).toBe(false));
  });

  it("marks the tab and the text for a value the config schema rejects", async () => {
    open();
    await setText('{ "fonts": { "roles": { "title": { "size": "big" } } } }');
    expect(await screen.findByTestId("edit-problem-config")).toBeVisible();
    expect(screen.getByRole("tab", { name: /^Config/ })).toHaveAccessibleName(
      "Config 1 problem",
    );
    // The game still has it: problems only warn
    expect(game().config.fonts.roles.title.size).toBe("big");
  });

  it("has no problem for a valid config", async () => {
    open({ fonts: { roles: { title: { size: 12 } } } });
    await view();
    await settled();
    expect(screen.queryByTestId("edit-problem-config")).not.toBeInTheDocument();
  });
});
