import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("the app", () => {
  it("renders without crashing", () => {
    renderApp();

    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  it("can navigate to the elements page", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("link", { name: "Elements" }));

    expect(screen.getByTestId("atoms")).toBeInTheDocument();
  });
});
