import { act, screen, waitFor, within } from "@testing-library/react";
import { page as browser } from "vitest/browser";

import games from "@/data/games";
import { editGame } from "@/state";
import capability from "@/util/capability";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/util/storage/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  saveGameAs: vi.fn(),
  loadSummaries: vi.fn(async () => ({})),
}));
vi.mock("@/util/storage/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  createGameFile: vi.fn(),
  loadSummaries: vi.fn(async () => ({})),
}));

const original = { ...capability, apis: { ...capability.apis } };

const where = (backend) =>
  Object.assign(capability, {
    electron: backend === "electron",
    system: backend === "picker",
    internal: backend === "internal",
    apis: { ...original.apis, save_file_picker: backend === "picker" },
  });

// What loading the saved copy gives: the game as it was saved
const savedCopy = (type, id, text) => ({
  ...JSON.parse(text),
  meta: { id, type, slug: `${type}:${id}` },
});

const rename = (store, title) =>
  act(() =>
    store.dispatch(editGame((g) => ({ ...g, info: { ...g.info, title } }))),
  );

const trigger = () => screen.getByRole("button", { name: "Toggle Sidebar" });

// Opens the sidebar and clicks Save as, which closes the sidebar on a phone
const openSaveAs = async (user) => {
  await user.click(trigger());
  const panel = await screen.findByRole("dialog", { name: "Sidebar" });
  await user.click(within(panel).getByRole("button", { name: "Save as..." }));
};

beforeEach(async () => {
  await browser.viewport(414, 896);
  vi.clearAllMocks();
});

afterEach(() => {
  Object.assign(capability, original);
});

// The app is unmounted after each test and calls the api of the app then
afterAll(() => {
  delete window.api;
});

describe("save as in the private file system", () => {
  beforeEach(() => where("internal"));

  it("asks for a name, saves the game with its edits and opens the copy", async () => {
    opfs.saveGameAs.mockResolvedValue("internal:18test");
    opfs.loadGame.mockImplementation(async (id) =>
      savedCopy("internal", id, opfs.saveGameAs.mock.calls[0][1]),
    );
    const { store, user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await rename(store, "Renamed Game");

    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    const input = within(dialog).getByLabelText("File name");
    expect(input).toHaveValue("renamed-game.json");
    expect(input).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:18test"),
    );
    expect(opfs.saveGameAs).toHaveBeenCalledWith(
      "renamed-game.json",
      expect.stringContaining("Renamed Game"),
      { overwrite: false },
    );
    expect(JSON.parse(opfs.saveGameAs.mock.calls[0][1]).meta).toBeUndefined();
    await screen.findByTestId("game-internal:18test");
    expect(store.getState().game.meta.slug).toBe("internal:18test");
    expect(store.getState().game.info.title).toBe("Renamed Game");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // The bundled game itself is untouched
    expect(games["18Test"].info.title).not.toBe("Renamed Game");
  });

  it("continues on the copy's map when saved from another page", async () => {
    opfs.saveGameAs.mockResolvedValue("internal:18test");
    opfs.loadGame.mockImplementation(async (id) =>
      savedCopy("internal", id, opfs.saveGameAs.mock.calls[0][1]),
    );
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await act(() => router.navigate("/settings"));
    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:18test/map"),
    );
  });

  it("does not save without a usable name", async () => {
    const { user } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    const input = within(dialog).getByLabelText("File name");
    const save = within(dialog).getByRole("button", { name: "Save" });

    await user.clear(input);
    expect(save).toBeDisabled();
    await user.type(input, "???");
    expect(save).toBeDisabled();
    await user.type(input, "ok");
    expect(save).toBeEnabled();
    expect(opfs.saveGameAs).not.toHaveBeenCalled();
  });

  it("asks before it replaces a game with the same name", async () => {
    opfs.saveGameAs.mockRejectedValueOnce(
      Object.assign(new Error("exists"), { code: "exists" }),
    );
    opfs.saveGameAs.mockResolvedValueOnce("internal:18test");
    opfs.loadGame.mockImplementation(async (id) =>
      savedCopy("internal", id, opfs.saveGameAs.mock.calls[1][1]),
    );
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });

    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "already exists",
    );
    expect(router.state.location.pathname).toBe("/games/18Test");
    await user.click(within(dialog).getByRole("button", { name: "Replace" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:18test"),
    );
    expect(opfs.saveGameAs.mock.calls[1][2]).toEqual({ overwrite: true });
  });

  it("clears the message when the name changes", async () => {
    opfs.saveGameAs.mockRejectedValue(
      Object.assign(new Error("exists"), { code: "exists" }),
    );
    const { user } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await within(dialog).findByRole("alert");

    await user.type(within(dialog).getByLabelText("File name"), "2");

    expect(within(dialog).queryByRole("alert")).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Save" }),
    ).toBeInTheDocument();
  });

  it("closes without saving on Cancel and keeps the game", async () => {
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(opfs.saveGameAs).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe("/games/18Test");
  });

  it("keeps the edits and the dialog's page when saving fails", async () => {
    opfs.saveGameAs.mockRejectedValue(new Error("disk full"));
    const { store, user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await rename(store, "Renamed Game");
    await openSaveAs(user);
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(await screen.findByText("disk full")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/games/18Test");
    expect(store.getState().game.info.title).toBe("Renamed Game");
  });

  it("is on the Changes page of an edited game instead of Save", async () => {
    opfs.saveGameAs.mockResolvedValue("internal:18test");
    opfs.loadGame.mockImplementation(async (id) =>
      savedCopy("internal", id, opfs.saveGameAs.mock.calls[0][1]),
    );
    const { store, user, router } = renderApp("/games/18Test/changes");
    const page = await screen.findByTestId("game-18Test-changes");
    expect(
      within(page).queryByRole("button", { name: "Save as..." }),
    ).not.toBeInTheDocument();
    await rename(store, "Renamed Game");

    expect(
      within(page).queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
    await user.click(
      await within(page).findByRole("button", { name: "Save as..." }),
    );
    const dialog = await screen.findByRole("dialog", { name: "Save as" });
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        "/games/internal:18test/changes",
      ),
    );
    expect(await screen.findByText(/No changes/)).toBeInTheDocument();
    expect(store.getState().game.info.title).toBe("Renamed Game");
  });

  it("is not offered for a game that has a file", async () => {
    opfs.loadGame.mockResolvedValue({
      ...structuredClone(games["18Test"]),
      meta: { id: "abc", type: "internal", slug: "internal:abc" },
    });
    const { user } = renderApp("/games/internal:abc");
    await screen.findByTestId("game-internal:abc");
    await user.click(trigger());
    const panel = await screen.findByRole("dialog", { name: "Sidebar" });
    expect(
      within(panel).queryByRole("button", { name: "Save as..." }),
    ).not.toBeInTheDocument();
  });
});

describe("save as without anywhere to save", () => {
  it("is not offered", async () => {
    where(undefined);
    const { user } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");
    await user.click(trigger());
    const panel = await screen.findByRole("dialog", { name: "Sidebar" });
    expect(
      within(panel).getByRole("button", { name: "Download" }),
    ).toBeVisible();
    expect(
      within(panel).queryByRole("button", { name: "Save as..." }),
    ).not.toBeInTheDocument();
  });
});

describe("save as with a file picker", () => {
  it("opens the picker straight from the click and continues on the copy", async () => {
    where("picker");
    idb.createGameFile.mockResolvedValue("system:abc");
    idb.loadGame.mockImplementation(async (id) => ({
      ...structuredClone(games["18Test"]),
      meta: { id, type: "system", slug: `system:${id}` },
    }));
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    await openSaveAs(user);

    // No dialog of our own: the browser's picker asks for the name
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(idb.createGameFile).toHaveBeenCalledWith(
      expect.stringContaining('"title"'),
      "18test.json",
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/system:abc"),
    );
  });

  it("stays where it is when the picker is cancelled", async () => {
    where("picker");
    idb.createGameFile.mockResolvedValue(undefined);
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    await openSaveAs(user);

    await waitFor(() => expect(idb.createGameFile).toHaveBeenCalled());
    expect(router.state.location.pathname).toBe("/games/18Test");
  });
});

describe("save as in the app", () => {
  it("asks the app with the translated dialog labels and opens the copy", async () => {
    where("electron");
    const noop = vi.fn();
    window.api = {
      onAlert: noop,
      onProgress: noop,
      onRedirect: noop,
      onSave: noop,
      onMenu: noop,
      setLanguage: noop,
      onGame: noop,
      onUpdate: noop,
      onDownloadProgress: noop,
      off: noop,
      loadPlatformAndVersions: () => ({ platform: "darwin", versions: {} }),
      saveGameAs: vi.fn(async () => "electron:abc"),
      loadGame: vi.fn(async (id) => ({
        ...structuredClone(games["18Test"]),
        meta: { id, type: "electron", slug: `electron:${id}` },
      })),
      addRecent: vi.fn(),
      loadSummaries: vi.fn(async () => ({ electron: {} })),
    };
    const { user, router } = renderApp("/games/18Test");
    await screen.findByTestId("game-18Test");

    await openSaveAs(user);

    expect(window.api.saveGameAs).toHaveBeenCalledWith(
      "18test",
      expect.stringContaining('"title"'),
      "Save as",
      "18xx-maker Game",
    );
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/electron:abc"),
    );
    await waitFor(() =>
      expect(window.api.addRecent).toHaveBeenCalledWith(
        expect.any(String),
        "electron:abc",
      ),
    );
  });
});
