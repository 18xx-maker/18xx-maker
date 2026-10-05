import { act, screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// 1888 has no map, 1889 does. A page redirect must use the game in the URL,
// not the previously loaded game.
describe("navigating between games", () => {
  it("renders the new game's page, not the previous game's", async () => {
    const { router } = renderApp("/games/1888/");
    expect(await screen.findByTestId("game-1888")).toBeInTheDocument();

    await act(() => router.navigate("/games/1889/map"));
    expect(await screen.findByTestId("game-1889-map")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/games/1889/map");

    await act(() => router.navigate(-1));
    expect(await screen.findByTestId("game-1888")).toBeInTheDocument();
  });
});
