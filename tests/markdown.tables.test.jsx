import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

describe("markdown tables", () => {
  it("scroll in a labelled region that takes focus", async () => {
    renderApp("/docs/play-server");
    const regions = await screen.findAllByRole("region", { name: "Table" });
    const region = regions[0];

    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveClass("overflow-x-auto");
    expect(
      within(region).getByRole("columnheader", { name: "Variable" }),
    ).toBeInTheDocument();
    region.focus();
    expect(region).toHaveFocus();
  });
});
