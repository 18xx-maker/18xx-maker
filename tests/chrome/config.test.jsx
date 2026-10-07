import { screen, waitFor, within } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

const openDrawer = async (user) => {
  await user.click(screen.getByRole("button", { name: "Config" }));
  return screen.findByRole("button", { name: "Close Config" });
};

const chooseSection = async (user, name) => {
  await user.click(screen.getByRole("combobox", { name: "Config Section" }));
  await user.click(await screen.findByRole("option", { name }));
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
    expect(screen.getByRole("button", { name: "Config" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

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

  // Print css alone is not enough: screen captures (the electron PNG export)
  // use ?print=true with screen media
  it("does not render in print mode", async () => {
    renderApp("/games/18Test/map?print=true&config=true");
    expect(await screen.findByTestId("game-18Test-map")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Config" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close Config" }),
    ).not.toBeInTheDocument();
  });

  it("starts on the colors section and switches sections through the url", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    const section = await screen.findByRole("combobox", {
      name: "Config Section",
    });
    expect(section).toHaveTextContent("Colors and Companies");
    expect(screen.getByRole("combobox", { name: "Theme" })).toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Export all layout options" }),
    ).not.toBeInTheDocument();

    await chooseSection(user, "Export");
    expect(
      await screen.findByRole("checkbox", {
        name: "Export all layout options",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Theme" }),
    ).not.toBeInTheDocument();
    expect(section).toHaveTextContent("Export");
    expect(
      new URLSearchParams(router.state.location.search).get("section"),
    ).toBe("export");
  });

  // Product bug: Config's onClose calls setSection("colors") then
  // toggleConfig(), two navigates from separate URLSearchParams copies, so
  // the second one puts section=export back. Remove .fails once fixed.
  it("forgets the section when closed", async () => {
    const { user, router } = renderApp(
      "/games/18Test/map?config=true&section=export",
    );
    await user.click(
      await screen.findByRole("button", { name: "Close Config" }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Close Config" }),
      ).not.toBeInTheDocument(),
    );
    expect(router.state.location.search).toBe("");
  });

  it("opens on the section named in the url", async () => {
    renderApp("/games/18Test/map?config=true&section=layout");
    expect(
      await screen.findByRole("combobox", { name: "Config Section" }),
    ).toHaveTextContent("Layout");
    expect(
      screen.getByRole("textbox", { name: "Margin Size" }),
    ).toBeInTheDocument();
  });

  it("offers reset only in the data section", async () => {
    const { user } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });
    expect(
      screen.queryByRole("button", { name: "Reset To Defaults" }),
    ).not.toBeInTheDocument();

    await chooseSection(user, "Data");
    expect(
      await screen.findByRole("button", { name: "Reset To Defaults" }),
    ).toBeInTheDocument();
  });

  it("stores only the difference from the defaults when a checkbox changes", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=export",
    );
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

    const theme = screen.getByRole("combobox", { name: "Theme" });
    const current = theme.textContent;
    await user.click(theme);
    const listbox = await screen.findByRole("listbox");
    const other = within(listbox)
      .getAllByRole("option")
      .find((o) => o.textContent !== current);
    const label = other.textContent;
    await user.click(other);

    await waitFor(() => expect(store.getState().config.theme).toBeDefined());
    expect(store.getState().config.theme).not.toBe("gmt");
    expect(Object.keys(store.getState().config)).toEqual(["theme"]);
    expect(theme).toHaveTextContent(label);
  });

  it("changing a select updates the stored config and the drawer", async () => {
    const { user, store } = renderApp(
      "/games/18Test/charters?config=true&section=charters",
    );
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(screen.getByRole("combobox", { name: "Charter Layout" }));
    await user.click(await screen.findByRole("option", { name: "3x1" }));
    await waitFor(() =>
      expect(store.getState().config).toEqual({ charters: { layout: "3x1" } }),
    );
    expect(
      screen.getByRole("combobox", { name: "Charter Layout" }),
    ).toHaveTextContent("3x1");
  });

  it("converts dimension inputs from inches to the stored unit", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    await screen.findByRole("button", { name: "Close Config" });

    // Default margin is 25 (a quarter inch), shown in inches
    const input = screen.getByRole("textbox", { name: "Margin Size" });
    expect(input).toHaveValue("0.25");

    await user.clear(input);
    await user.type(input, "1{Enter}");

    // 1 inch is 100 units
    await waitFor(() =>
      expect(store.getState().config).toEqual({ margin: 100 }),
    );
    expect(store.getState().errors).toEqual({});
  });

  it("sets and clears the size of a type of card", async () => {
    const { user, store } = renderApp(
      "/games/18Test/cards?config=true&section=cards",
    );
    await screen.findByRole("button", { name: "Close Config" });

    const input = screen.getByRole("textbox", { name: "Private Card Width" });
    // Nothing set: blank, showing the card width it falls back to
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("placeholder", "2.657");

    await user.type(input, "2{Enter}");
    await waitFor(() =>
      expect(store.getState().config.cards.sizes).toEqual({
        private: { width: 200 },
      }),
    );

    await user.clear(input);
    await user.keyboard("{Enter}");
    // The key and the objects it leaves empty are removed
    await waitFor(() => expect(store.getState().config.cards).toBeUndefined());
    expect(store.getState().errors).toEqual({});
  });

  it("chooses what companies are named", async () => {
    const { user, store } = renderApp(
      "/games/18Test/charters?config=true&section=colors",
    );
    await user.click(
      await screen.findByRole("combobox", { name: "Company Names" }),
    );
    await user.click(await screen.findByRole("option", { name: "both" }));
    await waitFor(() =>
      expect(store.getState().config.companyNames).toBe("both"),
    );
  });

  it("sets the print scale and does not store one out of range", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=layout",
    );
    const field = await screen.findByRole("spinbutton", {
      name: "Print Scale",
    });
    expect(field).toHaveValue(100);

    await user.clear(field);
    await user.type(field, "110");
    await user.tab();
    await waitFor(() => expect(store.getState().config.printScale).toBe(110));

    await user.clear(field);
    await user.type(field, "300");
    await user.tab();
    await waitFor(() =>
      expect(Object.keys(store.getState().errors)).toContain("#/printScale"),
    );
    expect(store.getState().config.printScale).toBe(110);
  });

  it("sets the size of the cards of a die", async () => {
    const { user, store } = renderApp(
      "/games/18Test/cards?config=true&section=cards",
    );
    await screen.findByRole("button", { name: "Close Config" });

    const width = screen.getByRole("textbox", {
      name: "Mini Euro Die Card Width",
    });
    expect(width).toHaveValue("2.65748");
    expect(
      screen.getByRole("textbox", { name: "Mini Euro Die Card Height" }),
    ).toHaveValue("1.73228");
    expect(
      screen.getByRole("textbox", { name: "DTG Die Card Width" }),
    ).toHaveValue("2.5");
    expect(
      screen.getByRole("textbox", { name: "DTG Die Card Height" }),
    ).toHaveValue("1.5");

    await user.clear(width);
    await user.type(width, "3{Enter}");
    await waitFor(() =>
      expect(store.getState().config.cards.dice).toEqual({
        miniEuroDie: { width: 300 },
      }),
    );
    expect(store.getState().errors).toEqual({});
  });

  it("resets the stored config to the defaults", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=data",
      { config: { export: { allLayouts: true }, margin: 100 } },
    );

    await user.click(
      await screen.findByRole("button", { name: "Reset To Defaults" }),
    );
    await waitFor(() => expect(store.getState().config).toEqual({}));
  });

  it("has the allow game config setting first in the data section", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=data",
    );
    const box = await screen.findByRole("checkbox", {
      name: "Allow game config",
    });
    expect(box).not.toBeChecked();

    await user.click(box);
    await waitFor(() =>
      expect(store.getState().config).toEqual({ allowGameConfig: true }),
    );
    expect(box).toBeChecked();
  });

  it("stores only the edited option, not the values of the game", async () => {
    const { user, store } = renderApp(
      "/games/18Test/charters?config=true&section=charters",
      { config: { allowGameConfig: true } },
    );
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(screen.getByRole("combobox", { name: "Charter Layout" }));
    await user.click(await screen.findByRole("option", { name: "3x1" }));
    await waitFor(() =>
      expect(store.getState().config).toEqual({
        allowGameConfig: true,
        charters: { layout: "3x1" },
      }),
    );
  });

  it("does not store the url config when another option is edited", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=export&config.margin=99",
    );
    await user.click(
      await screen.findByRole("checkbox", {
        name: "Export all layout options",
      }),
    );
    await waitFor(() =>
      expect(store.getState().config).toEqual({ export: { allLayouts: true } }),
    );
  });

  it("shows the config of the user in the data section, not the game's", async () => {
    renderApp("/games/18Test/map?config=true&section=data", {
      config: { allowGameConfig: true },
    });
    await screen.findByRole("checkbox", { name: "Allow game config" });
    await waitFor(() =>
      expect(document.body).toHaveTextContent(/"allowGameConfig"/),
    );
    expect(document.body).not.toHaveTextContent(/allLayouts/);
  });

  it("search params override stored config without being stored", async () => {
    const { store } = renderApp(
      "/games/18Test/charters?config=true&section=charters&config.charters.layout=3x1",
      { config: { charters: { layout: "free" } } },
    );
    await screen.findByRole("button", { name: "Close Config" });

    expect(
      screen.getByRole("combobox", { name: "Charter Layout" }),
    ).toHaveTextContent("3x1");
    // Search config is not written to state
    expect(store.getState().config).toEqual({ charters: { layout: "free" } });
  });
});

describe("number fields", () => {
  it("keeps what is typed and only stores numbers", async () => {
    const { user, store } = renderApp(
      "/games/18Test/map?config=true&section=charters",
    );
    const field = await screen.findByRole("spinbutton", { name: /Border/ });

    await user.clear(field);
    await user.type(field, "1.5");
    expect(field).toHaveValue(1.5);
    expect(store.getState().config.charters?.border).toBeUndefined();
    await user.tab();
    await waitFor(() =>
      expect(store.getState().config.charters?.border).toBe(1.5),
    );
  });

  describe("importing a config", () => {
    const paste = async (user, text) => {
      await user.click(await screen.findByRole("textbox", { name: "Import" }));
      await user.paste(text);
      await user.click(screen.getByRole("button", { name: "Import Config" }));
    };
    const url = "/games/18Test/map?config=true&section=data";

    it("replaces the stored config with the pasted settings", async () => {
      const { user, store } = renderApp(url, {
        config: { export: { allLayouts: true } },
      });

      await paste(user, '{"margin": 100, "font": {"size": "0.2in"}}');

      await waitFor(() =>
        expect(store.getState().config).toEqual({
          margin: 100,
          font: { size: "0.2in" },
        }),
      );
      expect(store.getState().alert).toMatchObject({
        title: "Config Imported",
        type: "success",
      });
      expect(store.getState().errors).toEqual({});
      expect(screen.getByRole("textbox", { name: "Import" })).toHaveValue("");
    });

    it("disables the button until there is text", async () => {
      renderApp(url);
      await screen.findByRole("textbox", { name: "Import" });
      expect(
        screen.getByRole("button", { name: "Import Config" }),
      ).toBeDisabled();
    });

    it("alerts on invalid json and stores nothing", async () => {
      const { user, store } = renderApp(url);

      await paste(user, "{nope");

      await waitFor(() =>
        expect(store.getState().alert).toMatchObject({
          title: "Invalid JSON",
          type: "error",
        }),
      );
      expect(store.getState().config).toEqual({});
    });

    it("alerts on settings the schema rejects and stores nothing", async () => {
      const { user, store } = renderApp(url);

      await paste(user, '{"margin": "wide"}');

      await waitFor(() =>
        expect(store.getState().alert).toMatchObject({
          title: "Invalid Config",
          type: "error",
        }),
      );
      expect(store.getState().config).toEqual({});
      expect(store.getState().errors).toEqual({});
    });
  });
});
