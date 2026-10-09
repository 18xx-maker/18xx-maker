import { EditorView } from "@codemirror/view";
import {
  act,
  createEvent,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { page as browser, userEvent as realUser } from "vitest/browser";

import games from "@/data/games";
import { clearSaveConflict } from "@/hooks";
import { createSetExportSheetOpen, createSetGame, editGame } from "@/state";
import capability from "@/util/capability";
import * as opfs from "@/util/storage/opfs";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/util/storage/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  peekGame: vi.fn(),
  overwriteGame: vi.fn(),
  saveGameAs: vi.fn(),
  loadSummaries: vi.fn(async () => ({})),
}));

const internal = () => ({
  ...structuredClone(games["18Test"]),
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
});

const open = (route, extra = {}, game = internal()) =>
  renderApp(route, {
    game,
    gameOriginal: structuredClone(game),
    gameHistory: [],
    loadedGame: {
      slug: game.meta.slug,
      title: game.info.title,
      id: game.meta.id,
    },
    ...extra,
  });

const rename = (store, title) =>
  act(() =>
    store.dispatch(editGame((g) => ({ ...g, info: { ...g.info, title } }))),
  );

// Sends the key to the element and says whether the page kept the event
const press = (target, init) => {
  const event = createEvent.keyDown(target, {
    key: "s",
    bubbles: true,
    cancelable: true,
    ...init,
  });
  fireEvent(target, event);
  return event.defaultPrevented;
};

const saved = () => opfs.overwriteGame.mock.calls.length;

const original = { ...capability, apis: { ...capability.apis } };

beforeEach(async () => {
  await browser.viewport(1280, 900);
  vi.resetAllMocks();
  delete window.api;
  opfs.peekGame.mockResolvedValue(internal());
  opfs.loadSummaries.mockResolvedValue({});
  clearSaveConflict();
});

afterEach(() => {
  Object.assign(capability, original);
});

// The app's File menu: Save calls back what the page registered with onSave
const openInApp = (route, extra) => {
  Object.assign(capability, { electron: true });
  const noop = vi.fn();
  let menuSave;
  window.api = {
    onAlert: noop,
    onAssets: noop,
    onProgress: noop,
    onRedirect: noop,
    onSave: (callback) => {
      menuSave = callback;
    },
    onMenu: noop,
    setLanguage: noop,
    onGame: noop,
    onUpdate: noop,
    onDownloadProgress: noop,
    off: noop,
    loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
    addRecent: vi.fn(),
    loadSummaries: vi.fn(async () => ({ electron: {} })),
  };
  const view = open(route, extra);
  return { ...view, menuSave: () => act(() => menuSave()) };
};

describe("the toolbar save button", () => {
  it("is there only while the game has changes, and saves", async () => {
    const { store, user } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    expect(screen.queryByTestId("toolbar-save")).not.toBeInTheDocument();

    await rename(store, "Renamed Game");
    await user.click(await screen.findByTestId("toolbar-save"));

    await waitFor(() => expect(saved()).toBe(1));
    expect(JSON.parse(opfs.overwriteGame.mock.calls[0][1]).info.title).toBe(
      "Renamed Game",
    );
    await waitFor(() =>
      expect(screen.queryByTestId("toolbar-save")).not.toBeInTheDocument(),
    );
  });

  it("is Save as for a bundled game", async () => {
    Object.assign(capability, {
      electron: false,
      system: false,
      internal: true,
    });
    const { store, user } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    await rename(store, "Renamed Game");

    const button = await screen.findByTestId("toolbar-save");
    expect(button).toHaveTextContent("Save as...");
    await user.click(button);
    expect(
      await screen.findByRole("dialog", { name: "Save as" }),
    ).toBeInTheDocument();
    expect(saved()).toBe(0);
  });
});

describe("Cmd and Ctrl + S", () => {
  it.for([{ metaKey: true }, { ctrlKey: true }])(
    "saves a changed game with %o",
    async (init) => {
      const { store } = open("/games/internal:abc/map");
      await screen.findByTestId("game-internal:abc-map");
      await rename(store, "Renamed Game");

      expect(press(document.body, init)).toBe(true);
      await waitFor(() => expect(saved()).toBe(1));
    },
  );

  it("does nothing but keep the browser from saving the page when nothing changed", async () => {
    open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");

    expect(press(document.body, { metaKey: true })).toBe(true);
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("leaves other pages and other keys alone", async () => {
    open("/docs");
    await screen.findByTestId("docs-index").catch(() => null);
    expect(press(document.body, { metaKey: true })).toBe(false);

    open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    expect(press(document.body, { metaKey: true, shiftKey: true })).toBe(false);
    expect(press(document.body, { metaKey: true, altKey: true })).toBe(false);
    expect(press(document.body, { key: "s" })).toBe(false);
  });

  it("commits a field being edited first, and gives the focus back", async () => {
    const { store } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");

    // A field that commits on blur, like the edit forms
    const field = document.createElement("input");
    field.addEventListener("blur", () => rename(store, "From the field"));
    document.body.append(field);
    field.focus();

    press(field, { ctrlKey: true });

    await waitFor(() => expect(saved()).toBe(1));
    expect(JSON.parse(opfs.overwriteGame.mock.calls[0][1]).info.title).toBe(
      "From the field",
    );
    await waitFor(() => expect(field).toHaveFocus());
    field.remove();
  });

  it("saves once for a repeated key and a double press", async () => {
    const { store } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    press(document.body, { metaKey: true, repeat: true });
    press(document.body, { metaKey: true });
    press(document.body, { metaKey: true });

    await waitFor(() => expect(saved()).toBe(1));
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(1);
    expect(screen.queryByTestId("changes-conflict")).not.toBeInTheDocument();
  });

  it("does not save while a dialog is open", async () => {
    const { store, user } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    await user.keyboard("?");
    await screen.findByTestId("shortcuts");
    expect(press(document.body, { metaKey: true })).toBe(true);
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("does not save while the export sheet is open", async () => {
    const { store } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");
    act(() => store.dispatch(createSetExportSheetOpen(true)));

    expect(press(document.body, { metaKey: true })).toBe(true);
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("in the Vim editor keeps the page and the menu from saving", async () => {
    const { store } = open("/games/internal:abc/map", {
      settings: { editorKeys: "vim" },
    });
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");
    const editor = document.createElement("div");
    editor.className = "cm-editor";
    document.body.append(editor);

    // Kept from the menu accelerator
    expect(press(editor, { ctrlKey: true })).toBe(true);
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
    editor.remove();
  });

  it("takes the key of a layout without a Latin s", async () => {
    const { store } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    expect(
      press(document.body, { metaKey: true, key: "ы", code: "KeyS" }),
    ).toBe(true);
    await waitFor(() => expect(saved()).toBe(1));
  });

  it("leaves a Latin letter on the S key of another layout alone", async () => {
    open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    expect(
      press(document.body, { metaKey: true, key: "o", code: "KeyS" }),
    ).toBe(false);
  });

  it("is listed in the shortcuts", async () => {
    const { user } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await user.keyboard("?");
    const dialog = await screen.findByTestId("shortcuts");
    expect(dialog).toHaveTextContent("Save the game to its file");
    expect(dialog).toHaveTextContent("Ctrl+S");
  });

  it("does not save in the print view", async () => {
    const { store } = open("/games/internal:abc/map?print=true");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    press(document.body, { metaKey: true });
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("goes to the Changes page when the file changed outside", async () => {
    const changed = internal();
    changed.info.title = "Changed elsewhere";
    opfs.peekGame.mockResolvedValue(changed);
    const { store, router } = open("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    press(document.body, { metaKey: true });

    await screen.findByTestId("changes-conflict");
    expect(router.state.location.pathname).toBe("/games/internal:abc/changes");
    expect(saved()).toBe(0);
  });

  it("shows the conflict when already on the Changes page", async () => {
    const changed = internal();
    changed.info.title = "Changed elsewhere";
    opfs.peekGame.mockResolvedValue(changed);
    const { store, router } = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(store, "Renamed Game");
    expect(screen.queryByTestId("changes-conflict")).not.toBeInTheDocument();

    press(document.body, { ctrlKey: true });

    await screen.findByTestId("changes-conflict");
    expect(router.state.location.pathname).toBe("/games/internal:abc/changes");
  });

  it("opens the save dialog for a bundled game", async () => {
    Object.assign(capability, {
      electron: false,
      system: false,
      internal: true,
    });
    const { store } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");
    await rename(store, "Renamed Game");

    press(document.body, { metaKey: true });

    expect(
      await screen.findByRole("dialog", { name: "Save as" }),
    ).toBeInTheDocument();
  });

  it.for(["emacs", "vim"])(
    "leaves Ctrl+S in the %s editor to the editor",
    async (editorKeys) => {
      const { store } = open("/games/internal:abc/map", {
        settings: { editorKeys },
      });
      await screen.findByTestId("game-internal:abc-map");
      await rename(store, "Renamed Game");

      const editor = document.createElement("div");
      editor.className = "cm-editor";
      document.body.append(editor);

      // Kept from the menu accelerator, but not saved
      expect(press(editor, { ctrlKey: true })).toBe(true);
      await act(() => new Promise((r) => setTimeout(r, 100)));
      expect(saved()).toBe(0);

      // Cmd+S is still the app's
      expect(press(editor, { metaKey: true })).toBe(true);
      await waitFor(() => expect(saved()).toBe(1));
      editor.remove();
    },
  );

  it("saves after the JSON editor has applied its text", async () => {
    // The editor applies its text outside of any act
    globalThis.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      open("/games/internal:abc/map?edit=true&editSection=json");
      const host = await screen.findByTestId("json-editor");
      const editor = await waitFor(() => {
        const found = EditorView.findFromDOM(host);
        if (!found) throw new Error("no editor yet");
        return found;
      });

      const edited = internal();
      edited.info.title = "Typed title";
      const { meta, ...text } = edited;
      expect(meta).toBeDefined();
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: JSON.stringify(text, null, 2),
        },
      });
      editor.contentDOM.focus();
      await realUser.keyboard("{Control>}s{/Control}");

      await waitFor(() => expect(saved()).toBe(1));
      expect(JSON.parse(opfs.overwriteGame.mock.calls[0][1]).info.title).toBe(
        "Typed title",
      );
    } finally {
      globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    }
  });
});

describe("the File menu save", () => {
  it("saves a changed game of a game page", async () => {
    const { store, menuSave } = openInApp("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    await menuSave();
    await waitFor(() => expect(saved()).toBe(1));
  });

  it("does nothing outside of a game page", async () => {
    const { store, menuSave } = openInApp("/docs");
    await rename(store, "Renamed Game");

    await menuSave();
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("does nothing while a dialog is open", async () => {
    const { store, user, menuSave } = openInApp("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    await user.keyboard("?");
    await screen.findByTestId("shortcuts");
    await menuSave();
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("does nothing while the export sheet is open", async () => {
    const { store, menuSave } = openInApp("/games/internal:abc/map");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");
    act(() => store.dispatch(createSetExportSheetOpen(true)));

    await menuSave();
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });

  it("does nothing in the print view", async () => {
    const { store, menuSave } = openInApp("/games/internal:abc/map?print=true");
    await screen.findByTestId("game-internal:abc-map");
    await rename(store, "Renamed Game");

    await menuSave();
    await act(() => new Promise((r) => setTimeout(r, 100)));
    expect(saved()).toBe(0);
  });
});

describe("the conflict", () => {
  const conflicted = async () => {
    const changed = internal();
    changed.info.title = "Changed elsewhere";
    opfs.peekGame.mockResolvedValue(changed);
    const view = open("/games/internal:abc/changes");
    await screen.findByTestId("game-internal:abc-changes");
    await rename(view.store, "Renamed Game");
    press(document.body, { ctrlKey: true });
    await screen.findByTestId("changes-conflict");
    return { ...view, changed };
  };

  it("goes with Revert", async () => {
    const { store, user } = await conflicted();
    await user.click(screen.getByRole("button", { name: /Revert/ }));
    await rename(store, "Renamed Again");
    expect(await screen.findByRole("button", { name: "Save" })).toBeVisible();
    expect(screen.queryByTestId("changes-conflict")).not.toBeInTheDocument();
  });

  it("goes when the file is refreshed", async () => {
    const { store, changed } = await conflicted();
    act(() => store.dispatch(createSetGame(changed, { keepEdits: true })));
    expect(screen.queryByTestId("changes-conflict")).not.toBeInTheDocument();
    expect(store.getState().game.info.title).toBe("Renamed Game");
  });
});
