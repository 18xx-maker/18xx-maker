import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/helpers";

// Menus, tooltips and drawers portal to body, outside #dropzone
describe("chrome root", () => {
  it("gives content portaled to body the tokens, and removes them on unmount", async () => {
    const { unmount } = renderApp("/");
    await screen.findByTestId("viewport");

    const portal = document.createElement("div");
    document.body.appendChild(portal);
    expect(getComputedStyle(portal).getPropertyValue("--space")).toBe("8px");

    unmount();
    await waitFor(() =>
      expect(document.body).not.toHaveAttribute("data-chrome-root"),
    );
    expect(getComputedStyle(portal).getPropertyValue("--space")).toBe("");
    portal.remove();
  });
});
