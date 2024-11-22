import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

describe("the app", () => {
  it("renders without crashing", () => {
    renderApp();

    expect(screen.getByText("18xx Maker")).toBeInTheDocument();
  });

  it("can navigate to the elements page", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("link", { name: "Elements" }));

    expect(
      screen.getByRole("heading", { name: "Map Elements" }),
    ).toBeInTheDocument();
  });
});
