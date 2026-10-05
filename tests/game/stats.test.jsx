import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/data/games", async (importOriginal) => {
  const { withBareGame } = await import("@tests/support/bare.js");
  return { default: withBareGame((await importOriginal()).default) };
});

describe("game info stats", () => {
  it("shows tile, map, company and train counts", async () => {
    renderApp("/games/18Test/");
    const stats = within(await screen.findByTestId("game-stats"));
    expect(stats.getByText("Statistics")).toBeInTheDocument();
    expect(stats.getByText("Yellow")).toBeInTheDocument();
    expect(stats.getByText("Map variations")).toBeInTheDocument();
    expect(stats.getByText("Privates")).toBeInTheDocument();
    expect(stats.getByText("Trains")).toBeInTheDocument();
  });

  it("omits the map rows for a game without a map", async () => {
    renderApp("/games/Bare/");
    const stats = within(await screen.findByTestId("game-stats"));
    expect(stats.queryByText("Map variations")).not.toBeInTheDocument();
  });
});
