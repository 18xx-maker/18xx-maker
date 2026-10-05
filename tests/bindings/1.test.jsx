import { screen } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

describe("bindings", () => {
  it.for([
    ["m", "docs-index"],
    ["l", "games"],
    ["a", "atoms"],
    ["c", "logos"],
    ["t", "tiles"],
    ["p", "positioning"],
  ])("pressing %s brings you to %s", async ([key, id]) => {
    const { user } = renderApp();

    await user.keyboard(key);
    expect(screen.getByTestId(id)).toBeInTheDocument();
  });
});
