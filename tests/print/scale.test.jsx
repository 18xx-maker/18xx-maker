import { screen, waitFor } from "@testing-library/react";

import "@/styles/root.css";

import { games } from "@/data";

import { renderApp } from "@tests/support/helpers.jsx";

const viewportChildren = () =>
  // eslint-disable-next-line testing-library/no-node-access
  document.getElementById("viewport-children");

// The sizes (in inches) of the first @page rule of the document
const pageRule = () => {
  // eslint-disable-next-line testing-library/no-node-access
  const css = [...document.querySelectorAll("style")]
    .map((style) => style.textContent)
    .find((text) => text.includes("@page"));
  const size = css.match(/size:\s*([\d.]+)in\s+([\d.]+)in/);
  return { css, width: Number(size[1]), height: Number(size[2]) };
};

const inches = (value) => parseFloat(value);

describe("print scale", () => {
  it("leaves the pages alone at 100", async () => {
    renderApp("/games/18Test/cards?print=true");
    const root = await screen.findByTestId("game-18Test-cards");

    expect(viewportChildren()).not.toHaveAttribute("data-print-scale");
    expect(viewportChildren().style.getPropertyValue("--print-scale")).toBe("");
    expect(getComputedStyle(root).zoom).toBe("1");
  });

  it("zooms the pages and lays them out on the paper divided by the scale", async () => {
    const view = renderApp("/games/18Test/cards?print=true");
    const unscaled = await screen.findByTestId("game-18Test-cards");
    // eslint-disable-next-line testing-library/no-node-access
    const page = inches(unscaled.querySelector(".cards").style.width);
    view.unmount();

    renderApp("/games/18Test/cards?print=true&config.printScale=125");
    const scaled = await screen.findByTestId("game-18Test-cards");

    expect(viewportChildren()).toHaveAttribute("data-print-scale");
    expect(getComputedStyle(scaled).zoom).toBe("1.25");
    // The sheet is 11in by 8.5in for the die: the zoomed page fills it again
    // eslint-disable-next-line testing-library/no-node-access
    const width = inches(scaled.querySelector(".cards").style.width);
    expect(width).toBeCloseTo(page / 1.25, 3);
    expect(width * 1.25).toBeCloseTo(page, 3);
  });

  it("keeps the real paper for the page", async () => {
    renderApp("/games/18Test/tokens?print=true&config.printScale=125");
    const root = await screen.findAllByTestId("game-18Test-tokens");
    // The sheet is laid out on the scaled paper
    expect(inches(root[0].style.width)).toBeCloseTo((8.5 - 0.5) / 1.25, 3);
    expect(pageRule()).toMatchObject({ width: 8.5, height: 11 });
  });

  it("keeps the real paper for the page of the tiles", async () => {
    renderApp(
      "/games/18Test/tiles?print=true&config.printScale=80&config.tiles.layout=offset",
    );
    await screen.findByTestId("game-18Test-tiles");
    expect(pageRule()).toMatchObject({ width: 8.5, height: 11 });
  });

  it("changes the pages of a sheet with the scale", async () => {
    const count = async (scale) => {
      const { unmount } = renderApp(
        `/games/18Test/tokens?print=true&config.printScale=${scale}`,
      );
      const pages = await screen.findAllByTestId("game-18Test-tokens");
      unmount();
      return pages.length;
    };

    // Smaller tokens on the same paper fit more per page
    const small = await count(50);
    const real = await count(100);
    const big = await count(200);
    expect(small).toBeLessThanOrEqual(real);
    expect(big).toBeGreaterThanOrEqual(real);
    expect(big).toBeGreaterThan(small);
  });

  it("scales the size of the page of a map, not its margins", async () => {
    const view = renderApp("/games/18Test/map?print=true");
    await screen.findByTestId("game-18Test-map");
    const real = pageRule();
    view.unmount();

    renderApp("/games/18Test/map?print=true&config.printScale=110");
    await screen.findByTestId("game-18Test-map");
    const scaled = pageRule();
    // The content grows, the 0.25in margins on each side do not
    expect(scaled.width).toBeCloseTo((real.width - 0.5) * 1.1 + 0.5, 3);
    expect(scaled.height).toBeCloseTo((real.height - 0.5) * 1.1 + 0.5, 3);
    expect(scaled.css).toContain("margin: 0.25in 0.25in 0.25in 0.25in");
  });

  it("scales the size of the page of a market, not its margins", async () => {
    const view = renderApp("/games/18Test/market?print=true");
    await screen.findByTestId("game-18Test-market");
    const real = pageRule();
    view.unmount();

    renderApp("/games/18Test/market?print=true&config.printScale=150");
    await screen.findByTestId("game-18Test-market");
    const scaled = pageRule();
    expect(scaled.width).toBeCloseTo((real.width - 0.5) * 1.5 + 0.5, 2);
    expect(scaled.height).toBeCloseTo((real.height - 0.5) * 1.5 + 0.5, 2);
    expect(scaled.css).toContain("margin: 0.25in");
  });

  it("does not zoom the Board18 pages", async () => {
    renderApp("/games/18Test/b18/map?print=true&config.printScale=125");
    await screen.findByTestId("game-18Test-b18-map");
    expect(viewportChildren()).not.toHaveAttribute("data-print-scale");
  });

  it("is not set by the config of a game", async () => {
    renderApp("/games/18Test/cards?print=true", {
      game: { ...games["18Test"], config: { printScale: 50 } },
    });
    await screen.findByTestId("game-18Test-cards");
    expect(viewportChildren()).not.toHaveAttribute("data-print-scale");
  });

  it("is a setting in the stored config", async () => {
    renderApp("/games/18Test/cards?print=true", { config: { printScale: 90 } });
    const root = await screen.findByTestId("game-18Test-cards");
    expect(getComputedStyle(root).zoom).toBe("0.9");
  });

  it("zooms the pages inside the editor, not the editor", async () => {
    renderApp("/games/18Test/tiles?config.printScale=110");
    await screen.findByTestId("game-18Test-tiles");

    // eslint-disable-next-line testing-library/no-node-access
    const editor = document.getElementById("editor");
    expect(getComputedStyle(editor).zoom).toBe("1");
    // eslint-disable-next-line testing-library/no-node-access
    const content = editor.firstElementChild;
    expect(getComputedStyle(content).zoom).toBe("1");
    expect(getComputedStyle(screen.getByTestId("game-18Test-tiles")).zoom).toBe(
      "1.1",
    );
  });

  it("fits the first page in the window of the editor", async () => {
    renderApp("/games/18Test/tiles?config.printScale=110");
    await screen.findByTestId("game-18Test-tiles");

    // eslint-disable-next-line testing-library/no-node-access
    const editor = document.getElementById("editor");
    // eslint-disable-next-line testing-library/no-node-access
    const page = editor.querySelector(".TileSheet--Page");
    await waitFor(() => {
      const box = page.getBoundingClientRect();
      const frame = editor.getBoundingClientRect();
      expect(box.width).toBeGreaterThan(0);
      expect(box.left).toBeGreaterThanOrEqual(frame.left - 1);
      expect(box.right).toBeLessThanOrEqual(frame.right + 1);
      expect(box.bottom).toBeLessThanOrEqual(frame.bottom + 1);
    });
  });
});
