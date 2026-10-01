import { screen, waitFor } from "@testing-library/react";

import { games } from "@/data";
import capability from "@/util/capability";
import * as idb from "@/util/idb";

import { renderApp } from "@tests/helpers.jsx";

vi.mock("@/util/idb", async (importOriginal) => ({
  ...(await importOriginal()),
  loadGame: vi.fn(),
  loadSummaries: vi.fn(),
  openFilePicker: vi.fn(),
}));

const original = { ...capability };
const loadedGame = {
  title: "1889",
  id: "x",
  type: "system",
  slug: "system:x",
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(capability, { electron: false, system: false });
});

afterEach(() => {
  Object.assign(capability, original);
});

describe("bindings", () => {
  it("ignores keys typed in inputs", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    const input = screen.getAllByDisplayValue("0.25")[0];
    await user.click(input);
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
    capability.system = true;
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "x", type: "system", slug: "system:x" },
    });
    const { user, router } = renderApp("/", { loadedGame });
    await screen.findByTestId("home");

    await user.keyboard("g");
    expect(router.state.location.pathname).toBe("/games/system:x/map");
  });

  it("u does nothing outside of electron", async () => {
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("u");
    expect(router.state.location.pathname).toBe("/");
  });

  it("o opens the file picker and then the game", async () => {
    capability.system = true;
    idb.openFilePicker.mockResolvedValue("system:xyz");
    idb.loadGame.mockResolvedValue({
      ...games["18Test"],
      meta: { id: "xyz", type: "system", slug: "system:xyz" },
    });
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("o");
    await waitFor(() =>
      expect(router.state.location.pathname).toBe("/games/system:xyz/map"),
    );
  });

  it("o stays put when the picker is cancelled", async () => {
    capability.system = true;
    idb.openFilePicker.mockResolvedValue(undefined);
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.keyboard("o");
    await waitFor(() => expect(idb.openFilePicker).toHaveBeenCalled());
    expect(router.state.location.pathname).toBe("/");
  });

  it("o alerts when the picker fails", async () => {
    capability.system = true;
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
