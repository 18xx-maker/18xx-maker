import { screen, within } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const pager = () => screen.findByRole("navigation", { name: "Pages" });

describe("docs previous and next", () => {
  it("links the pages around this one in sidebar order", async () => {
    renderApp("/docs/files");
    const nav = await pager();

    const previous = within(nav).getByRole("link", { name: /Previous/ });
    expect(previous).toHaveAttribute("href", "/docs");
    expect(previous).toHaveTextContent("Using 18xx Maker");
    expect(within(nav).getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/docs/faq",
    );
  });

  it("crosses from one group to the next", async () => {
    renderApp("/docs/translation");
    const nav = await pager();

    expect(within(nav).getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/docs/output/pdf",
    );
  });

  it("has no previous link on the first page", async () => {
    renderApp("/docs");
    const nav = await pager();

    expect(
      within(nav).queryByRole("link", { name: /Previous/ }),
    ).not.toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/docs/files",
    );
  });

  it("has no next link on the last page", async () => {
    renderApp("/docs/pnp/die");
    const nav = await pager();

    expect(
      within(nav).queryByRole("link", { name: /Next/ }),
    ).not.toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: /Previous/ })).toHaveAttribute(
      "href",
      "/docs/pnp/tokens",
    );
  });
});
