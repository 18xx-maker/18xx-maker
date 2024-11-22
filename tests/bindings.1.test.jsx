import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("bindings", () => {
  it.for([
    ["?", "Help"],
    ["l", "Games"],
    ["e", "Map Elements"],
    ["c", "Company Logos"],
    ["t", "Tiles"],
    ["?", "Help"],
  ])("pressing %s brings you to %s", async ([key, header]) => {
    const { user } = renderApp();

    await user.keyboard(key);
    expect(screen.getByRole("heading", { name: header })).toBeInTheDocument();
  });
});
