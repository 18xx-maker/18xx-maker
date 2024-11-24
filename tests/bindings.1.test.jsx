import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("bindings", () => {
  it.for([
    ["?", "docs"],
    ["l", "games"],
    ["e", "atoms"],
    ["c", "logos"],
    ["t", "tiles"],
  ])("pressing %s brings you to %s", async ([key, id]) => {
    const { user } = renderApp();

    await user.keyboard(key);
    expect(screen.getByTestId(id)).toBeInTheDocument();
  });
});
