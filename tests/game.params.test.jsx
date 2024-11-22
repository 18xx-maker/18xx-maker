import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("game params", () => {
  it("can use string and range params", async () => {
    renderApp("/games/18Test/tiles?includes=city&revenue=110_130");
    expect(
      await screen.findByRole("link", { name: /by Christopher Giroir/i }),
    ).toBeInTheDocument();
  });

  it("can use boolean and int params", async () => {
    renderApp("/games/18Test/map?paginated=true&variation=0");
    expect(
      await screen.findByRole("link", { name: /by Christopher Giroir/i }),
    ).toBeInTheDocument();
  });
});
