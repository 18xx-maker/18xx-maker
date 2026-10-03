import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("docs on this page", () => {
  it("links the h2 and h3 headings of the page", async () => {
    renderApp("/docs/games/exports");
    const toc = await screen.findByRole("navigation", {
      name: "On this page",
    });

    const links = within(toc).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(
      expect.arrayContaining(["Options", "Which value wins"]),
    );
    expect(within(toc).getByRole("link", { name: "Options" })).toHaveAttribute(
      "href",
      "/docs/games/exports#options",
    );
    // the page title is not in the list, and nor is a # anchor
    expect(within(toc).queryByText("Export Options")).not.toBeInTheDocument();
    expect(links.every((link) => !link.textContent.startsWith("#"))).toBe(true);
  });

  it("marks the section being read", async () => {
    renderApp("/docs/games/exports#checking");
    const toc = await screen.findByRole("navigation", {
      name: "On this page",
    });

    await expect
      .poll(() =>
        within(toc)
          .getByRole("link", { name: "Checking" })
          .getAttribute("aria-current"),
      )
      .toBe("location");
  });
});
