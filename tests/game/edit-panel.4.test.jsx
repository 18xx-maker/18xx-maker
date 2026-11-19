import { act, screen, waitFor, within } from "@testing-library/react";

import games from "@/data/games";
import { editGame } from "@/state";
import { selectGameChanged } from "@/state/selectors";

import { allowConsole } from "@tests/support/console.js";
import {
  button,
  cards,
  open,
  registerEditPanelHooks,
  route,
} from "@tests/support/editPanel.jsx";

registerEditPanelHooks();

describe("edit panel companies", () => {
  const companiesRoute = `${route}?edit=true&editSection=companies`;
  const companies = (store) => store.getState().game.companies;
  const abbrevs = (store) => companies(store).map((c) => c.abbrev);
  const withCompanies = (list) => ({
    ...structuredClone(games["18Test"]),
    companies: list,
  });
  const ready = () => screen.findByRole("button", { name: "Add company" });
  // The button that opens and closes a card
  const toggleOf = (index) => within(cards()[index]).getAllByRole("button")[0];
  const text = (index, name) =>
    within(cards()[index]).getByRole("textbox", { name });

  it("is the tab before the privates, with a closed card for each company", async () => {
    open(companiesRoute);
    await ready();
    const tabs = screen.getAllByRole("tab");
    const privates = tabs.findIndex((tab) => tab.id.endsWith("privates"));
    expect(tabs[privates - 1]).toHaveAccessibleName("Companies");
    expect(tabs[privates - 1]).toHaveAttribute("aria-selected", "true");
    expect(cards()).toHaveLength(games["18Test"].companies.length);
    for (let i = 0; i < cards().length; i++) {
      expect(toggleOf(i)).toHaveAttribute("aria-expanded", "false");
    }
    // Closed cards hide their fields
    expect(text(0, "Name")).not.toBeVisible();
  });

  it("shows the name and the abbreviation on a closed card, with the company token", async () => {
    open(companiesRoute);
    await ready();
    expect(toggleOf(0)).toHaveAccessibleName("Black Railroad BLRR");
    expect(toggleOf(0)).toHaveTextContent("Black Railroad");
    expect(
      within(toggleOf(0)).getByText("BLRR", { selector: "span" }),
    ).toBeVisible();
    const token = within(toggleOf(0)).getByTestId("company-token");
    expect(token).toHaveAttribute("aria-hidden", "true");
    expect(token).toHaveTextContent("BLRR");
  });

  it("shows no token on a closed card of a company it cannot draw", async () => {
    const { store } = open(companiesRoute);
    await ready();
    act(() =>
      store.dispatch(
        editGame((game) => ({
          ...game,
          companies: game.companies.map((company, index) =>
            index === 0
              ? { name: company.name, abbrev: 7, color: 3 }
              : index === 1
                ? { name: company.name }
                : company,
          ),
        })),
      ),
    );
    await waitFor(() =>
      expect(
        within(toggleOf(0)).queryByTestId("company-token"),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(toggleOf(1)).queryByTestId("company-token"),
    ).not.toBeInTheDocument();
    expect(toggleOf(2)).toBeVisible();
    expect(within(toggleOf(2)).getByTestId("company-token")).toBeVisible();
  });

  it("drops a token that fails to draw and brings it back once the company is valid", async () => {
    allowConsole(/./);
    const { store, user } = open(companiesRoute);
    await ready();
    const setToken = (token) =>
      act(() =>
        store.dispatch(
          editGame((game) => ({
            ...game,
            companies: game.companies.map((company, index) =>
              index === 0 ? { ...company, token } : company,
            ),
          })),
        ),
      );
    setToken({ icon: "nope" });
    await waitFor(() =>
      expect(
        within(toggleOf(0)).queryByTestId("company-token"),
      ).not.toBeInTheDocument(),
    );
    await user.click(toggleOf(0));
    expect(toggleOf(0)).toHaveAttribute("aria-expanded", "true");
    setToken({ icon: "train" });
    await waitFor(() =>
      expect(within(toggleOf(0)).getByTestId("company-token")).toBeVisible(),
    );
  });

  it("opens a card with its primary fields, the rest is behind More fields", async () => {
    const { user } = open(companiesRoute);
    await ready();
    await user.click(toggleOf(14));
    expect(toggleOf(14)).toHaveAttribute("aria-expanded", "true");
    expect(text(14, "Name")).toHaveValue("Violet Railroad");
    expect(text(14, "Abbrev")).toHaveValue("VRR");
    expect(text(14, "Color")).toHaveValue("violet");
    expect(
      within(cards()[14]).getByRole("combobox", { name: /Minor/ }),
    ).toHaveTextContent("Yes");
    expect(
      within(cards()[14]).queryByRole("combobox", { name: "Logo" }),
    ).not.toBeInTheDocument();

    await user.click(
      within(cards()[14]).getByRole("button", { name: "More fields" }),
    );
    expect(
      within(cards()[14]).getByRole("combobox", { name: "Logo" }),
    ).toBeVisible();
    expect(text(14, "Banner")).toHaveValue("MINOR");
    expect(text(14, "Shares").tagName).toBe("TEXTAREA");
  });

  it("edits a company in the game and keeps what the form has no field for", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    const before = structuredClone(companies(store)[0]);
    await user.click(toggleOf(0));
    const name = text(0, "Name");
    await user.clear(name);
    await user.type(name, "Night Railroad{Enter}");
    expect(companies(store)[0]).toEqual({ ...before, name: "Night Railroad" });
    // The closed card follows
    await user.click(toggleOf(0));
    expect(toggleOf(0)).toHaveAccessibleName("Night Railroad BLRR");
  });

  // Heavy on purpose: it opens all 20 cards and every card renders all its
  // fields, so each click re-renders more (4 s on a laptop, 30 s on a loaded
  // CI runner). The default 30 s limit made it flaky; 120 s leaves room.
  it(
    "opens each company and leaves the game byte for byte as it was",
    { timeout: 120_000 },
    async () => {
      const { user, store } = open(companiesRoute);
      await ready();
      const before = JSON.stringify(companies(store));
      for (let i = 0; i < cards().length; i++) {
        await user.click(toggleOf(i));
        await user.click(
          within(cards()[i]).getByRole("button", { name: "More fields" }),
        );
      }
      // Focus and leave every field: nothing was typed, so nothing changes
      for (const box of within(screen.getByTestId("edit-panel")).getAllByRole(
        "textbox",
      )) {
        box.focus();
        box.blur();
      }
      expect(JSON.stringify(companies(store))).toBe(before);
      expect(selectGameChanged(store.getState())).toBe(false);
    },
  );

  it("invalid JSON in a complex field shows a problem and keeps the game", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    const before = JSON.stringify(companies(store));
    await user.click(toggleOf(0));
    await user.click(
      within(cards()[0]).getByRole("button", { name: "More fields" }),
    );
    const trains = text(0, "Trains");
    await user.clear(trains);
    await user.type(trains, "nope");
    await user.tab();
    expect(within(cards()[0]).getByText("Enter valid JSON.")).toBeVisible();
    expect(JSON.stringify(companies(store))).toBe(before);

    // Valid JSON is saved
    await user.clear(trains);
    await user.type(trains, "false");
    await user.tab();
    expect(companies(store)[0].trains).toBe(false);
  });

  it("adds an open company with a name and an abbreviation no other has", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    const count = companies(store).length;
    await user.click(button("Add company"));
    expect(companies(store)).toHaveLength(count + 1);
    expect(companies(store)[count]).toEqual({
      name: String(count + 1),
      abbrev: "NEW",
    });
    expect(toggleOf(count)).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf(count)).toHaveFocus();
    expect(toggleOf(0)).toHaveAttribute("aria-expanded", "false");

    await user.click(button("Add company"));
    expect(companies(store)[count + 1].abbrev).toBe("NEW2");
    expect(screen.getByRole("status")).toHaveTextContent("Added company");
  });

  it("a new company in a game without companies creates the key, the last removal deletes it", async () => {
    const { user, store } = open(
      companiesRoute,
      withCompanies([{ name: "A", abbrev: "A" }]),
    );
    await ready();
    await user.click(button("Remove company A"));
    expect(store.getState().game.companies).toBeUndefined();
    expect(screen.getByText("Nothing here yet.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(companies(store)).toEqual([{ name: "A", abbrev: "A" }]);
    await user.click(button("Remove company A"));
    await user.click(button("Add company"));
    expect(companies(store)).toEqual([{ name: "1", abbrev: "NEW" }]);
  });

  it("removes a company and puts it back with undo, still closed", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    const original = structuredClone(companies(store)[2]);
    await user.click(button("Remove company Blue Railroad"));
    expect(companies(store)).toHaveLength(games["18Test"].companies.length - 1);
    expect(abbrevs(store)).not.toContain("BRR");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(companies(store)[2]).toEqual(original);
    expect(toggleOf(2)).toHaveAttribute("aria-expanded", "false");
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("moves a company, an open card stays open", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    await user.click(toggleOf(1));
    await user.click(button("Move company Light Blue Railroad up"));
    expect(abbrevs(store).slice(0, 2)).toEqual(["LBRR", "BLRR"]);
    expect(toggleOf(0)).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf(1)).toHaveAttribute("aria-expanded", "false");
    expect(button("Move company Black Railroad down")).toBeEnabled();
    await user.click(button("Move company Light Blue Railroad down"));
    expect(abbrevs(store).slice(0, 2)).toEqual(["BLRR", "LBRR"]);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("duplicates a company with a free abbreviation, whatever the case", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    await user.click(button("Duplicate company Pink Railroad"));
    const at = companies(store).findIndex((c) => c.abbrev === "PRR");
    expect(companies(store)[at + 1]).toEqual({
      ...companies(store)[at],
      name: String(games["18Test"].companies.length + 1),
      abbrev: "PRR2",
    });
    expect(toggleOf(at + 1)).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf(at)).toHaveAttribute("aria-expanded", "false");

    await user.click(button("Duplicate company Pink Railroad"));
    expect(abbrevs(store).filter((a) => a.startsWith("PRR"))).toEqual([
      "PRR",
      "PRR3",
      "PRR2",
    ]);
  });

  it("duplicates a company whose abbreviation is not a string", async () => {
    const { user, store } = open(
      companiesRoute,
      withCompanies([{ name: "A", abbrev: 3 }]),
    );
    await ready();
    await user.click(button("Duplicate company A"));
    expect(companies(store)).toHaveLength(2);
    expect(companies(store)[1].abbrev).toBe("NEW");
  });

  it("a copy does not clash with an abbreviation of another case", async () => {
    const { user, store } = open(
      companiesRoute,
      withCompanies([
        { name: "A", abbrev: "prr" },
        { name: "B", abbrev: "Prr2" },
      ]),
    );
    await ready();
    await user.click(button("Duplicate company A"));
    expect(abbrevs(store)).toEqual(["prr", "prr3", "Prr2"]);
  });

  it("marks a closed card with a problem, and shows the message when it is open", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    expect(
      screen.queryByRole("img", { name: /has a problem/ }),
    ).not.toBeInTheDocument();
    act(() =>
      store.dispatch(
        editGame((game) => ({
          ...game,
          companies: game.companies.map(({ abbrev, ...company }, index) =>
            index === 2 ? company : { abbrev, ...company },
          ),
        })),
      ),
    );
    const marker = await screen.findByRole(
      "img",
      { name: "The company Blue Railroad has a problem" },
      { timeout: 5000 },
    );
    expect(within(cards()[2]).getByRole("img")).toBe(marker);
    expect(toggleOf(2)).toHaveAttribute("aria-describedby", marker.id);
    expect(screen.getAllByRole("img", { name: /has a problem/ })).toHaveLength(
      1,
    );

    await user.click(toggleOf(2));
    expect(toggleOf(2)).not.toHaveAttribute("aria-describedby");
    expect(
      screen.queryByRole("img", { name: /has a problem/ }),
    ).not.toBeInTheDocument();
    expect(within(cards()[2]).getAllByRole("alert").length).toBeGreaterThan(0);
  });

  it("an empty abbreviation is refused as required", async () => {
    const { user, store } = open(companiesRoute);
    await ready();
    await user.click(toggleOf(0));
    const abbrev = text(0, "Abbrev");
    await user.clear(abbrev);
    await user.tab();
    expect(companies(store)[0].abbrev).toBe("BLRR");
    expect(
      within(cards()[0]).getByText("This field is required."),
    ).toBeVisible();
  });

  it("the name falls back to #n and the abbreviation is left out", async () => {
    open(companiesRoute, withCompanies([{ abbrev: "X" }, { name: "B" }]));
    await ready();
    expect(toggleOf(0)).toHaveAccessibleName("#1 X");
    expect(toggleOf(1)).toHaveAccessibleName("B");
  });

  it("is the tab in the url, and the trains tab is not collapsed", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await user.click(await screen.findByRole("tab", { name: "Companies" }));
    expect(router.state.location.search).toBe(
      "?edit=true&editSection=companies",
    );
    await ready();

    await user.click(screen.getByRole("tab", { name: "Trains" }));
    await screen.findByRole("button", { name: "Add train" });
    // Trains start open, with the title as it was
    expect(toggleOf(0)).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf(0)).toHaveAccessibleName("2");
    expect(text(0, "Name")).toHaveValue("2");
    expect(
      within(cards()[0]).getByRole("spinbutton", { name: "Quantity" }),
    ).toBeVisible();
    expect(
      within(cards()[0]).queryByRole("textbox", { name: "Abbrev" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /has a problem/ }),
    ).not.toBeInTheDocument();
  });
});
