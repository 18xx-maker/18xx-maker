import { diagnosticCount } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { act, screen, waitFor } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import { omit } from "ramda";

import games from "@/data/games";
import { editGame, revertGame } from "@/state";
import { gameText } from "@/util/download";

import { allowConsole } from "@tests/support/console.js";
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
});

const open = (route, options) => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  const view = renderApp(
    route,
    {
      game,
      gameOriginal: structuredClone(game),
      gameHistory: [],
      loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
    },
    options,
  );
  opened = view.store;
  return view;
};

const route = "/games/internal:abc/map";
const jsonRoute = `${route}?edit=true&editSection=json`;

// The editor is created after its element is on the page
const view = async () => {
  const host = await screen.findByTestId("json-editor");
  return waitFor(() => {
    const found = EditorView.findFromDOM(host);
    if (!found) throw new Error("no editor yet");
    return found;
  });
};
const content = () => screen.getByRole("textbox", { name: "Game JSON" });
const status = () => screen.getByRole("status");

// Puts the cursor after the text in the document
const cursorAfter = async (needle) => {
  const v = await view();
  const at = v.state.doc.toString().indexOf(needle) + needle.length;
  v.dispatch({
    selection: { anchor: at },
    effects: EditorView.scrollIntoView(at, { y: "center" }),
  });
  v.contentDOM.focus();
  return v;
};

const setText = async (text) => {
  const v = await view();
  v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: text } });
};

// The editor applies typing after a pause, outside of any act
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  await browser.viewport(1280, 900);
});

afterEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

describe("json editor", () => {
  it("shows the game file as text on its tab and in the url", async () => {
    const { user, router } = open(`${route}?edit=true`);
    const tab = await screen.findByRole("tab", { name: "JSON" });
    expect(tab).toHaveAttribute("aria-selected", "false");
    expect(router.state.location.search).toBe("?edit=true");

    await user.click(tab);
    expect(router.state.location.search).toBe("?edit=true&editSection=json");
    const v = await view();
    expect(v.state.doc.toString()).toBe(gameText(opened.getState().game));
    expect(v.state.doc.toString()).not.toContain('"meta"');
    expect(content()).toHaveAttribute("aria-multiline", "true");
    expect(content()).toHaveAttribute("aria-describedby", status().id);
  });

  it("opens from the deep link", async () => {
    open(jsonRoute);
    await view();
    expect(screen.getByRole("tab", { name: "JSON" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("j opens it, switches to it and closes it from outside the editor", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");

    await user.keyboard("j");
    await view();
    expect(router.state.location.search).toBe("?edit=true&editSection=json");

    await user.keyboard("j");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("");

    await user.keyboard("e");
    await screen.findByTestId("edit-panel");
    await user.keyboard("j");
    await view();
    expect(router.state.location.search).toBe("?edit=true&editSection=json");
  });

  it("j does nothing while a dialog is open", async () => {
    const { user, router } = open(route);
    await screen.findByTestId("game-internal:abc-map");

    await user.keyboard("?");
    await screen.findByTestId("shortcuts");
    await user.keyboard("j");
    expect(router.state.location.search).toBe("");
    expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument();
  });

  it("j does nothing on the print page", async () => {
    const { user, router } = open(`${route}?print=true`);
    await screen.findByTestId("game-internal:abc-map");
    await user.keyboard("j");
    expect(router.state.location.search).toBe("?print=true");
  });

  it("keys typed in the editor are not shortcuts", async () => {
    const { router } = open(jsonRoute);
    await cursorAfter('"info": {');
    const before = gameText(opened.getState().game);
    await realUser.keyboard("jec?[[");

    expect(router.state.location.search).toBe("?edit=true&editSection=json");
    expect(screen.getByRole("tab", { name: "JSON" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.queryByTestId("shortcuts")).not.toBeInTheDocument();
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();
    expect((await view()).state.doc.toString()).toContain("jec?[");
    // The text is not valid now, the game is as it was
    expect(gameText(opened.getState().game)).toBe(before);
  });

  it("updates the game while the text is valid, keeping the meta and original", async () => {
    open(jsonRoute);
    await cursorAfter('"title": "18Test');
    await realUser.keyboard("X");

    await waitFor(() =>
      expect(opened.getState().game.info.title).toBe("18TestX"),
    );
    const { game, gameOriginal } = opened.getState();
    expect(game.meta.slug).toBe("internal:abc");
    expect(gameOriginal.info.title).toBe("18Test");
    expect(status()).toHaveTextContent("Valid JSON");
  });

  it("keeps the last valid game for text with a syntax error", async () => {
    open(jsonRoute);
    await cursorAfter('"title": "18Test"');
    await realUser.keyboard("x");

    await waitFor(() => expect(status()).toHaveTextContent(/Line \d+, column/));
    expect(status()).toHaveTextContent("syntax error");
    expect(status()).toHaveTextContent("The game was not updated");
    expect(opened.getState().game.info.title).toBe("18Test");

    await realUser.keyboard("{Backspace}");
    await waitFor(() => expect(status()).toHaveTextContent("Valid JSON"));
  });

  it.each([
    ["[]", "must be a JSON object"],
    ['{ "map": {} }', 'needs an "info" object'],
    ['{ "info": { "title": 5 } }', "must be text"],
  ])("does not take %s as a game", async (text, message) => {
    open(jsonRoute);
    await setText(text);
    await waitFor(() => expect(status()).toHaveTextContent(message));
    expect(opened.getState().game.info.title).toBe("18Test");
  });

  it("warns about schema problems in the margin and still updates", async () => {
    open(jsonRoute);
    await cursorAfter('"info": {');
    await realUser.keyboard('"bogus": 1,');

    const v = await view();
    await waitFor(() => expect(opened.getState().game.info.bogus).toBe(1));
    await waitFor(() => expect(diagnosticCount(v.state)).toBeGreaterThan(0), {
      timeout: 5000,
    });
    expect(
      screen.getByRole("link", { name: "See all problems" }),
    ).toBeVisible();
  });

  it("keeps the focus, the text and the cursor when the game does not change", async () => {
    open(jsonRoute);
    const v = await cursorAfter('"title": "18Test"');
    // The same game in other words: a duplicate key
    const text = v.state.doc.toString();
    const reworded = text.replace(
      '"title": "18Test"',
      '"title": "18Test", "title": "18Test"',
    );
    v.dispatch({ changes: { from: 0, to: text.length, insert: reworded } });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
    });
    expect(v.state.doc.toString()).toBe(reworded);
    expect(status()).toHaveTextContent("Valid JSON");
  });

  describe("format", () => {
    // The game of the page as compact text, with its title replaced
    const compact = async (title) => {
      const v = await view();
      const game = JSON.parse(v.state.doc.toString());
      game.info.title = title;
      return { game, text: JSON.stringify(game) };
    };

    it("rewrites valid text and is disabled with a reason when invalid", async () => {
      const { user } = open(jsonRoute);
      const { game, text } = await compact("Compact");
      await setText(text);
      const format = screen.getByRole("button", { name: "Format" });
      await waitFor(() =>
        expect(opened.getState().game.info.title).toBe("Compact"),
      );
      await user.click(format);
      expect((await view()).state.doc.toString()).toBe(
        JSON.stringify(game, null, 2),
      );

      await setText("{");
      await waitFor(() => expect(status()).toHaveTextContent("syntax error"));
      expect(format).toHaveAttribute("aria-disabled", "true");
      expect(format).toHaveAttribute("aria-describedby", status().id);
      await user.click(format);
      expect((await view()).state.doc.toString()).toBe("{");
    });

    it("warns before it drops a duplicate key or rounds a number", async () => {
      const { user } = open(jsonRoute);
      const { text } = await compact("Compact");
      await setText(
        text.replace('"title":"Compact"', '"title":"A","title":"B"'),
      );
      await waitFor(() => expect(opened.getState().game.info.title).toBe("B"));
      await user.click(screen.getByRole("button", { name: "Format" }));
      expect(status()).toHaveTextContent("used twice");
      expect((await view()).state.doc.toString()).toContain('"A"');

      await user.click(screen.getByRole("button", { name: "Format anyway" }));
      expect((await view()).state.doc.toString()).not.toContain('"A"');

      await setText(text.replace(/^\{/, '{"big":1234567890123456789,'));
      await waitFor(() => expect(opened.getState().game.big).toBeDefined());
      await user.click(screen.getByRole("button", { name: "Format" }));
      expect(status()).toHaveTextContent("more digits");
    });
  });

  describe("keyboard", () => {
    it("escape leaves the editor first and closes the panel second", async () => {
      const { user } = open(jsonRoute);
      await cursorAfter('"info": {');
      expect(content()).toHaveFocus();

      await user.keyboard("{Escape}");
      expect(content()).not.toHaveFocus();
      expect(screen.getByTestId("edit-panel")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
      );
    });

    it("tab indents", async () => {
      open(jsonRoute);
      const v = await cursorAfter('"info": {');
      await realUser.keyboard("{Tab}");
      expect(v.state.doc.toString()).toContain('\n    "info": {');
    });
  });

  describe("external changes", () => {
    it("revert refreshes the text, also within the debounce", async () => {
      open(jsonRoute);
      await cursorAfter('"title": "18Test');
      await realUser.keyboard("X");
      // Reverted before the typing was applied
      act(() => {
        opened.dispatch(editGame((game) => ({ ...game, zzz: true })));
      });
      await waitFor(async () =>
        expect((await view()).state.doc.toString()).toContain('"zzz": true'),
      );
      act(() => {
        opened.dispatch(revertGame());
      });
      await waitFor(async () =>
        expect((await view()).state.doc.toString()).not.toContain("zzz"),
      );
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 700));
      });
      expect(opened.getState().game.info.title).toBe("18Test");
      expect((await view()).state.doc.toString()).not.toContain("18TestX");
    });

    it("keeps the cursor, replacing only what changed", async () => {
      open(jsonRoute);
      const v = await cursorAfter('"info": {');
      const cursor = v.state.selection.main.head;
      act(() => {
        opened.dispatch(
          editGame((game) => ({
            ...game,
            info: { ...game.info, title: "Elsewhere" },
          })),
        );
      });
      await waitFor(() =>
        expect(v.state.doc.toString()).toContain('"title": "Elsewhere"'),
      );
      expect(v.state.selection.main.head).toBe(cursor);
    });

    it("leaves invalid text alone and says the game changed", async () => {
      const { user } = open(jsonRoute);
      await setText("{ not json");
      await waitFor(() => expect(status()).toHaveTextContent("syntax error"));
      act(() => {
        opened.dispatch(
          editGame((game) => ({
            ...game,
            info: { ...game.info, title: "Elsewhere" },
          })),
        );
      });
      await waitFor(() =>
        expect(status()).toHaveTextContent("changed elsewhere"),
      );
      expect((await view()).state.doc.toString()).toBe("{ not json");

      await user.click(screen.getByRole("button", { name: "Discard draft" }));
      expect((await view()).state.doc.toString()).toContain("Elsewhere");
      expect(status()).toHaveTextContent("Valid JSON");
    });
  });

  describe("drafts", () => {
    it("keeps invalid text over a tab switch and a closed panel, without storing it", async () => {
      const { user } = open(jsonRoute);
      await setText("{ draft");
      await waitFor(() => expect(status()).toHaveTextContent("syntax error"));

      await user.click(screen.getByRole("tab", { name: "Trains" }));
      await user.click(screen.getByRole("tab", { name: "JSON" }));
      expect((await view()).state.doc.toString()).toBe("{ draft");
      await waitFor(() => expect(status()).toHaveTextContent("syntax error"));

      await user.click(
        screen.getByRole("button", { name: "Close the edit panel" }),
      );
      await waitFor(() =>
        expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
      );
      await user.keyboard("j");
      expect((await view()).state.doc.toString()).toBe("{ draft");
      expect(JSON.stringify({ ...localStorage })).not.toContain("draft");
    });

    it("applies typing that waits when the tab is left", async () => {
      const { user } = open(jsonRoute);
      await cursorAfter('"title": "18Test');
      await realUser.keyboard("Y");
      await user.click(screen.getByRole("tab", { name: "Game info" }));
      expect(opened.getState().game.info.title).toBe("18TestY");
    });
  });

  it("keeps the panel usable when the page cannot draw the game", async () => {
    allowConsole(/./);
    open(jsonRoute);
    const v = await view();
    const text = v.state.doc.toString();
    const bad = JSON.parse(text);
    bad.map = 5;
    await setText(JSON.stringify(bad, null, 2));

    await screen.findByTestId("render-error");
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();

    await setText(text);
    await waitFor(() =>
      expect(screen.queryByTestId("render-error")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("game-internal:abc-map")).toBeInTheDocument();
  });

  it("works under StrictMode", async () => {
    open(jsonRoute, { strict: true });
    expect((await view()).state.doc.toString()).toContain('"title"');
    expect(screen.getAllByRole("textbox", { name: "Game JSON" })).toHaveLength(
      1,
    );
  });

  it("does not change the game when it is opened and formatted", async () => {
    const { user } = open(jsonRoute);
    const before = omit(["meta"], opened.getState().game);
    await view();
    await user.click(screen.getByRole("button", { name: "Format" }));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
    });
    expect(omit(["meta"], opened.getState().game)).toEqual(before);
    expect(opened.getState().game).toBe(opened.getState().game);
  });
});
