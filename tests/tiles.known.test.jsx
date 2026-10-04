import { screen, waitFor } from "@testing-library/react";

import { initialState } from "@/state";
import * as opfs from "@/util/opfs";

import { renderApp } from "@tests/helpers.jsx";

vi.mock("@/util/opfs", async (importOriginal) => ({
  ...(await importOriginal()),
  loadSummaries: vi.fn(),
  peekGame: vi.fn(),
}));

const summary = {
  title: "Saved Game",
  id: "abc",
  type: "internal",
  slug: "internal:abc",
};
const saved = {
  info: { title: "Saved Game" },
  tiles: { ZZ9: { color: "brown", quantity: 1 } },
};

const withSaved = {
  summaries: {
    ...initialState.summaries,
    internal: { "internal:abc": summary },
  },
};

const shownTiles = () =>
  // eslint-disable-next-line testing-library/no-node-access
  screen.getByTestId("tiles").querySelectorAll(".checkered").length;

beforeEach(() => {
  vi.clearAllMocks();
  opfs.loadSummaries.mockResolvedValue({ "internal:abc": summary });
});

describe("tiles of games on this device", () => {
  it("lists a stored game and its tiles", async () => {
    opfs.peekGame.mockResolvedValue(saved);
    const { user } = renderApp("/elements/tiles?id=ZZ9", withSaved);

    await waitFor(() => expect(shownTiles()).toBe(1));
    expect(opfs.peekGame).toHaveBeenCalledWith("abc");

    await user.hover(screen.getByTestId("tile-ZZ9"));
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Used in 1 game(s)Saved Game",
    );
  });

  it("opens the popover with a tap and closes it with a second tap", async () => {
    opfs.peekGame.mockResolvedValue(saved);
    const { user } = renderApp("/elements/tiles?id=ZZ9", withSaved);
    await waitFor(() => expect(shownTiles()).toBe(1));
    const tile = screen.getByTestId("tile-ZZ9");

    await user.pointer({ keys: "[TouchA]", target: tile });
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Saved Game");

    await user.pointer({ keys: "[TouchA]", target: tile });
    await waitFor(() =>
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(),
    );
  });

  it("does not crash on a malformed stored game", async () => {
    opfs.peekGame.mockResolvedValue({
      info: { title: "Saved Game" },
      tiles: {
        ZZ7: { color: "red", quantity: 1 },
        ZZ8: { color: "blue", values: [null, { value: null }] },
        ZZ9: { color: "brown", values: "x" },
      },
    });
    renderApp("/elements/tiles?id=ZZ", withSaved);

    await waitFor(() => expect(shownTiles()).toBe(1));
  });

  it("shows a tile that cannot be drawn as its id", async () => {
    opfs.peekGame.mockResolvedValue({
      info: { title: "Saved Game" },
      tiles: { ZZ9: { color: "brown", cities: [null], quantity: 1 } },
    });
    // React logs the error it hands to the boundary
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    renderApp("/elements/tiles?id=ZZ9", withSaved);

    await waitFor(() =>
      expect(screen.getByTestId("tile-ZZ9")).toHaveTextContent("ZZ9"),
    );
    expect(shownTiles()).toBe(1);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("selects a stored game in the Game dropdown", async () => {
    opfs.peekGame.mockResolvedValue(saved);
    const { user, router } = renderApp("/elements/tiles", withSaved);

    await waitFor(() => expect(opfs.peekGame).toHaveBeenCalled());
    await user.click(screen.getByRole("combobox", { name: "Game" }));
    await user.click(await screen.findByRole("option", { name: "Saved Game" }));

    expect(router.state.location.search).toBe("?game=internal%253Aabc");
    await waitFor(() => expect(shownTiles()).toBe(1));
    expect(screen.getByTestId("tile-ZZ9")).toBeInTheDocument();
  });

  it("skips a game that fails to load", async () => {
    opfs.peekGame.mockRejectedValue(new Error("gone"));
    renderApp("/elements/tiles?id=ZZ9", withSaved);

    await waitFor(() => expect(opfs.peekGame).toHaveBeenCalled());
    expect(shownTiles()).toBe(0);
  });

  it("keeps an explicit game and revenue while it loads", async () => {
    opfs.peekGame.mockResolvedValue(saved);
    const { router } = renderApp(
      "/elements/tiles?game=internal%253Aabc&revenue=0_30",
      withSaved,
    );

    await waitFor(() => expect(shownTiles()).toBe(1));
    expect(router.state.location.search).toBe(
      "?game=internal%253Aabc&revenue=0_30",
    );
  });
});
