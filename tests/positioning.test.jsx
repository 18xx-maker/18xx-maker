/* eslint-disable testing-library/no-node-access */
import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const at = (angle, translate) =>
  `rotate(${angle} 0 0) translate(0 ${translate}) rotate(${-angle} 0 0) translate(0 0)`;

describe("auto positioning examples page", () => {
  it("links to the doc", async () => {
    renderApp("/elements/positioning");
    expect(
      await screen.findByRole("link", { name: /Auto Positioning doc/ }),
    ).toHaveAttribute("href", "/docs/games/positioning");
  });

  it("draws the transforms the rules promise", async () => {
    renderApp("/elements/positioning");
    await screen.findByTestId("positioning");

    const rotate = (id) =>
      [
        ...screen
          .getByTestId(`positioning-${id}`)
          .querySelectorAll("svg g[transform^='rotate']"),
      ].map((g) => g.getAttribute("transform"));
    const count = (id, prefix) =>
      rotate(id).filter((t) => t.startsWith(prefix)).length;

    // icons: only with a city or centerTown, 30 when there is terrain too
    expect(rotate("iconCity")).toContain(at(0, 45));
    expect(rotate("iconCenterTown")).toContain(at(0, 45));
    expect(rotate("iconTerrain")).toContain(at(30, 45));
    expect(rotate("iconAlone")).not.toContain(at(0, 45));

    // terrain: only with a city or centerTown, 330 when there is an icon too
    expect(rotate("terrainCity")).toContain(at(0, 52.5));
    expect(rotate("terrainCenterTown")).toContain(at(0, 52.5));
    expect(rotate("terrainIcon")).toContain(at(330, 52.5));
    expect(rotate("terrainAlone")).not.toContain(at(0, 52.5));

    // any positioning field turns it off for that element only
    expect(rotate("offAngle")).not.toContain(at(0, 52.5));
    expect(rotate("offOne")).toContain(at(0, 52.5));

    // values: the first only
    expect(count("valueOne", "rotate(210 ")).toBe(1);
    expect(count("valueTwo", "rotate(210 ")).toBe(1);

    // labels: the first two only
    expect(count("labelOne", "rotate(150 ")).toBe(1);
    expect(count("labelTwo", "rotate(150 ")).toBe(1);
    expect(count("labelTwo", "rotate(270 ")).toBe(1);
    expect(count("labelThree", "rotate(150 ")).toBe(1);
    expect(count("labelThree", "rotate(270 ")).toBe(1);
  });
});
