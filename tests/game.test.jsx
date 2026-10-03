import { screen } from "@testing-library/react";
import { page } from "vitest/browser";

import { renderApp } from "@tests/helpers.jsx";

// Desktop width: the sidebar is always rendered
beforeEach(async () => {
  await page.viewport(1280, 800);
});

describe("the app", () => {
  it("can navigate to and display 1871", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("link", { name: "Load Games" }));

    const gameLink = await screen.findByRole("link", {
      name: "The Old Prince 1871",
    });
    await user.click(gameLink);

    expect(
      await screen.findByRole("heading", { name: /by Lucas Boyd/i }),
    ).toBeInTheDocument();
  });
});
