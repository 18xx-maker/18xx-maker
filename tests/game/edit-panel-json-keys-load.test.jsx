import { EditorView } from "@codemirror/view";
import { act, screen, waitFor } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";
import { createSetEditorKeys } from "@/state";

import { renderApp } from "@tests/support/helpers.jsx";

// The Emacs and Vim modules are replaced: Vim loads when the test lets it
// (the gate of each test), Emacs never does
const gate = vi.hoisted(() => ({ release: undefined, ready: undefined }));

vi.mock("@/components/editPanel/editorVim", async () => {
  const { EditorView } = await import("@codemirror/view");
  await gate.ready;
  return { default: [EditorView.editorAttributes.of({ class: "mock-vim" })] };
});

vi.mock("@/components/editPanel/editorEmacs", () => ({
  get default() {
    throw new Error("chunk failed");
  },
}));

const open = () => {
  const game = {
    ...structuredClone(games["18Test"]),
    meta: { id: "abc", type: "internal", slug: "internal:abc" },
  };
  return renderApp("/games/internal:abc/map?edit=true&editSection=json", {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: { slug: game.meta.slug, title: game.info.title, id: "abc" },
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

beforeEach(async () => {
  // The mocked Vim module is made again, so it waits for this test's gate
  // whichever tests ran before
  vi.resetModules();
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  await browser.viewport(1280, 900);
  gate.ready = new Promise((resolve) => {
    gate.release = resolve;
  });
});
afterEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

describe("loading the key modes", () => {
  it("uses the normal keys and says so when a mode does not load", async () => {
    const { store } = open();
    const v = await view();
    act(() => {
      store.dispatch(createSetEditorKeys("emacs"));
    });
    expect(
      await screen.findByText(/keys could not be loaded/),
    ).toBeInTheDocument();

    // Normal keys: Escape leaves the editor
    v.focus();
    const blur = vi.spyOn(v.contentDOM, "blur");
    v.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(blur).toHaveBeenCalled();

    // Choosing another mode clears the message
    gate.release();
    act(() => {
      store.dispatch(createSetEditorKeys("vim"));
    });
    await waitFor(() =>
      expect(
        screen.queryByText(/keys could not be loaded/),
      ).not.toBeInTheDocument(),
    );
  });

  it("ignores a mode that loads after another was chosen", async () => {
    const { store } = open();
    const v = await view();
    act(() => {
      store.dispatch(createSetEditorKeys("vim"));
    });
    // Normal again while Vim is still loading
    act(() => {
      store.dispatch(createSetEditorKeys());
    });
    gate.release();
    await waitFor(() => {});
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(v.dom).not.toHaveClass("mock-vim");

    // Chosen again, it loads
    act(() => {
      store.dispatch(createSetEditorKeys("vim"));
    });
    await waitFor(() => expect(v.dom).toHaveClass("mock-vim"));
  });
});
