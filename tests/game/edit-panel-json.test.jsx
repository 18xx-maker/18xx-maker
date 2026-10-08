import { undo } from "@codemirror/commands";
import { foldedRanges, unfoldAll } from "@codemirror/language";
import { diagnosticCount, forceLinting } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { act, screen, waitFor } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import { omit } from "ramda";

import games from "@/data/games";
import { createSetExportSheetOpen, editGame, revertGame } from "@/state";
import { gameText } from "@/util/download";
import { MIN_DELAY, debounceDelay } from "@/util/jsonEditor";

import { allowConsole } from "@tests/support/console.js";
import { renderApp } from "@tests/support/helpers.jsx";

// A game that is not in the state is loaded in the background and a failed
// load goes back to the library: keep the load pending so the key is pressed
// while the page is still on its route, however slow the machine is
vi.mock("@/util/storage/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(() => new Promise(() => {})),
}));

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

const open = (route, options, source = games["18Test"], edit = {}) => {
  const game = {
    ...structuredClone(source),
    ...edit,
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
// eslint-disable-next-line testing-library/no-node-access
const pick = (v, selector) => v.dom.querySelector(selector);
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
  it("says under the changes button that changes stay in memory", async () => {
    const { user } = open(`${route}?edit=true`);
    await user.click(await screen.findByRole("button", { name: "JSON" }));
    await view();
    expect(
      screen.getByText(
        "Changes stay in memory until you save them on the Changes page.",
      ),
    ).toBeVisible();
  });

  it("shows the game file as text on its tab and in the url", async () => {
    const { user, router } = open(`${route}?edit=true`);
    const tab = await screen.findByRole("button", { name: "JSON" });
    expect(tab).toHaveAttribute("aria-pressed", "false");
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
    expect(screen.getByRole("button", { name: "JSON" })).toHaveAttribute(
      "aria-pressed",
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

  describe("j on any page", () => {
    const base = "/games/internal:abc";
    const json = "?edit=true&editSection=json";

    it.each([
      ["game page", base, "map"],
      ["problems", `${base}/problems`, "map"],
      ["changes", `${base}/changes`, "map"],
      ["home", "/", "map"],
    ])("opens the editor from the %s", async (_name, url, section) => {
      const { user, router } = open(url);
      await user.keyboard("j");
      await view();
      expect(router.state.location.pathname).toBe(`${base}/${section}`);
      expect(router.state.location.search).toBe(json);
    });

    it("goes to the first section the game has", async () => {
      const { user, router } = open("/", undefined, games["18Test"], {
        map: undefined,
      });
      await user.keyboard("j");
      await view();
      expect(router.state.location.pathname).toBe(`${base}/market`);
      expect(router.state.location.search).toBe(json);
    });

    it("does nothing on home while a dialog is open", async () => {
      const { user, router } = open("/");
      await user.keyboard("?");
      await screen.findByTestId("shortcuts");
      await user.keyboard("j");
      expect(router.state.location.pathname).toBe("/");
      expect(router.state.location.search).toBe("");
    });

    it.each([
      ["home", "/"],
      ["problems", `${base}/problems`],
    ])("does nothing on the print page of %s", async (_name, url) => {
      const { user, router } = open(`${url}?print=true`);
      await user.keyboard("j");
      expect(router.state.location.pathname).toBe(url);
      expect(router.state.location.search).toBe("?print=true");
    });

    it.each([
      ["game page", route],
      ["problems", `${base}/problems`],
      ["home", "/"],
    ])(
      "does nothing from the %s with the export options open",
      async (_n, url) => {
        const { user, router, store } = open(url);
        act(() => store.dispatch(createSetExportSheetOpen(true)));
        await user.keyboard("j");
        expect(router.state.location.pathname).toBe(url);
        expect(router.state.location.search).toBe("");
      },
    );

    it("does nothing on a page without the edit panel while a dialog is open", async () => {
      const { user, router } = open(`${base}/problems`);
      await user.keyboard("?");
      await screen.findByTestId("shortcuts");
      await user.keyboard("j");
      expect(router.state.location.pathname).toBe(`${base}/problems`);
      expect(router.state.location.search).toBe("");
    });

    it("goes to the map of a slug other than the loaded one", async () => {
      // The loaded game has no map: its first section would be the market
      const { user, router } = open(
        "/games/internal:other/problems",
        undefined,
        games["18Test"],
        { map: undefined },
      );
      await user.keyboard("j");
      expect(router.state.location.pathname).toBe("/games/internal:other/map");
      expect(router.state.location.search).toBe(json);
    });

    it("goes to the map when the game is not in the state", async () => {
      const { user, router } = renderApp("/games/internal:zzz/problems");
      await user.keyboard("j");
      expect(router.state.location.pathname).toBe("/games/internal:zzz/map");
      expect(router.state.location.search).toBe(json);
    });

    it("does nothing without a loaded game", async () => {
      const { user, router } = renderApp("/");
      await user.keyboard("j");
      expect(router.state.location.pathname).toBe("/");
      expect(router.state.location.search).toBe("");
    });
  });

  describe("folding", () => {
    const folded = (v) => {
      const ranges = [];
      foldedRanges(v.state).between(0, v.state.doc.length, (from, to) =>
        ranges.push([from, to]),
      );
      return ranges;
    };

    // The root keys of the text in order, with whether they are folded
    const rootState = (v) => {
      const text = v.state.doc.toString();
      const ranges = folded(v);
      return Object.keys(JSON.parse(text)).map((key) => {
        const at = text.indexOf(`\n  "${key}": `) + 1;
        const open = text.indexOf(":", at) + 2;
        return [key, ranges.some(([from]) => from === open + 1)];
      });
    };

    it.each([
      ["18Test", games["18Test"]],
      [
        "the biggest game",
        Object.values(games).sort(
          (a, b) => JSON.stringify(b).length - JSON.stringify(a).length,
        )[0],
      ],
    ])(
      "starts with the root containers folded but info (%s)",
      async (_n, game) => {
        open(jsonRoute, undefined, game);
        const v = await view();
        const text = v.state.doc.toString();
        expect(text).toBe(gameText(opened.getState().game));
        const root = JSON.parse(text);
        const state = Object.fromEntries(rootState(v));
        const expected = Object.keys(root).filter(
          (key) =>
            key !== "info" &&
            root[key] &&
            typeof root[key] === "object" &&
            JSON.stringify(root[key], null, 2).includes("\n"),
        );
        expect(expected.length).toBeGreaterThan(0);
        for (const key of Object.keys(root)) {
          expect(state[key]).toBe(expected.includes(key));
        }
        expect(state.info).toBe(false);
      },
    );

    it("folds map and tiles of 18Test, not info", async () => {
      open(jsonRoute);
      const v = await view();
      const state = Object.fromEntries(rootState(v));
      expect(state.map).toBe(true);
      expect(state.tiles).toBe(true);
      expect(state.info).toBe(false);
    });

    it("opens the fold a line link lands in", async () => {
      const { router } = open(jsonRoute);
      const v = await view();
      const doc = v.state.doc;
      const header = doc.toString().indexOf('"map": {');
      const line = doc.lineAt(header).number + 1;
      const hidden = (at) =>
        folded(v).some(
          ([from, to]) =>
            doc.line(at).from > doc.lineAt(from).to && doc.line(at).from <= to,
        );
      expect(hidden(line)).toBe(true);
      const other = folded(v).length;

      await act(() =>
        router.navigate({ search: `${jsonRoute.split("?")[1]}&lines=${line}` }),
      );
      await waitFor(() => expect(hidden(line)).toBe(false));
      // Only the fold with the line is opened
      expect(folded(v).length).toBe(other - 1);
    });

    it("keeps the folds a line link does not land in", async () => {
      const { router } = open(jsonRoute);
      const v = await view();
      const before = folded(v).length;
      const infoLine = v.state.doc.lineAt(
        v.state.doc.toString().indexOf('"title"'),
      ).number;
      await act(() =>
        router.navigate({
          search: `${jsonRoute.split("?")[1]}&lines=${infoLine}`,
        }),
      );
      expect(folded(v).length).toBe(before);
    });

    it("does not fold when opened on lines", async () => {
      open(`${jsonRoute}&lines=3`);
      const v = await view();
      expect(folded(v)).toEqual([]);
    });

    it("does not fold a restored draft", async () => {
      const { user } = open(jsonRoute);
      const first = await view();
      const text = first.state.doc.toString();
      await setText(text.replace('"title"', '"title" ,,'));
      await waitFor(() => expect(status()).toHaveTextContent("syntax error"));
      await user.click(screen.getByRole("button", { name: "Forms" }));
      await user.click(screen.getByRole("tab", { name: "Trains" }));
      await user.click(screen.getByRole("button", { name: "JSON" }));
      const v = await view();
      expect(v.state.doc.toString()).toContain(",,");
      expect(folded(v)).toEqual([]);
    });

    it("folds again when the tab is left and come back to", async () => {
      const { user } = open(jsonRoute);
      const first = await view();
      const [range] = folded(first);
      expect(range).toBeDefined();
      unfoldAll(first);
      expect(folded(first)).toEqual([]);

      await user.click(screen.getByRole("button", { name: "Forms" }));
      await user.click(screen.getByRole("tab", { name: "Trains" }));
      await user.click(screen.getByRole("button", { name: "JSON" }));
      const v = await waitFor(async () => {
        const found = await view();
        if (found === first) throw new Error("same view");
        return found;
      });
      expect(folded(v).length).toBeGreaterThan(0);
    });
  });

  it("keys typed in the editor are not shortcuts", async () => {
    const { router } = open(jsonRoute);
    await cursorAfter('"info": {');
    const before = gameText(opened.getState().game);
    await realUser.keyboard("jec?[[");

    expect(router.state.location.search).toBe("?edit=true&editSection=json");
    expect(screen.getByRole("button", { name: "JSON" })).toHaveAttribute(
      "aria-pressed",
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
    const link = screen.getByRole("link", { name: "See all problems" });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("editSection=problems"),
    );
    expect(link).not.toHaveAttribute(
      "href",
      expect.stringContaining("/problems"),
    );
  });

  describe("next problem", () => {
    const nextButton = () =>
      screen.getByRole("button", { name: "Next problem" });

    it("cycles through the problems and wraps", async () => {
      open(jsonRoute);
      await cursorAfter('"info": {');
      await realUser.keyboard('"bogus": 1,');
      const v = await view();
      const text = v.state.doc.toString();
      const at = text.lastIndexOf("\n}");
      v.dispatch({ changes: { from: at, insert: ',\n"bogusTwo": 2' } });
      await waitFor(() => expect(diagnosticCount(v.state)).toBe(2), {
        timeout: 5000,
      });
      await waitFor(() =>
        expect(nextButton()).toHaveAttribute("aria-disabled", "false"),
      );
      v.dispatch({ selection: { anchor: 0 } });

      const heads = [];
      for (let i = 0; i < 3; i++) {
        await realUser.click(nextButton());
        heads.push(v.state.selection.main.from);
      }
      expect(heads[0]).toBeLessThan(heads[1]);
      expect(heads[2]).toBe(heads[0]);
      expect(v.hasFocus).toBe(true);
    });

    it("goes to a syntax error", async () => {
      open(jsonRoute);
      await setText("{ not json");
      const v = await view();
      v.dispatch({ selection: { anchor: 0 } });
      await waitFor(() =>
        expect(nextButton()).toHaveAttribute("aria-disabled", "false"),
      );
      await realUser.click(nextButton());
      expect(v.state.selection.main.from).toBeGreaterThan(0);
      await waitFor(() => expect(pick(v, ".cm-tooltip-lint")).not.toBeNull());
    });

    it("does nothing without problems", async () => {
      open(jsonRoute);
      const v = await view();
      v.dispatch({ selection: { anchor: 5 } });
      // Let the linter run, so a problem would be found before the click
      forceLinting(v);
      await settled();
      expect(diagnosticCount(v.state)).toBe(0);
      expect(nextButton()).toHaveAttribute("aria-disabled", "true");
      // aria-disabled does not block clicks
      nextButton().click();
      expect(v.state.selection.main.from).toBe(5);
      expect(v.hasFocus).toBe(false);
    });
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

    it("escape closes an open tooltip first and keeps the panel", async () => {
      const { user } = open(jsonRoute);
      await setText("{ not json");
      const v = await view();
      await waitFor(() => expect(diagnosticCount(v.state)).toBeGreaterThan(0));
      const mark = await waitFor(() => {
        const found = pick(v, ".cm-lintRange");
        if (!found) throw new Error("no mark yet");
        return found;
      });
      await realUser.hover(mark);
      await waitFor(() => expect(pick(v, ".cm-tooltip")).toBeTruthy());
      v.contentDOM.focus();

      await user.keyboard("{Escape}");
      await waitFor(() => expect(pick(v, ".cm-tooltip")).toBeNull());
      expect(screen.getByTestId("edit-panel")).toBeInTheDocument();
    });

    it("shift-alt-f formats valid text and ignores text that is not valid yet", async () => {
      open(jsonRoute);
      const v = await view();
      const game = JSON.parse(v.state.doc.toString());
      await setText(JSON.stringify(game));
      v.contentDOM.focus();
      await realUser.keyboard("{Shift>}{Alt>}F{/Alt}{/Shift}");
      expect(v.state.doc.toString()).toBe(JSON.stringify(game, null, 2));

      // The text is broken and the status has not caught up yet
      const errors = [];
      const onError = (event) => errors.push(event.message);
      window.addEventListener("error", onError);
      await setText("{");
      await realUser.keyboard("{Shift>}{Alt>}F{/Alt}{/Shift}");
      window.removeEventListener("error", onError);
      expect(errors).toEqual([]);
      expect(v.state.doc.toString()).toBe("{");
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

      await user.click(screen.getByRole("button", { name: "Forms" }));
      await user.click(screen.getByRole("tab", { name: "Trains" }));
      await user.click(screen.getByRole("button", { name: "JSON" }));
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

    it("says the game changed when a draft comes back after an edit elsewhere", async () => {
      const { user } = open(jsonRoute);
      await setText("{ draft");
      await waitFor(() => expect(status()).toHaveTextContent("syntax error"));
      await user.click(
        screen.getByRole("button", { name: "Close the edit panel" }),
      );
      await waitFor(() =>
        expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
      );
      act(() => {
        opened.dispatch(
          editGame((game) => ({
            ...game,
            info: { ...game.info, title: "Elsewhere" },
          })),
        );
      });
      await user.keyboard("j");
      expect((await view()).state.doc.toString()).toBe("{ draft");
      await waitFor(() =>
        expect(status()).toHaveTextContent("changed elsewhere"),
      );
    });

    it("applies typing that waits when the tab is left", async () => {
      const { user } = open(jsonRoute);
      await cursorAfter('"title": "18Test');
      await realUser.keyboard("Y");
      await user.click(screen.getByRole("button", { name: "Forms" }));
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

  it("starts a new view for another game, undo does not bring back old text", async () => {
    const { router } = open(jsonRoute);
    const first = await view();
    expect(first.state.doc.toString()).toContain("18Test");

    await act(async () => {
      await router.navigate(`/games/1889/map?edit=true&editSection=json`);
    });
    const second = await waitFor(async () => {
      const found = await view();
      if (found === first) throw new Error("same view");
      return found;
    });
    await waitFor(() => expect(second.state.doc.toString()).toContain("1889"));
    const text = second.state.doc.toString();
    expect(undo(second)).toBe(false);
    expect(second.state.doc.toString()).toBe(text);
    expect(text).not.toContain('"title": "18Test"');
  });

  describe("a big game", () => {
    it("applies a keystroke, slows the debounce and keeps the unchanged parts", async () => {
      const [largest] = Object.values(games).sort(
        (a, b) => JSON.stringify(b).length - JSON.stringify(a).length,
      );
      open(jsonRoute, undefined, largest);
      const before = opened.getState().game;
      const v = await cursorAfter('"title": "');
      await realUser.keyboard("X");

      await waitFor(
        () => expect(opened.getState().game.info.title).toMatch(/^X/),
        { timeout: 10000 },
      );
      const after = opened.getState().game;
      for (const key of Object.keys(before).filter((k) => k !== "info")) {
        expect(after[key]).toBe(before[key]);
      }
      expect(after.info).not.toBe(before.info);
      expect(v.state.doc.toString()).toContain('"title": "X');
      expect(debounceDelay(1000)).toBeGreaterThan(MIN_DELAY);
    });
  });

  it("shows the route error when the page cannot draw and the panel is closed", async () => {
    allowConsole(/./);
    open(route, undefined, games["18Test"], { map: 5 });
    await screen.findByTestId("route-error");
    expect(screen.queryByTestId("render-error")).not.toBeInTheDocument();
  });

  it("draws the page again when the page changes", async () => {
    allowConsole(/./);
    const { router } = open(jsonRoute, undefined, games["18Test"], { map: 5 });
    await screen.findByTestId("render-error");

    await act(async () => {
      await router.navigate("/games/internal:abc/tokens?edit=true");
    });
    await waitFor(() =>
      expect(screen.queryByTestId("render-error")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("game-internal:abc-tokens")).toBeInTheDocument();
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
