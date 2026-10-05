import { screen, within } from "@testing-library/react";
import { page } from "vitest/browser";

import { renderApp } from "@tests/support/helpers.jsx";

describe("docs sidebar", () => {
  beforeEach(async () => {
    await page.viewport(1440, 900);
  });

  it("groups the docs pages under labels", async () => {
    renderApp("/docs/games/exports");
    expect(await screen.findByTestId("docs-games/exports")).toBeInTheDocument();

    const groups = {
      "Getting started": ["Using 18xx Maker", "Files", "Translation"],
      Output: ["PDF Output", "PNG Output", "Board18 Output"],
      "Game files": ["JSON Schemas", "Logos", "Export Options"],
      "Print and play": ["Tokens", "Die Cutter"],
    };

    for (const [label, pages] of Object.entries(groups)) {
      // eslint-disable-next-line testing-library/no-node-access
      const group = screen.getByText(label).closest("[data-sidebar='group']");
      for (const title of pages) {
        expect(
          within(group).getByRole("link", { name: title }),
        ).toBeInTheDocument();
      }
    }
  });
});
