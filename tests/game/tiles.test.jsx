import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

describe("game tiles", () => {
  it.for(["die", "smallDie", "individual", "offset"])(
    "can load and display %s tiles",
    async (layout) => {
      renderApp(`/games/18Test/tiles?config.tiles.layout=${layout}`);
      expect(
        await screen.findByTestId("game-18Test-tiles"),
      ).toBeInTheDocument();
    },
  );

  it("cuts offset bleed flat toward neighboring tiles", async () => {
    renderApp("/games/18Test/tiles?config.tiles.layout=offset");
    const sheet = await screen.findByTestId("game-18Test-tiles");
    /* eslint-disable testing-library/no-node-access */
    const used = new Set(
      [...sheet.querySelectorAll("g[clip-path]")]
        .map((g) => g.getAttribute("clip-path").slice(5, -1))
        .filter((id) => id.startsWith("hexBleedClipPathOffset")),
    );

    expect(used.size).toBeGreaterThan(1);
    // A tile with neighbors on two sides
    expect(used).toContain("hexBleedClipPathOffset-110000");
    used.forEach((id) => {
      expect(id).toMatch(/^hexBleedClipPathOffset-[01]{6}$/);
      expect(
        sheet.querySelector(`clipPath[id="${id}"] polygon`),
      ).not.toBeNull();
    });
    /* eslint-enable testing-library/no-node-access */
  });
});
