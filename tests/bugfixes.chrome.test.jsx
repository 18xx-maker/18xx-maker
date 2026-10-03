import { screen } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

// Regression tests for bugs found while writing the Storybook stories

describe("pagination", () => {
  it("has previous and next buttons that work from the keyboard", async () => {
    const { user } = renderApp("/elements/tiles");
    await screen.findByTestId("tiles");

    const next = screen.getByRole("button", { name: "Go to next page" });
    expect(screen.getByText(/^Page 1 of/)).toBeInTheDocument();

    await user.tab();
    next.focus();
    expect(next).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByText(/^Page 2 of/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go to previous page" }),
    ).toBeEnabled();
  });
});

describe("unit inputs", () => {
  it("does not store a zero when the field is cleared", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    await screen.findByRole("button", { name: "Close Config" });

    const input = screen.getByRole("textbox", { name: "Margin Size" });
    await user.clear(input);

    expect(input).toHaveValue("");
    expect(store.getState().config).toEqual({});

    // Typing a value stores it again
    await user.type(input, "1");
    expect(store.getState().config).toEqual({ margin: 100 });
  });
});
