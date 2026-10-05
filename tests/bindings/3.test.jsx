import { screen, waitFor } from "@testing-library/react";

import { games } from "@/data";
import * as idb from "@/util/storage/idb";

import { renderApp } from "@tests/support/helpers.jsx";

const caps = vi.hoisted(() => ({}));

// Mutate this shared object per test: the app reads the mocked module, so
// there is no second instance of the real capability singleton to diverge
vi.mock("@/util/capability", async (importOriginal) => {
  Object.assign(caps, (await importOriginal()).default);
  return { default: caps };
});

vi.mock("@/util/storage/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  loadSummaries: vi.fn(),
  openFilePicker: vi.fn(),
}));

const loadedGame = {
  title: "1889",
  id: "x",
  type: "system",
  slug: "system:x",
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(caps, { electron: false, system: false });
});

describe("bindings", () => {
  it("ignores keys typed in inputs", async () => {
    const { user, router } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    await screen.findByRole("button", { name: "Close Config" });

    // "h" goes home and "2" is the tiles section, unless typed into a field
    await user.type(screen.getAllByRole("textbox")[0], "h2");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it("ignores keys typed on a select or switch", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    await screen.findByTestId("game-18Test-map");

    screen.getByRole("combobox", { name: "Game Section" }).focus();
    await user.keyboard("h");
    screen.getByRole("switch", { name: "Paginate" }).focus();
    await user.keyboard("h");
    expect(router.state.location.pathname).toBe("/games/18Test/map");
  });

  it.for(["{Control>}h{/Control}", "{Alt>}h{/Alt}", "{Meta>}h{/Meta}"])(
    "ignores %s",
    async (keys) => {
      const { user, router } = renderApp("/games/18Test/map");
      await screen.findByTestId("game-18Test-map");

      await user.keyboard(keys);
      expect(router.state.location.pathname).toBe("/games/18Test/map");
    },
  );

  it("g does nothing without a loaded game", async () => {
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("g");
    expect(router.state.location.pathname).toBe("/");
  });

  it("g goes to the loaded game from state", async () => {
    caps.system = true;
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "x", type: "system", slug: "system:x" },
    });
    const { user, router } = renderApp("/", { loadedGame });
    await screen.findByTestId("home");

    await user.keyboard("g");
    expect(router.state.location.pathname).toBe("/games/system:x");
  });

  it("u does nothing outside of electron", async () => {
    const { user, router } = renderApp("/elements");
    await screen.findByTestId("atoms");

    await user.keyboard("u");
    expect(router.state.location.pathname).toBe("/elements");
  });

  it("o opens the file picker and then the game info", async () => {
    caps.system = true;
    idb.openFilePicker.mockResolvedValue("system:xyz");
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "xyz", type: "system", slug: "system:xyz" },
    });
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("o");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/system:xyz"),
    );
    expect(await screen.findByTestId("game-system:xyz")).toBeInTheDocument();
  });

  it("o stays put when the picker is cancelled", async () => {
    caps.system = true;
    idb.openFilePicker.mockResolvedValue(undefined);
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("o");
    await waitFor(() => expect(idb.openFilePicker).toHaveBeenCalled());
    expect(router.state.location.pathname).toBe("/");
  });

  it("o alerts when the picker fails", async () => {
    caps.system = true;
    idb.openFilePicker.mockRejectedValue(new Error("no permission"));
    const { user } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("o");
    expect(await screen.findByText("no permission")).toBeInTheDocument();
  });

  it("o does nothing without the file system access api", async () => {
    const { user } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("o");
    expect(idb.openFilePicker).not.toHaveBeenCalled();
  });

  it("r refreshes a loaded system game from the file system", async () => {
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "x", type: "system", slug: "system:x" },
    });
    const { user, store } = renderApp("/", { loadedGame });
    await screen.findByTestId("home");

    await user.keyboard("r");
    expect(
      await screen.findByText("x refreshed from file system"),
    ).toBeInTheDocument();
    expect(idb.loadGame).toHaveBeenCalledWith("x");
    expect(store.getState().game.meta.slug).toBe("system:x");
  });

  it("r does nothing without a loaded system game", async () => {
    const { user } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("r");
    expect(idb.loadGame).not.toHaveBeenCalled();
  });
});
