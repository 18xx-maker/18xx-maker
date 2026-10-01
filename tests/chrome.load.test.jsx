import { screen, waitFor, within } from "@testing-library/react";

import { games } from "@/data";
import capability from "@/util/capability";
import * as idb from "@/util/idb";
import * as opfs from "@/util/opfs";

import { renderApp } from "@tests/helpers.jsx";

vi.mock("@/util/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
  openFilePicker: vi.fn(),
}));
vi.mock("@/util/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  deleteGame: vi.fn(),
  loadSummaries: vi.fn(),
  saveGameFile: vi.fn(),
}));

const original = { ...capability };

const internalGame = {
  ...games["18Test"],
  meta: { id: "abc", type: "internal", slug: "internal:abc" },
};
const summary = {
  title: "Saved Game",
  subtitle: "Sub",
  designer: "Designer",
  publisher: "self",
  id: "abc",
  type: "internal",
  slug: "internal:abc",
};

beforeEach(() => {
  vi.clearAllMocks();
  // Browsers without the file system access api: the file input flow
  Object.assign(capability, { electron: false, system: false, internal: true });
  opfs.loadSummaries.mockResolvedValue({ "internal:abc": summary });
  idb.loadSummaries.mockResolvedValue({});
});

afterEach(() => {
  Object.assign(capability, original);
});

describe("load games page", () => {
  it("lists bundled and saved games from loaded summaries", async () => {
    const { store } = renderApp("/games/");
    expect(await screen.findByText("Saved Game")).toBeInTheDocument();
    expect(screen.getByText("Shikoku 1889")).toBeInTheDocument();

    expect(opfs.loadSummaries).toHaveBeenCalledTimes(1);
    // idb is not used without the file system access api
    expect(idb.loadSummaries).not.toHaveBeenCalled();
    expect(store.getState().summaries.internal).toEqual({
      "internal:abc": summary,
    });
    expect(store.getState().summaries.system).toBeUndefined();
  });

  it("saves a chosen file and opens the game", async () => {
    opfs.saveGameFile.mockResolvedValue("internal:abc");
    opfs.loadGame.mockResolvedValue(internalGame);
    const { user, router, store } = renderApp("/games/");
    await screen.findByText("Saved Game");

    const file = new File(["{}"], "game.json", { type: "application/json" });
    await user.upload(screen.getByLabelText("Open File"), file);

    expect(opfs.saveGameFile).toHaveBeenCalledWith(file);
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/internal:abc/map"),
    );
    await waitFor(() =>
      expect(store.getState().loadedGame).toMatchObject({
        id: "abc",
        type: "internal",
        slug: "internal:abc",
      }),
    );
    expect(opfs.loadGame).toHaveBeenCalledWith("abc");
    expect(store.getState().game.meta.slug).toBe("internal:abc");
    expect(await screen.findByText("Game Loaded")).toBeInTheDocument();
  });

  it("alerts when saving the file fails", async () => {
    opfs.saveGameFile.mockRejectedValue(new Error("disk full"));
    const { user, router } = renderApp("/games/");
    await screen.findByText("Saved Game");

    await user.upload(
      screen.getByLabelText("Open File"),
      new File(["{}"], "game.json"),
    );

    expect(await screen.findByText("disk full")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/games/");
  });

  it("uses the file picker when the file system access api exists", async () => {
    capability.system = true;
    idb.openFilePicker.mockResolvedValue("system:xyz");
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "xyz", type: "system", slug: "system:xyz" },
    });
    const { user, router, store } = renderApp("/games/");
    await screen.findByText("Shikoku 1889");

    await user.click(screen.getByRole("button", { name: "Open File" }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/system:xyz/map"),
    );
    await waitFor(() =>
      expect(store.getState().loadedGame?.slug).toBe("system:xyz"),
    );
    expect(idb.loadSummaries).toHaveBeenCalled();
  });

  it("deletes a saved game and reloads the summaries", async () => {
    opfs.deleteGame.mockResolvedValue();
    const { user, store } = renderApp("/games/");
    const row = await screen.findByRole("row", { name: /Saved Game/ });

    opfs.loadSummaries.mockResolvedValue({});
    await user.click(within(row).getByTestId("DeleteIcon"));

    expect(opfs.deleteGame).toHaveBeenCalledWith("abc");
    expect(
      await screen.findByText("Internal game Saved Game deleted"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByText("Saved Game")).not.toBeInTheDocument(),
    );
    expect(opfs.loadSummaries).toHaveBeenCalledTimes(2);
    expect(store.getState().summaries.internal).toEqual({});
  });

  it("keeps the game and alerts when deleting fails", async () => {
    opfs.deleteGame.mockRejectedValue(new Error("locked"));
    const { user } = renderApp("/games/");
    const row = await screen.findByRole("row", { name: /Saved Game/ });

    await user.click(within(row).getByTestId("DeleteIcon"));

    expect(await screen.findByText("locked")).toBeInTheDocument();
    expect(screen.getByText("Saved Game")).toBeInTheDocument();
    expect(opfs.loadSummaries).toHaveBeenCalledTimes(1);
  });

  it("does not offer deleting bundled games", async () => {
    renderApp("/games/");
    const row = await screen.findByRole("row", { name: /Shikoku 1889/ });
    expect(within(row).queryByTestId("DeleteIcon")).not.toBeInTheDocument();
  });

  it("returns to the load page with an alert when a game cannot be loaded", async () => {
    opfs.loadGame.mockRejectedValue(new Error("File was not valid"));
    const { router, store } = renderApp("/games/internal:gone/map");

    expect(await screen.findByText("File was not valid")).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe("/games/"));
    expect(store.getState().game).toBeUndefined();
    expect(store.getState().alert).toMatchObject({
      open: true,
      type: "error",
      message: "File was not valid",
    });
  });
});
