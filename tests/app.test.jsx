import { screen } from "@testing-library/react";
import { page } from "vitest/browser";

import { renderApp } from "@tests/helpers.jsx";

// Desktop width: the sidebar is always rendered
beforeEach(async () => {
  await page.viewport(1280, 800);
});

describe("the app", () => {
  it("renders without crashing", () => {
    renderApp();

    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("can navigate to the elements page", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("link", { name: "Atoms" }));

    expect(screen.getByTestId("atoms")).toBeInTheDocument();
  });
});
