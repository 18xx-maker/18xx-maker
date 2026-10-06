import { undo } from "@codemirror/commands";
import { EditorView } from "@codemirror/view";
import { act, screen, waitFor } from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import games from "@/data/games";
import { createSetEditorKeys } from "@/state";
import { gameText } from "@/util/download";

import { renderApp } from "@tests/support/helpers.jsx";

// Mod is Cmd on macOS and Ctrl elsewhere
const MOD = /Mac/.test(navigator.platform) ? "Meta" : "Control";
const key = (name, { shift = false } = {}) =>
  `{${MOD}>}${shift ? "{Shift>}" : ""}${name}${shift ? "{/Shift}" : ""}{/${MOD}}`;

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
    await realUser.keyboard(key("F", { shift: true }));
    expect(v.state.doc.toString()).toBe(PRETTY);

    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: COMPACT },
    });
    await realUser.keyboard("{Shift>}{Alt>}F{/Alt}{/Shift}");
    expect(v.state.doc.toString()).toBe(PRETTY);
  });

  it("apply the text to the game with Ctrl-S", async () => {
    const { store } = open();
    await compact();
    await realUser.keyboard(key("s"));
    expect(store.getState().game.info.title).toBe("Compact");
  });

  it("open the search panel with Ctrl-F", async () => {
    open();
    const v = await compact();
    await realUser.keyboard(key("f"));
    // eslint-disable-next-line testing-library/no-node-access
    expect(v.dom.querySelector(".cm-search")).not.toBeNull();
    // Escape closes the panel before it leaves the editor
    await realUser.keyboard("{Escape}");
    // eslint-disable-next-line testing-library/no-node-access
    expect(v.dom.querySelector(".cm-search")).toBeNull();
  });

  it("do nothing while the editor is not focused", async () => {
    const { store } = open();
    const v = await compact();
    v.contentDOM.blur();
    store.dispatch({ type: "noop" });
    await realUser.keyboard(key("F", { shift: true }));
    expect(v.state.doc.toString()).toBe(COMPACT);
  });

  it("leave undo to the editor", async () => {
    open();
    const v = await compact();
    await realUser.keyboard(key("F", { shift: true }));
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
    await realUser.keyboard(":");
    await realUser.keyboard("format");
    console.log(
      "A2",
      document.activeElement.tagName,
      document.activeElement.value,
    );
    await realUser.keyboard("{Enter}");
    await waitFor(() => expect(v.state.doc.toString()).toBe(PRETTY));
    v.dispatch({
      changes: { from: 0, to: v.state.doc.length, insert: COMPACT },
    });
    v.focus();
    await realUser.keyboard(":w{Enter}");
    await waitFor(() =>
      expect(store.getState().game.info.title).toBe("Compact"),
    );
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
    await realUser.keyboard(key("F", { shift: true }));
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
