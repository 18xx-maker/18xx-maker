import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

describe("markdown alerts", () => {
  it("show a translated title next to the icon", async () => {
    renderApp("/docs");
    const title = (await screen.findAllByText("Tip"))[0];

    expect(title.tagName).toBe("P");
    expect(title).toHaveClass("markdown-alert-title");
    expect(title).toContainHTML("<svg");
    expect(screen.queryByText("TIP")).not.toBeInTheDocument();
    expect(screen.getAllByText("Note")[0]).toHaveClass("markdown-alert-title");
  });
});
