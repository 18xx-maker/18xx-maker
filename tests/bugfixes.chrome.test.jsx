import { screen, waitFor } from "@testing-library/react";

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

    // Typing a value stores it once it is committed
    await user.type(input, "1{Enter}");
    await waitFor(
      () => expect(store.getState().config).toEqual({ margin: 100 }),
      { timeout: 3000 },
    );
  });

  it("puts the old value back when a dimension is left empty", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    await screen.findByRole("button", { name: "Close Config" });

    const input = screen.getByRole("textbox", { name: "Margin Size" });
    await user.clear(input);
    await user.tab();

    expect(input).toHaveValue("0.25");
    expect(store.getState().config).toEqual({});
  });

  it("waits to apply a dimension until it is committed", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    await screen.findByRole("button", { name: "Close Config" });

    const input = screen.getByRole("textbox", { name: "Margin Size" });
    await user.clear(input);
    await user.type(input, "2");
    expect(store.getState().config).toEqual({});

    await user.type(input, ".44");
    await user.tab();
    await waitFor(() =>
      expect(store.getState().config).toEqual({ margin: 244 }),
    );
  });
});
