import { undo } from "@codemirror/commands";
import { foldedRanges } from "@codemirror/language";
import { forEachDiagnostic } from "@codemirror/lint";
import { SearchQuery, setSearchQuery } from "@codemirror/search";
import { EditorView } from "@codemirror/view";
import { act, screen, waitFor } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";
import { createSetEditorKeys } from "@/state";
import { gameText } from "@/util/download";

import { renderApp } from "@tests/support/helpers.jsx";

// A key sent to the editor itself: no real keyboard, which the tests running
// side by side do not all have
const press = (v, key, init = {}) =>
  v.contentDOM.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );

// Mod is Cmd on macOS and Ctrl elsewhere
const mod = { [/Mac/.test(navigator.platform) ? "metaKey" : "ctrlKey"]: true };
const pressMod = (v, key, init = {}) => press(v, key, { ...mod, ...init });

const route = "/games/internal:abc/map?edit=true&editSection=json";

const open = (keys) => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  return renderApp(route, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
    settings: keys ? { editorKeys: keys } : {},
  });
};

const view = async () => {
  const host = await screen.findByTestId("json-editor");
  return waitFor(() => {
    const found = EditorView.findFromDOM(host);
    if (!found) throw new Error("no editor yet");
    return found;
  });
};

// The game as one line, with another title: Format and applying have
// something to do
const PRETTY = gameText({
  ...structuredClone(games["18Test"]),
  info: { ...games["18Test"].info, title: "Compact" },
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
});
const COMPACT = JSON.stringify(JSON.parse(PRETTY));

const compact = async () => {
  const v = await view();
  v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: COMPACT } });
  v.focus();
  return v;
};

// An Ex command typed at the prompt of Vim
const ex = (v, command) => {
  press(v, ":");
  // eslint-disable-next-line testing-library/no-node-access
  const input = v.dom.querySelector("input");
  input.value = command;
  input.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      keyCode: 13,
      bubbles: true,
      cancelable: true,
    }),
  );
};

// A text with a syntax error, once the linter has found it
const BROKEN = '{"a": 1,}';
const withProblem = async () => {
  const v = await view();
  v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: BROKEN } });
  v.dispatch({ selection: { anchor: 0 } });
  v.focus();
  await waitFor(() => expect(problemAt(v)).toBeGreaterThan(0));
  return v;
};
const problemAt = (v) => {
  let from = -1;
  forEachDiagnostic(v.state, (d, start) => {
    from = start;
  });
  return from;
};

// The mode of the keys is on the view once its extension is loaded
const ready = (v, check) => waitFor(() => expect(check(v)).toBe(true));
const hasVim = (v) => !!v.cm;
// The editor applies typing after a pause, outside of any act
beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  await browser.viewport(1280, 900);
});
afterEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  await waitFor(() => {}, { timeout: 50 });
});

describe("normal keys", () => {
  it("format the text with Ctrl-Shift-F and Shift-Alt-F", async () => {
    open();
    const v = await compact();
    pressMod(v, "F", { shiftKey: true });
    expect(v.state.doc.toString()).toBe(PRETTY);

    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: COMPACT },
    });
    press(v, "F", { shiftKey: true, altKey: true });
    expect(v.state.doc.toString()).toBe(PRETTY);
  });

  it("apply the text to the game with Ctrl-S", async () => {
    const { store } = open();
    const v = await compact();
    pressMod(v, "s");
    expect(store.getState().game.info.title).toBe("Compact");
  });

  it("open the search panel with Ctrl-F", async () => {
    open();
    const v = await compact();
    pressMod(v, "f");
    // eslint-disable-next-line testing-library/no-node-access
    expect(v.dom.querySelector(".cm-search")).not.toBeNull();
    // Escape closes the panel before it leaves the editor
    press(v, "Escape");
    // eslint-disable-next-line testing-library/no-node-access
    expect(v.dom.querySelector(".cm-search")).toBeNull();
  });

  it("go to the next match with Ctrl-G and the previous with Shift-Ctrl-G", async () => {
    open();
    const v = await compact();
    const doc = v.state.doc.toString();
    const at = [...doc.matchAll(/"name"/g)].map((m) => m.index);
    expect(at.length).toBeGreaterThan(2);
    // The search loads with its panel
    pressMod(v, "f");
    v.dispatch({
      effects: setSearchQuery.of(new SearchQuery({ search: '"name"' })),
      selection: { anchor: 0 },
    });
    const head = () => v.state.selection.main.from;
    pressMod(v, "g");
    expect(head()).toBe(at[0]);
    pressMod(v, "g");
    expect(head()).toBe(at[1]);
    pressMod(v, "G", { shiftKey: true });
    expect(head()).toBe(at[0]);
  });

  it("go to the next and previous problem with F8 and Shift-F8", async () => {
    open();
    const v = await withProblem();
    press(v, "F8");
    expect(v.state.selection.main.from).toBe(problemAt(v));
    v.dispatch({ selection: { anchor: 0 } });
    press(v, "F8", { shiftKey: true });
    expect(v.state.selection.main.from).toBe(problemAt(v));
  });

  it("leave undo to the editor", async () => {
    open();
    const v = await compact();
    pressMod(v, "F", { shiftKey: true });
    undo(v);
    expect(v.state.doc.toString()).not.toBe(PRETTY);
  });
});

describe("emacs keys", () => {
  it("format with C-c C-f, apply with C-x C-s", async () => {
    const { store } = open("emacs");
    const v = await compact();
    await waitFor(() => expect(v.scrollDOM).toHaveClass("cm-emacsMode"));
    press(v, "c", { ctrlKey: true });
    press(v, "f", { ctrlKey: true });
    expect(v.state.doc.toString()).toBe(PRETTY);
    press(v, "x", { ctrlKey: true });
    press(v, "s", { ctrlKey: true });
    expect(store.getState().game.info.title).toBe("Compact");
  });

  it("go to the next and previous problem with M-g n and M-g p", async () => {
    open("emacs");
    const v = await withProblem();
    await waitFor(() => expect(v.scrollDOM).toHaveClass("cm-emacsMode"));
    press(v, "g", { altKey: true });
    press(v, "n");
    expect(v.state.selection.main.from).toBe(problemAt(v));
    v.dispatch({ selection: { anchor: 0 } });
    press(v, "g", { altKey: true });
    press(v, "p");
    expect(v.state.selection.main.from).toBe(problemAt(v));
  });

  it("leave the editor with Escape", async () => {
    open("emacs");
    const v = await compact();
    await waitFor(() => expect(v.scrollDOM).toHaveClass("cm-emacsMode"));
    const blur = vi.spyOn(v.contentDOM, "blur");
    press(v, "Escape");
    expect(blur).toHaveBeenCalled();
  });
});

describe("vim keys", () => {
  it("format with :format and apply with :w", async () => {
    const { store } = open("vim");
    const v = await compact();
    await ready(v, hasVim);
    ex(v, "format");
    await waitFor(() => expect(v.state.doc.toString()).toBe(PRETTY));
    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: COMPACT },
    });
    ex(v, "w");
    await waitFor(() =>
      expect(store.getState().game.info.title).toBe("Compact"),
    );
  });

  it("go to the next and previous problem with ]d and [d", async () => {
    open("vim");
    const v = await withProblem();
    await ready(v, hasVim);
    press(v, "]");
    press(v, "d");
    expect(v.state.selection.main.from).toBe(problemAt(v));
    v.dispatch({ selection: { anchor: 0 } });
    press(v, "[");
    press(v, "d");
    expect(v.state.selection.main.from).toBe(problemAt(v));
  });

  it("fold everything with zM and unfold it with zR", async () => {
    open("vim");
    const v = await view();
    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: PRETTY },
    });
    v.focus();
    await ready(v, hasVim);
    press(v, "z");
    press(v, "R");
    expect(foldedRanges(v.state).size).toBe(0);
    press(v, "z");
    press(v, "M");
    expect(foldedRanges(v.state).size).toBeGreaterThan(0);
    press(v, "z");
    press(v, "R");
    expect(foldedRanges(v.state).size).toBe(0);
  });

  it("types only in insert mode and leaves with Escape when idle", async () => {
    open("vim");
    const v = await compact();
    await ready(v, hasVim);
    // Whether the editor was left, not where the focus is (tests run side by side)
    const blur = vi.spyOn(v.contentDOM, "blur");

    // A letter is a command, not text
    press(v, "j");
    expect(v.state.doc.toString()).toBe(COMPACT);

    // Escape from insert mode only ends the insert
    press(v, "i");
    expect(v.cm.state.vim.insertMode).toBe(true);
    press(v, "Escape");
    expect(v.cm.state.vim.insertMode).toBe(false);
    expect(blur).not.toHaveBeenCalled();

    // A pending command is cancelled by Escape, the editor stays
    press(v, "d");
    expect(v.cm.state.vim.inputState.operator).toBe("delete");
    press(v, "Escape");
    expect(v.cm.state.vim.inputState.operator).toBeNull();
    expect(blur).not.toHaveBeenCalled();

    // Nothing pending: Escape leaves
    press(v, "Escape");
    expect(blur).toHaveBeenCalled();
  });
});

describe("switching modes", () => {
  it("keeps the text and the undo history", async () => {
    const { store } = open();
    const v = await compact();
    pressMod(v, "F", { shiftKey: true });
    store.dispatch(createSetEditorKeys("vim"));
    await ready(v, hasVim);
    expect(v.state.doc.toString()).toBe(PRETTY);
    store.dispatch(createSetEditorKeys());
    await waitFor(() => expect(hasVim(v)).toBe(false));
    undo(v);
    expect(v.state.doc.toString()).not.toBe(PRETTY);
  });

  it("keeps the mode when the editor is rebuilt for another game", async () => {
    const { router } = open("vim");
    const first = await view();
    await ready(first, hasVim);
    await act(() =>
      router.navigate("/games/18Test/map?edit=true&editSection=json"),
    );
    const second = await waitFor(async () => {
      const found = await view();
      if (found === first) throw new Error("same editor");
      return found;
    });
    await ready(second, hasVim);
    expect(second).not.toBe(first);
  });
});
