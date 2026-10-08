import { screen } from "@testing-library/react";

import games from "@/data/games";
import defaults from "@/defaults.json";
import { getMapData } from "@/util/map";

import { renderApp } from "@tests/support/helpers.jsx";

vi.mock("@/data/games", async (importOriginal) => {
  const { withBareGame } = await import("@tests/support/bare.js");
  return { default: withBareGame((await importOriginal()).default) };
});

const viewBoxOf = (game) => {
  const data = getMapData(game, defaults.coords, defaults.tiles.mapWidth, 0);
  return `0 0 ${data.totalWidth} ${data.totalHeight}`;
};

describe("game info map preview", () => {
  it("shows the map before the statistics, as wide as the card", async () => {
    renderApp("/games/18Test/");
    const preview = await screen.findByTestId("game-map-preview");
    const stats = screen.getByTestId("game-stats");
    expect(
      preview.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(preview.getBoundingClientRect().width).toBe(
      stats.getBoundingClientRect().width,
    );
  });

  it("links to the map page", async () => {
    renderApp("/games/18Test/");
    await screen.findByTestId("game-map-preview");
    expect(screen.getByRole("link", { name: "Open the map" })).toHaveAttribute(
      "href",
      "/games/18Test/map",
    );
    expect(screen.getByTestId("game-map-preview-svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("is absent for a game without a map", async () => {
    renderApp("/games/Bare/");
    await screen.findByTestId("game-stats");
    expect(screen.queryByTestId("game-map-preview")).not.toBeInTheDocument();
  });

  it.each(["horizontal", "vertical"])(
    "fits the %s map in its view box",
    async (orientation) => {
      const game = Object.values(games).find(
        (g) =>
          g.map &&
          (g.info.orientation === "horizontal") ===
            (orientation === "horizontal"),
      );
      renderApp(`/games/${game.meta.slug}/`);
      expect(await screen.findByTestId("game-map-preview-svg")).toHaveAttribute(
        "viewBox",
        viewBoxOf(game),
      );
    },
  );
});
