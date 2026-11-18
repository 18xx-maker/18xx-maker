import { act, screen, waitFor, within } from "@testing-library/react";

import { omit } from "ramda";

import games from "@/data/games";
import { editGame, selectGameProblems } from "@/state";
import { selectGameChanged } from "@/state/selectors";

import {
  button,
  cards,
  names,
  open,
  panel,
  registerEditPanelHooks,
  route,
  settled,
  trains,
  trainsRoute,
} from "@tests/support/editPanel.jsx";

registerEditPanelHooks();

describe("edit panel trains", () => {
  it("shows a card for each train with its fields", async () => {
    open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    expect(cards()).toHaveLength(4);
    const first = within(cards()[0]);
    expect(first.getByRole("textbox", { name: "Name" })).toHaveValue("2");
    expect(first.getByRole("spinbutton", { name: "Quantity" })).toHaveValue(4);
    expect(first.getByRole("textbox", { name: "Price" })).toHaveValue("80");
    expect(first.getByRole("textbox", { name: "Color" })).toHaveValue("yellow");
    // The rest is behind More fields
    expect(
      first.queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();
    const infinite = within(cards()[3]);
    expect(
      infinite.getByRole("spinbutton", { name: "Quantity" }),
    ).toBeDisabled();
    expect(infinite.getByRole("button", { name: "Infinity" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("More fields shows the other fields of a train", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(
      within(cards()[0]).getByRole("button", { name: "More fields" }),
    );
    expect(
      within(cards()[0]).getByRole("textbox", { name: "Description" }),
    ).toBeVisible();
    expect(
      within(cards()[0]).getByRole("spinbutton", { name: "Players" }),
    ).toBeVisible();
  });

  it("edits a field of a train in the game", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const price = within(cards()[1]).getByRole("textbox", { name: "Price" });
    await user.clear(price);
    await user.type(price, "200{Enter}");
    expect(trains(store)[1].price).toBe(200);
    expect(trains(store)[0].price).toBe(80);

    // Quantity is a whole number or the infinity toggle
    const quantity = within(cards()[1]).getByRole("spinbutton", {
      name: "Quantity",
    });
    const toggle = within(cards()[1]).getByRole("button", { name: "Infinity" });
    await user.click(toggle);
    expect(trains(store)[1].quantity).toBe("∞");
    expect(quantity).toBeDisabled();
    await user.click(toggle);
    expect(trains(store)[1].quantity).toBe(3);
    expect(quantity).toHaveValue(3);
    await user.clear(quantity);
    await user.type(quantity, "0{Enter}");
    expect(trains(store)[1].quantity).toBe(3);
    expect(await screen.findByText(/whole number of at least 1/)).toBeVisible();
    await user.clear(quantity);
    await user.type(quantity, "5{Enter}");
    expect(trains(store)[1].quantity).toBe(5);
  });

  it("adds a train that is valid and named to not clash", async () => {
    const { user, store } = open(trainsRoute);
    await user.click(await screen.findByRole("button", { name: "Add train" }));
    expect(names(store)).toEqual(["2", "3+1", "4D", "8E", "5"]);
    expect(trains(store)[4]).toEqual({
      name: "5",
      color: "gray",
      quantity: 1,
    });
    expect(selectGameChanged(store.getState())).toBe(true);
    expect(cards()).toHaveLength(5);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Added train 5"),
    );
    // The focus goes to the new train
    expect(within(cards()[4]).getByRole("button", { name: "5" })).toHaveFocus();
  });

  it("adds to a game without trains and removes the key with the last train", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    act(() => store.dispatch(editGame((game) => omit(["trains"], game))));
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Add train" }));
    expect(trains(store)).toEqual([{ name: "1", color: "gray", quantity: 1 }]);

    await user.click(button("Remove train 1"));
    expect("trains" in store.getState().game).toBe(false);
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();
  });

  it("removes a train and puts it back with undo", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });

    await user.click(button("Remove train 3+1"));
    expect(names(store)).toEqual(["2", "4D", "8E"]);
    expect(screen.getByRole("status")).toHaveTextContent("Removed train 3+1");
    // The focus goes to the next card
    expect(
      within(cards()[1]).getByRole("button", { name: "4D" }),
    ).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(names(store)).toEqual(["2", "3+1", "4D", "8E"]);
    expect(trains(store)[1]).toEqual(games["18Test"].trains[1]);
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    // Undo is back to the original game
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("the focus goes to Add train after removing the last train", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Remove train 8E"));
    expect(names(store)).toEqual(["2", "3+1", "4D"]);
    expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();
    // The next card does not exist: the focus is not lost
    expect(screen.getByRole("button", { name: "Add train" })).toHaveFocus();
  });

  it("moves a train up and down, the focus stays on the button", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    expect(button("Move train 2 up")).toBeDisabled();
    expect(button("Move train 8E down")).toBeDisabled();

    await user.click(button("Move train 2 down"));
    expect(names(store)).toEqual(["3+1", "2", "4D", "8E"]);
    expect(button("Move train 2 down")).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Moved train 2 to position 2 of 4",
    );

    await user.click(button("Move train 2 up"));
    expect(names(store)).toEqual(["2", "3+1", "4D", "8E"]);
    // At the top the button is disabled: the focus moves to the other one
    expect(button("Move train 2 down")).toHaveFocus();
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("duplicates a train after the source with a name that is free", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Duplicate train 3+1"));

    expect(names(store)).toEqual(["2", "3+1", "5", "4D", "8E"]);
    expect(trains(store)[2]).toEqual({ ...trains(store)[1], name: "5" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Duplicated train as 5",
    );
  });

  it("edits the right train after a reorder", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Move train 2 down"));

    const price = within(cards()[1]).getByRole("textbox", { name: "Price" });
    expect(price).toHaveValue("80");
    await user.clear(price);
    await user.type(price, "99{Enter}");
    expect(trains(store)[1]).toMatchObject({ name: "2", price: 99 });
    expect(trains(store)[0].name).toBe("3+1");
    expect(trains(store)[0].price).not.toBe(99);
  });

  it("passes on what is typed before it removes another train", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const name = within(cards()[1]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.type(name, "typed");

    // A click that does not move the focus, as on Safari
    act(() => button("Remove train 2").click());
    expect(names(store)).toEqual(["typed", "4D", "8E"]);
    expect(trains(store)[0].name).toBe("typed");
  });

  it("duplicates and undoes a removal with what was typed, without a focus change", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const name = within(cards()[1]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.type(name, "5");

    act(() => button("Duplicate train 3+1").click());
    expect(names(store)).toEqual(["2", "5", "6", "4D", "8E"]);
    expect(trains(store)[2]).toEqual({ ...trains(store)[1], name: "6" });

    const typed = within(cards()[3]).getByRole("textbox", { name: "Name" });
    await user.clear(typed);
    await user.type(typed, "x");
    act(() => button("Remove train 4D").click());
    expect(names(store)).toEqual(["2", "5", "6", "8E"]);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(names(store)).toEqual(["2", "5", "6", "x", "8E"]);
  });

  it("undo passes on what is typed first", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Remove train 8E"));
    const name = within(cards()[0]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.type(name, "typed");
    act(() => button("Undo").click());
    expect(names(store)).toEqual(["typed", "3+1", "4D", "8E"]);
  });

  it("keeps the undo note until the next action on the list", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { user } = open(trainsRoute);
      await screen.findByRole("button", { name: "Add train" });
      await user.click(button("Remove train 2"));
      await act(() => vi.advanceTimersByTimeAsync(30000));
      expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();
      await user.click(button("Move train 3+1 down"));
      expect(
        screen.queryByRole("button", { name: "Undo" }),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("a collapsed card and More fields follow the train when it moves or one is removed", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(within(cards()[0]).getByRole("button", { name: "2" }));
    await user.click(
      within(cards()[1]).getByRole("button", { name: "More fields" }),
    );

    await user.click(button("Move train 2 down"));
    expect(
      within(cards()[1]).getByRole("button", { name: "2" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(cards()[0]).getByRole("textbox", { name: "Description" }),
    ).toBeVisible();
    expect(
      within(cards()[1]).queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();

    await user.click(button("Remove train 3+1"));
    expect(
      within(cards()[0]).getByRole("button", { name: "2" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      within(cards()[0]).queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();
    expect(
      within(cards()[1]).getByRole("button", { name: "4D" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps working after the changes are reverted with the panel open", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    await user.click(button("Remove train 2"));
    expect(names(store)).toEqual(["3+1", "4D", "8E"]);

    act(() => store.dispatch(editGame(() => store.getState().gameOriginal)));
    await waitFor(() => expect(cards()).toHaveLength(4));
    const name = within(cards()[0]).getByRole("textbox", { name: "Name" });
    expect(name).toHaveValue("2");
    await user.clear(name);
    await user.type(name, "two{Enter}");
    expect(names(store)).toEqual(["two", "3+1", "4D", "8E"]);
  });

  it("an empty name shows it is required and keeps the old name", async () => {
    const { user, store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const name = within(cards()[0]).getByRole("textbox", { name: "Name" });
    await user.clear(name);
    await user.tab();

    expect(trains(store)[0].name).toBe("2");
    expect(await screen.findByText("This field is required.")).toBeVisible();
  });

  it("shows the problem of a train on its card", async () => {
    const { store } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    act(() =>
      store.dispatch(
        editGame((game) => ({
          ...game,
          trains: game.trains.map(({ color, ...train }, index) =>
            index === 1 ? train : { color, ...train },
          ),
        })),
      ),
    );
    await waitFor(
      () =>
        expect(within(cards()[1]).getAllByRole("alert").length).toBeGreaterThan(
          0,
        ),
      { timeout: 5000 },
    );
    expect(within(cards()[0]).queryAllByRole("alert")).toHaveLength(0);
  });

  it("the live region says what changed", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    await user.click(button("Remove train 8E"));
    expect(status).toHaveTextContent("Removed train 8E");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(status).toHaveTextContent("Restored train 8E");
  });

  it("a card collapses", async () => {
    const { user } = open(trainsRoute);
    await screen.findByRole("button", { name: "Add train" });
    const toggle = within(cards()[0]).getByRole("button", { name: "2" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      within(cards()[0]).getByRole("textbox", { name: "Name" }),
    ).not.toBeVisible();
  });
});

describe("edit panel privates", () => {
  const privatesRoute = `${route}?edit=true&editSection=privates`;
  const privates = (store) => store.getState().game.privates;
  const privateNames = (store) => privates(store).map((p) => p.name);
  // The 18Test game with its privates replaced
  const withPrivates = (list) => ({
    ...structuredClone(games["18Test"]),
    privates: list,
  });
  const ready = () => screen.findByRole("button", { name: "Add private" });

  it("shows a card for each private with its primary fields", async () => {
    open(privatesRoute);
    await ready();
    expect(cards()).toHaveLength(games["18Test"].privates.length);
    const first = within(cards()[0]);
    expect(first.getByRole("textbox", { name: "Name" })).toHaveValue(
      "Private with an icon",
    );
    expect(first.getByRole("textbox", { name: "Price" })).toHaveValue("100");
    expect(first.getByRole("textbox", { name: "Revenue" })).toHaveValue("5");
    expect(first.getByRole("combobox", { name: "Company" })).toHaveValue("");
    expect(
      within(cards()[1]).getByRole("combobox", { name: "Company" }),
    ).toHaveValue("PRR");
    // The rest is behind More fields
    expect(
      first.queryByRole("textbox", { name: "Description" }),
    ).not.toBeInTheDocument();
  });

  it("picks the icon of a private from the icons of the app", async () => {
    const { user } = open(privatesRoute);
    await ready();
    const card = within(cards()[0]);
    let icon = card.queryByRole("combobox", { name: "Icon" });
    if (!icon) {
      await user.click(card.getByRole("button", { name: "More fields" }));
      icon = card.getByRole("combobox", { name: "Icon" });
    }
    expect(icon).toBeVisible();
  });

  it("More fields shows the other fields and the token has an editor", async () => {
    const { user } = open(privatesRoute);
    await ready();
    await user.click(
      within(cards()[2]).getByRole("button", { name: "More fields" }),
    );
    const card = within(cards()[2]);
    expect(card.getByRole("spinbutton", { name: "Min Players" })).toBeVisible();
    // A description is a textarea
    expect(card.getByRole("textbox", { name: "Description" }).tagName).toBe(
      "TEXTAREA",
    );
    expect(card.getByRole("button", { name: "Edit token" })).toBeVisible();
    // No nested list: the only Add button is the one of the privates
    expect(screen.getAllByRole("button", { name: /^Add / })).toHaveLength(1);
  });

  it("edits a private, what the form has no field for stays", async () => {
    const abilities = [{ type: "x", extra: 1 }];
    const { user, store } = open(
      privatesRoute,
      withPrivates([
        {
          name: "A",
          price: 20,
          revenue: [10, 20],
          token: { color: "green", label: "3" },
          abilities,
        },
      ]),
    );
    await ready();
    const revenue = within(cards()[0]).getByRole("textbox", {
      name: "Revenue",
    });
    expect(revenue).toHaveValue("10/20");

    const price = within(cards()[0]).getByRole("textbox", { name: "Price" });
    await user.clear(price);
    await user.type(price, "30{Enter}");
    expect(privates(store)[0]).toEqual({
      name: "A",
      price: 30,
      revenue: [10, 20],
      token: { color: "green", label: "3" },
      abilities,
    });
  });

  it("a string price stays a string", async () => {
    const { user, store } = open(
      privatesRoute,
      withPrivates([{ name: "A", price: "$100" }]),
    );
    await ready();
    const price = within(cards()[0]).getByRole("textbox", { name: "Price" });
    expect(price).toHaveValue("$100");
    await user.clear(price);
    await user.type(price, "$120{Enter}");
    expect(privates(store)[0].price).toBe("$120");
  });

  it("types the revenue as a number, a list or text", async () => {
    const { user, store } = open(privatesRoute);
    await ready();
    const revenue = within(cards()[0]).getByRole("textbox", {
      name: "Revenue",
    });
    await user.clear(revenue);
    await user.type(revenue, "10/20{Enter}");
    expect(privates(store)[0].revenue).toEqual([10, 20]);
    expect(revenue).toHaveValue("10/20");
    await user.clear(revenue);
    await user.type(revenue, "$10/$20{Enter}");
    expect(privates(store)[0].revenue).toBe("$10/$20");
    await user.clear(revenue);
    await user.type(revenue, "7{Enter}");
    expect(privates(store)[0].revenue).toBe(7);
    await user.clear(revenue);
    await user.type(revenue, "{Enter}");
    expect("revenue" in privates(store)[0]).toBe(false);
  });

  it("adds a private named to not clash", async () => {
    const { user, store } = open(privatesRoute);
    await ready();
    await user.click(screen.getByRole("button", { name: "Add private" }));
    const count = games["18Test"].privates.length;
    expect(privates(store)).toHaveLength(count + 1);
    expect(privates(store)[count]).toEqual({ name: String(count + 1) });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        `Added private ${count + 1}`,
      ),
    );
    expect(
      within(cards()[count]).getByRole("button", { name: String(count + 1) }),
    ).toHaveFocus();
  });

  it("adds to an empty list and removes the key with the last private", async () => {
    const { user, store } = open(privatesRoute, withPrivates([]));
    await ready();
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Add private" }));
    expect(privates(store)).toEqual([{ name: "1" }]);

    await user.click(button("Remove private 1"));
    expect("privates" in store.getState().game).toBe(false);
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();
  });

  it("removes a private and puts it back with undo", async () => {
    const { user, store } = open(privatesRoute);
    await ready();
    await user.click(button("Remove private Private with a company"));
    expect(privateNames(store)).not.toContain("Private with a company");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed private Private with a company",
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(privates(store)).toEqual(games["18Test"].privates);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("moves and duplicates a private", async () => {
    const { user, store } = open(privatesRoute);
    await ready();
    const [first, second] = games["18Test"].privates.map((p) => p.name);
    expect(button(`Move private ${first} up`)).toBeDisabled();

    await user.click(button(`Move private ${first} down`));
    expect(privateNames(store).slice(0, 2)).toEqual([second, first]);
    expect(button(`Move private ${first} down`)).toHaveFocus();

    await user.click(button(`Duplicate private ${first}`));
    const count = games["18Test"].privates.length;
    expect(privates(store)).toHaveLength(count + 1);
    expect(privates(store)[2]).toEqual({
      ...privates(store)[1],
      name: String(count + 1),
    });
  });

  it("shows the problem of a private on its card", async () => {
    const { store } = open(privatesRoute);
    await ready();
    act(() =>
      store.dispatch(
        editGame((game) => ({
          ...game,
          privates: game.privates.map((p, index) =>
            index === 1 ? { ...p, revenue: "abc" } : p,
          ),
        })),
      ),
    );
    await waitFor(
      () =>
        expect(within(cards()[1]).getAllByRole("alert").length).toBeGreaterThan(
          0,
        ),
      { timeout: 5000 },
    );
    expect(within(cards()[0]).queryAllByRole("alert")).toHaveLength(0);
  });

  it("an unknown key survives an edit", async () => {
    const { user, store } = open(
      privatesRoute,
      withPrivates([{ name: "A", price: 5, unknownKey: 1 }]),
    );
    await ready();
    const price = within(cards()[0]).getByRole("textbox", { name: "Price" });
    await user.clear(price);
    await user.type(price, "6{Enter}");
    expect(privates(store)[0]).toEqual({ name: "A", price: 6, unknownKey: 1 });
  });

  it("shows a pattern problem for a price format and keeps an icon size of 0", async () => {
    const { user, store } = open(privatesRoute, withPrivates([{ name: "A" }]));
    await ready();
    await user.click(
      within(cards()[0]).getByRole("button", { name: "More fields" }),
    );
    const format = within(cards()[0]).getByRole("textbox", {
      name: "Price Format",
    });
    await user.type(format, "G{Enter}");
    expect(privates(store)[0].priceFormat).toBe("G");
    await waitFor(
      () =>
        expect(within(cards()[0]).getAllByRole("alert").length).toBeGreaterThan(
          0,
        ),
      { timeout: 5000 },
    );

    const size = within(cards()[0]).getByRole("spinbutton", {
      name: "Icon Size",
    });
    await user.type(size, "0{Enter}");
    expect(privates(store)[0].iconSize).toBe(0);
  });
});

describe("edit panel phases", () => {
  const phasesRoute = `${route}?edit=true&editSection=phases`;
  const phases = (store) => store.getState().game.phases;
  const phaseNames = (store) => phases(store).map((p) => p.name);
  const withPhases = (list) => ({
    ...structuredClone(games["18Test"]),
    phases: list,
  });
  const ready = () => screen.findByRole("button", { name: "Add phase" });
  const text = (index, name) =>
    within(cards()[index]).getByRole("textbox", { name });
  const trainBox = (index) =>
    within(cards()[index]).getByRole("combobox", { name: "Train" });
  const more = (user, index) =>
    user.click(
      within(cards()[index]).getByRole("button", { name: "More fields" }),
    );
  const keyed = [
    { train: "2H", limit: 4, tiles: "yellow" },
    { train: ["3H", "3M"], limit: 4, tiles: "green" },
  ];

  it("is the tab after the players, with a card for each phase", async () => {
    open(phasesRoute);
    await ready();
    const tabs = screen.getAllByRole("tab");
    const phases = tabs.findIndex((tab) => tab.id.endsWith("phases"));
    expect(tabs[phases - 1]).toHaveAccessibleName("Players");
    expect(tabs[phases]).toHaveAccessibleName("Phases");
    expect(tabs[phases]).toHaveAttribute("aria-selected", "true");
    expect(cards()).toHaveLength(games["18Test"].phases.length);
  });

  it("shows the primary fields of a phase, the rest is behind More fields", async () => {
    const { user } = open(phasesRoute);
    await ready();
    expect(text(0, "Name")).toHaveValue("2");
    expect(text(0, "Limit")).toHaveValue("4");
    expect(text(0, "Tiles")).toHaveValue("yellow");
    expect(trainBox(0)).toHaveValue("");
    expect(
      within(cards()[1]).getByRole("button", { name: "Remove 3+1" }),
    ).toBeVisible();
    expect(text(4, "Limit")).toHaveValue("3");
    expect(
      within(cards()[0]).getByRole("combobox", { name: "Minor" }),
    ).toHaveTextContent("Yes");
    expect(
      within(cards()[0]).getByRole("spinbutton", { name: "Rounds" }),
    ).toBeVisible();
    expect(
      within(cards()[0]).queryByRole("textbox", { name: "Notes" }),
    ).not.toBeInTheDocument();

    await more(user, 0);
    const card = within(cards()[0]);
    expect(card.getByRole("combobox", { name: "Company" })).toBeVisible();
    expect(card.getByRole("textbox", { name: "Notes" })).toBeVisible();
    expect(card.getByRole("combobox", { name: "Buy Companies" })).toBeVisible();
    // The event of a phase names a train
    expect(card.getByRole("combobox", { name: "On" })).toBeVisible();
    // No nested list: the only Add button is the one of the phases
    expect(screen.getAllByRole("button", { name: /^Add / })).toHaveLength(1);
  });

  it("marks the limit and the tiles as required, the name is not", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    const card = within(cards()[0]);
    expect(card.getByRole("textbox", { name: /Limit/ })).toBeRequired();
    expect(card.getByRole("textbox", { name: /Tiles/ })).toBeRequired();
    expect(card.getByRole("textbox", { name: "Name" })).not.toBeRequired();

    await user.clear(text(0, "Tiles"));
    await user.tab();
    expect(phases(store)[0].tiles).toBe("yellow");
    expect(await screen.findByText("This field is required.")).toBeVisible();

    // The name of a phase can be removed
    await user.clear(text(0, "Name"));
    await user.tab();
    expect("name" in phases(store)[0]).toBe(false);
  });

  it("edits the limit: a number, ∞ or a fraction, anything else is refused", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    const limit = () => text(1, "Limit");

    await user.clear(limit());
    await user.type(limit(), "∞{Enter}");
    expect(phases(store)[1].limit).toBe("∞");
    await user.clear(limit());
    await user.type(limit(), "3/4{Enter}");
    expect(phases(store)[1].limit).toBe("3/4");
    await user.clear(limit());
    await user.type(limit(), "0{Enter}");
    expect(phases(store)[1].limit).toBe("3/4");
    expect(await screen.findByText(/whole number of at least 1/)).toBeVisible();
    expect(screen.queryByText(/must be/i)).not.toBeInTheDocument();
    await user.clear(limit());
    await user.type(limit(), " 5 {Enter}");
    expect(phases(store)[1].limit).toBe(5);
    expect(phases(store)[0].limit).toBe(4);
  });

  it("the train is one name, or a list of them, picked or typed", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    const remove = (name) =>
      user.click(
        within(cards()[1]).getByRole("button", { name: `Remove ${name}` }),
      );

    await remove("3+1");
    expect("train" in phases(store)[1]).toBe(false);
    expect(phases(store)[1].name).toBe("3");

    // A name of the trains of the game is a suggestion
    await user.click(trainBox(1));
    const option = screen.getAllByRole("option")[0];
    const picked = option.firstChild.textContent;
    await user.click(option);
    expect(phases(store)[1].train).toBe(picked);

    // Free text is taken, two names are a list
    await user.type(trainBox(1), "  2M  {Enter}");
    expect(phases(store)[1].train).toEqual([picked, "2M"]);
    await remove(picked);
    expect(phases(store)[1].train).toBe("2M");
    await remove("2M");
    expect("train" in phases(store)[1]).toBe(false);
  });

  it("keeps a list of one name when it is left unchanged", async () => {
    const { user, store } = open(
      phasesRoute,
      withPhases([{ name: "2", train: ["4H"], limit: 4, tiles: "yellow" }]),
    );
    await ready();
    expect(
      within(cards()[0]).getByRole("button", { name: "Remove 4H" }),
    ).toBeVisible();
    await user.click(trainBox(0));
    await user.tab();
    expect(phases(store)[0].train).toEqual(["4H"]);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("the notes are a text or a list, one per line", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    await more(user, 0);
    expect(text(0, "Notes")).toHaveAccessibleDescription(/One per line/);
    await user.type(text(0, "Notes"), "First{Enter}Second");
    await user.tab();
    expect(phases(store)[0].notes).toEqual(["First", "Second"]);
    expect(phases(store)[0]).toMatchObject({ name: "2", limit: 4 });
  });

  it("the buy companies flag and the events keep the other keys", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    await more(user, 4);
    const card = within(cards()[4]);
    expect(
      card.getByRole("combobox", { name: "Close Companies" }),
    ).toHaveTextContent("Yes");

    await user.click(card.getByRole("combobox", { name: "Remove Tokens" }));
    await user.click(await screen.findByRole("option", { name: "Yes" }));
    expect(phases(store)[4].events).toEqual({
      closeCompanies: true,
      removeTokens: true,
    });
    expect(phases(store)[4]).toMatchObject({
      name: "4",
      train: "4D",
      limit: 3,
    });
  });

  it("adds a phase that is valid and named to not clash", async () => {
    const { user, store } = open(phasesRoute);
    await user.click(await ready());
    const count = games["18Test"].phases.length;
    expect(phases(store)).toHaveLength(count + 1);
    expect(phases(store)[count]).toEqual({
      name: String(count + 1),
      limit: 4,
      tiles: "yellow",
    });
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        `Added phase ${count + 1}`,
      ),
    );
    expect(
      within(cards()[count]).getByRole("button", { name: String(count + 1) }),
    ).toHaveFocus();
    // The new phase is valid: the problems check has nothing on it
    await settled();
    await waitFor(() =>
      expect(
        selectGameProblems(store.getState(), "internal:abc"),
      ).toBeDefined(),
    );
    expect(
      selectGameProblems(store.getState(), "internal:abc").filter((issue) =>
        issue.pointer.startsWith(`phases[${count}]`),
      ),
    ).toEqual([]);
  });

  it("adds to a game without phases and removes the key with the last phase", async () => {
    const { user, store } = open(phasesRoute, withPhases([]));
    await ready();
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Add phase" }));
    expect(phases(store)).toEqual([{ name: "1", limit: 4, tiles: "yellow" }]);

    await user.click(button("Remove phase 1"));
    expect("phases" in store.getState().game).toBe(false);
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();
  });

  it("removes a phase and puts it back with undo", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    await user.click(button("Remove phase 8"));
    expect(phaseNames(store)).toEqual(["2", "3", "2", "3", "4"]);
    expect(screen.getByRole("status")).toHaveTextContent("Removed phase 8");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(phases(store)).toEqual(games["18Test"].phases);
    expect(selectGameChanged(store.getState())).toBe(false);
  });

  it("moves and duplicates a phase", async () => {
    const { user, store } = open(phasesRoute);
    await ready();
    expect(button("Move phase 4 down")).toBeEnabled();
    await user.click(button("Move phase 4 down"));
    expect(phaseNames(store)).toEqual(["2", "3", "2", "3", "8", "4"]);
    expect(button("Move phase 4 down")).toBeDisabled();

    await user.click(button("Duplicate phase 8"));
    expect(phaseNames(store)).toEqual(["2", "3", "2", "3", "8", "7", "4"]);
    expect(phases(store)[5]).toEqual({ ...phases(store)[4], name: "7" });
  });

  it("shows a phase with no name by its train, or trains", async () => {
    open(phasesRoute, withPhases(keyed));
    await ready();
    expect(cards()).toHaveLength(2);
    expect(
      within(cards()[0]).getByRole("button", { name: "2H" }),
    ).toBeVisible();
    expect(
      within(cards()[1]).getByRole("button", { name: "3H, 3M" }),
    ).toBeVisible();
    expect(button("Remove phase 3H, 3M")).toBeVisible();
    expect(
      within(cards()[1]).getByRole("button", { name: "Remove 3H" }),
    ).toBeVisible();
    expect(
      within(cards()[1]).getByRole("button", { name: "Remove 3M" }),
    ).toBeVisible();
  });

  it("a phase with neither name nor train is #n", async () => {
    open(phasesRoute, withPhases([{ limit: 4, tiles: "yellow" }]));
    await ready();
    expect(
      within(cards()[0]).getByRole("button", { name: "#1" }),
    ).toBeVisible();
  });

  it("a game keyed by train gets a phase with a train, not a name", async () => {
    const { user, store } = open(phasesRoute, withPhases(keyed));
    await ready();
    await user.click(screen.getByRole("button", { name: "Add phase" }));
    expect(phases(store)[2]).toEqual({
      train: "3",
      limit: 4,
      tiles: "yellow",
    });
    expect(phases(store).every((phase) => !("name" in phase))).toBe(true);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Added phase 3"),
    );
  });

  it("duplicating a phase without a name does not give the copy one", async () => {
    const { user, store } = open(phasesRoute, withPhases(keyed));
    await ready();
    await user.click(button("Duplicate phase 2H"));
    expect(phases(store)).toHaveLength(3);
    expect(phases(store)[1]).toEqual({ ...keyed[0], train: "3" });
    expect(phases(store).some((phase) => "name" in phase)).toBe(false);
  });
});

describe("edit panel players", () => {
  const playersRoute = `${route}?edit=true&editSection=players`;
  const players = (store) => store.getState().game.players;
  const ready = () => screen.findByRole("button", { name: "Add player" });
  const box = (el, name) => within(el).getByRole("textbox", { name });
  const spin = (el, name) => within(el).getByRole("spinbutton", { name });
  const withPlayers = (list) => ({
    ...structuredClone(games["18Test"]),
    players: list,
  });
  const count = games["18Test"].players.length;

  it("is a tab, with a card for each player count", async () => {
    open(playersRoute);
    await ready();
    const tabs = screen.getAllByRole("tab");
    const tab = tabs.find((candidate) => candidate.id.endsWith("players"));
    expect(tab).toHaveAccessibleName("Players");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(cards()).toHaveLength(count);
    expect(
      within(cards()[0]).getByRole("button", { name: "1 player" }),
    ).toBeVisible();
  });

  it("selects by click", async () => {
    const { user, router } = open(`${route}?edit=true`);
    await panel();
    await user.click(screen.getByRole("tab", { name: "Players" }));
    await ready();
    expect(router.state.location.search).toBe("?edit=true&editSection=players");
  });

  it("edits the bank, the capital and the cert limit", async () => {
    const { user, store } = open(playersRoute);
    await ready();
    const panelScope = screen.getByTestId("edit-panel");
    const bank = box(panelScope, /^Bank$/);
    expect(bank).toHaveValue("12345");

    await user.clear(bank);
    await user.type(bank, "∞{Enter}");
    expect(store.getState().game.bank).toBe("∞");
    await user.clear(bank);
    await user.type(bank, "9000{Enter}");
    expect(store.getState().game.bank).toBe(9000);

    // The game's value comes before the cards
    const capital = within(panelScope).getAllByRole("textbox", {
      name: /^Capital$/,
    })[0];
    await user.type(capital, "600{Enter}");
    expect(store.getState().game.capital).toBe(600);

    const limit = within(panelScope).getAllByRole("textbox", {
      name: /^Cert Limit$/,
    })[0];
    await user.type(limit, "3/4{Enter}");
    expect(store.getState().game.certLimit).toBe("3/4");
    await user.clear(limit);
    await user.type(limit, "20{Enter}");
    expect(store.getState().game.certLimit).toBe(20);
  });

  it("reports a bank that is not allowed", async () => {
    const { user, store } = open(playersRoute);
    await ready();
    const panelScope = screen.getByTestId("edit-panel");
    await user.type(box(panelScope, /^Bank$/), "abc{Enter}");
    await settled();
    await waitFor(() => {
      const pointers = selectGameProblems(store.getState(), "internal:abc").map(
        (issue) => issue.pointer,
      );
      expect(pointers).toEqual(expect.arrayContaining(["bank"]));
    });
  });

  it("shows the number, capital and cert limit, the bank is under More fields", async () => {
    const { user } = open(playersRoute);
    await ready();
    const card = cards()[1];
    expect(spin(card, /Number/)).toHaveValue(2);
    expect(box(card, /Capital/)).toHaveValue("1200");
    expect(box(card, /Cert Limit/)).toHaveValue("28");
    expect(
      within(card).queryByRole("textbox", { name: /^Bank$/ }),
    ).not.toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "More fields" }));
    expect(within(card).getByRole("textbox", { name: /^Bank$/ })).toBeVisible();
  });

  it("adds a player with the next number as a number, and removes the key with the last one", async () => {
    const { user, store } = open(
      playersRoute,
      withPlayers([{ number: 3 }, { number: 5 }]),
    );
    await ready();
    await user.click(screen.getByRole("button", { name: "Add player" }));
    expect(players(store)).toEqual([
      { number: 3 },
      { number: 5 },
      { number: 6 },
    ]);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Added player 6 players",
      ),
    );

    await user.click(button("Remove player 6 players"));
    await user.click(button("Remove player 5 players"));
    await user.click(button("Remove player 3 players"));
    expect("players" in store.getState().game).toBe(false);
    expect(await screen.findByText("Nothing here yet.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Add player" }));
    expect(players(store)).toEqual([{ number: 1 }]);
  });

  it("duplicates a player with a free number, also when numbers repeat", async () => {
    const { user, store } = open(
      playersRoute,
      withPlayers([{ number: 2, capital: 100 }, { number: 2 }]),
    );
    await ready();
    await user.click(
      screen.getAllByRole("button", { name: "Duplicate player 2 players" })[0],
    );
    expect(players(store).map((p) => p.number)).toEqual([2, 3, 2]);
    expect(players(store)[1].capital).toBe(100);
  });

  it("removes with undo, and moves", async () => {
    const { user, store } = open(playersRoute);
    await ready();
    await user.click(button("Remove player 2 players"));
    expect(players(store).map((p) => p.number)).toEqual([1, 3, 4, 5, 6]);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(players(store).map((p) => p.number)).toEqual([1, 2, 3, 4, 5, 6]);

    await user.click(button("Move player 1 player down"));
    expect(players(store).map((p) => p.number)).toEqual([2, 1, 3, 4, 5, 6]);
  });

  it("retitles a card when its number changes, and a number cannot be cleared", async () => {
    const { user, store } = open(playersRoute);
    await ready();
    const first = () => cards()[0];
    await user.clear(spin(first(), /Number/));
    await user.type(spin(first(), /Number/), "7{Enter}");
    expect(players(store)[0].number).toBe(7);
    expect(
      within(first()).getByRole("button", { name: "7 players" }),
    ).toBeVisible();
    expect(button("Remove player 7 players")).toBeVisible();

    await user.clear(spin(first(), /Number/));
    await user.tab();
    expect(players(store)[0].number).toBe(7);
    expect(await screen.findByText("This field is required.")).toBeVisible();
  });

  it("keeps a text cert limit as text, and the trains keep their names", async () => {
    const { user, store } = open(
      playersRoute,
      withPlayers([{ number: 2, certLimit: "3/4" }]),
    );
    await ready();
    expect(box(cards()[0], /Cert Limit/)).toHaveValue("3/4");
    await user.click(screen.getByRole("tab", { name: "Trains" }));
    expect(
      await screen.findByRole("button", { name: "Add train" }),
    ).toBeVisible();
    expect(players(store)[0].certLimit).toBe("3/4");
    expect(within(cards()[0]).getByRole("button", { name: "2" })).toBeVisible();
  });
});
