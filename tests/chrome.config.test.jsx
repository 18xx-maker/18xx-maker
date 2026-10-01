import { screen, waitFor, within } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const openDrawer = async (user) => {
  await user.click(screen.getByRole("button", { name: "config" }));
  return screen.findByRole("button", { name: "Close Config" });
};

describe("config drawer", () => {
  it("opens and closes with the button, reflected in the url", async () => {
    const { user, router } = renderApp("/games/18Test/map");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close Config" }),
    ).not.toBeInTheDocument();

    const close = await openDrawer(user);
    expect(router.state.location.search).toBe("?config=true");

    await user.click(close);
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Close Config" }),
      ).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("");
  });

  it("opens when the url asks for it", async () => {
    renderApp("/games/18Test/map?config=true");
    expect(
      await screen.findByRole("button", { name: "Close Config" }),
    ).toBeInTheDocument();
  });

  it("does not render in print mode", async () => {
    renderApp("/games/18Test/map?print=true&config=true");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "config" }),
    ).not.toBeInTheDocument();
  });

  it("stores only the difference from the defaults when a checkbox changes", async () => {
    const { user, store } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    const box = screen.getByRole("checkbox", {
      name: "Export all layout options",
    });
    expect(box).not.toBeChecked();
    expect(store.getState().config).toEqual({});

    await user.click(box);
    await waitFor(() =>
      expect(store.getState().config).toEqual({ export: { allLayouts: true } }),
    );
    expect(box).toBeChecked();
    expect(store.getState().errors).toEqual({});

    // Putting it back to the default stores nothing
    await user.click(box);
    await waitFor(() => expect(store.getState().config).toEqual({}));
    expect(box).not.toBeChecked();
  });

  it("changes the theme and persists it in state", async () => {
    const { user, store } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(screen.getByRole("combobox", { name: /^Theme/ }));
    const listbox = await screen.findByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    const other = options.find((o) => o.getAttribute("data-value") !== "gmt");
    const value = other.getAttribute("data-value");
    await user.click(other);

    await waitFor(() =>
      expect(store.getState().config).toEqual({ theme: value }),
    );
  });

  it("changing a select updates the stored config and the drawer", async () => {
    const { user, store } = renderApp("/games/18Test/charters?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(screen.getByRole("combobox", { name: /Charter Layout/ }));
    await user.click(await screen.findByRole("option", { name: "3x1" }));
    await waitFor(() =>
      expect(store.getState().config).toEqual({ charters: { layout: "3x1" } }),
    );
    expect(
      screen.getByRole("combobox", { name: /Charter Layout/ }),
    ).toHaveTextContent("3x1");
  });

  it("converts dimension inputs from inches to the stored unit", async () => {
    const { user, store } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    // Default margin is 25 (a quarter inch), shown in inches
    const input = screen.getByRole("textbox", { name: "Margin Size" });
    expect(input).toHaveValue("0.25");

    await user.clear(input);
    await user.type(input, "1");

    // Debounced by the input, 1 inch is 100 units
    await waitFor(() =>
      expect(store.getState().config).toEqual({ margin: 100 }),
    );
    expect(store.getState().errors).toEqual({});
  });

  it("resets the stored config to the defaults", async () => {
    const { user, store } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(
      screen.getByRole("checkbox", { name: "Export all layout options" }),
    );
    await waitFor(() => expect(store.getState().config).not.toEqual({}));

    await user.click(screen.getByRole("button", { name: "Reset To Defaults" }));
    expect(store.getState().config).toEqual({});
  });

  it("search params override stored config without being stored", async () => {
    const { store } = renderApp(
      "/games/18Test/charters?config=true&config.charters.layout=3x1",
      { config: { charters: { layout: "free" } } },
    );
    await screen.findByRole("button", { name: "Close Config" });

    expect(
      screen.getByRole("combobox", { name: /Charter Layout/ }),
    ).toHaveTextContent("3x1");
    // Search config is not written to state
    expect(store.getState().config).toEqual({ charters: { layout: "free" } });
  });
});
