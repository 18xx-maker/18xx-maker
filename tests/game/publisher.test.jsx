import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/data/games", async (importOriginal) => {
  const { withBareGame } = await import("@tests/support/bare.js");
  return { default: withBareGame((await importOriginal()).default) };
});

describe("game info publisher", () => {
  it("shows the publisher name, logo and link", async () => {
    renderApp("/games/18Test/");
    const row = await screen.findByTestId("game-publisher");
    expect(within(row).getByText("Deep Thought Games")).toBeInTheDocument();
    expect(
      within(row).getByAltText("Deep Thought Games Logo"),
    ).toBeInTheDocument();
    expect(row).toHaveAttribute("href", "http://www.deepthoughtgames.com/");
  });

  it("shows no publisher row for a game without one", async () => {
    renderApp("/games/Bare/");
    await screen.findByTestId("game-Bare");
    expect(screen.queryByTestId("game-publisher")).not.toBeInTheDocument();
  });

  it("shows only the name for a self published game", async () => {
    renderApp("/games/1871BC/");
    const row = await screen.findByTestId("game-publisher");
    expect(within(row).getByText("Self Published")).toBeInTheDocument();
    expect(within(row).queryByRole("img")).not.toBeInTheDocument();
  });
});
