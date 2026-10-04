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
    renderApp("/elements/tiles?id=ZZ9", withSaved);

    await waitFor(() => expect(shownTiles()).toBe(1));
    expect(opfs.peekGame).toHaveBeenCalledWith("abc");
    expect(
      screen.getByRole("button", { name: "Used in 1 game(s)" }),
    ).toBeInTheDocument();
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
