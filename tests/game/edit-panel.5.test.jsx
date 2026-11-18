import { screen, waitFor, within } from "@testing-library/react";

import games from "@/data/games";

import { allowConsole } from "@tests/support/console.js";
import {
  cards,
  open,
  opened,
  registerEditPanelHooks,
  route,
} from "@tests/support/editPanel.jsx";

registerEditPanelHooks();

describe("edit panel tokens", () => {
  const tokensRoute = `${route}?edit=true&editSection=tokens`;
  const ready = () => screen.findAllByRole("button", { name: "Add token" });
  const game = () => opened.getState().game;

  it("is a tab, with a row or card for each token", async () => {
    open(tokensRoute);
    await ready();
    const tabs = screen.getAllByRole("tab");
    const tab = tabs.find((candidate) => candidate.id.endsWith("tokens"));
    expect(tab).toHaveAccessibleName("Tokens");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(tabs[tabs.indexOf(tab) + 1]).toHaveAccessibleName("Trains");
    // A token of text is a field, an object is a card
    expect(
      screen.getByRole("textbox", { name: "Value of token Round" }),
    ).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: "Add token with options" })[0],
    ).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: "Add share" }).length,
    ).toBeGreaterThan(0);
  });

  it("edits a text token, as a number when it is one", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokens: ["Round", 5],
    });
    await ready();
    const first = screen.getByRole("textbox", { name: "Value of token Round" });
    await user.clear(first);
    await user.type(first, "Stop");
    await user.tab();
    const second = screen.getByRole("textbox", { name: "Value of token 5" });
    await user.clear(second);
    await user.type(second, "7");
    await user.tab();
    expect(game().tokens).toEqual(["Stop", 7]);
  });

  it("adds, duplicates, moves and removes tokens of text and of options", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokens: ["A"],
    });
    await ready();
    await user.click(screen.getAllByRole("button", { name: "Add token" })[0]);
    expect(game().tokens).toEqual(["A", ""]);
    await user.click(
      screen.getAllByRole("button", { name: "Add token with options" })[0],
    );
    expect(game().tokens).toEqual(["A", "", {}]);

    await user.type(
      screen.getAllByRole("textbox", { name: "Label" })[0],
      "Mail",
    );
    await user.tab();
    expect(game().tokens[2]).toEqual({ label: "Mail" });
    await user.click(
      screen.getByRole("button", { name: "Duplicate token Mail" }),
    );
    expect(game().tokens[3]).toEqual({ label: "Mail" });
    await user.click(screen.getByRole("button", { name: "Duplicate token A" }));
    expect(game().tokens.slice(0, 2)).toEqual(["A", "A"]);
    await user.click(
      screen.getAllByRole("button", { name: "Move token A down" })[0],
    );
    await user.click(
      screen.getAllByRole("button", { name: "Remove token A" })[0],
    );
    await user.click(
      screen.getAllByRole("button", { name: "Remove token Mail" })[0],
    );
    expect(game().tokens).toEqual(["A", "", { label: "Mail" }]);
  });

  it("edits the tokens and shares of a type, named for what they are", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokenTypes: { minor: ["Minor"] },
      shareTypes: { minor: [{ quantity: 1, label: "Minor Certificate" }] },
    });
    await ready();
    await user.click(screen.getAllByRole("button", { name: "Add token" })[1]);
    expect(game().tokenTypes.minor).toEqual(["Minor", ""]);
    await user.click(screen.getByRole("button", { name: "Add share" }));
    expect(game().shareTypes.minor[1]).toEqual({ quantity: 0 });
    await user.click(
      screen.getByRole("button", { name: "Remove share Minor Certificate" }),
    );
    expect(game().shareTypes.minor).toEqual([{ quantity: 0 }]);
  });

  it("puts back a removed text token", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokens: ["A", "B"],
    });
    await ready();
    await user.click(
      screen.getAllByRole("button", { name: "Remove token A" })[0],
    );
    expect(game().tokens).toEqual(["B"]);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(game().tokens).toEqual(["A", "B"]);
  });

  it("duplicates a null token as a null token", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokens: [null],
    });
    await ready();
    const copy = screen.getAllByRole("button", { name: /^Duplicate token / });
    await user.click(copy[0]);
    expect(game().tokens).toEqual([null, null]);
  });

  it("warns how many companies use a token type or share type that is renamed or removed", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokenTypes: { default: ["A"], three: ["A", "B", "C"] },
      shareTypes: { default: [{ quantity: 1 }] },
      companies: [
        { name: "One", abbrev: "O", color: "red", tokens: "three" },
        { name: "Two", abbrev: "T", color: "blue", tokens: "three" },
        { name: "Three", abbrev: "H", color: "green" },
      ],
    });
    await ready();
    const rename = async (from, to) => {
      const name = screen.getByRole("textbox", { name: `Name of ${from}` });
      await user.clear(name);
      await user.type(name, to);
      await user.tab();
    };
    await rename("three", "four");
    expect(Object.keys(game().tokenTypes)).toEqual(["default", "four"]);
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      '2 companies use "three" by name or by default',
    );

    await user.click(
      screen.getByRole("button", { name: "Remove token type default" }),
    );
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      '1 company uses "default" by name or by default',
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByTestId("list-warning")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Remove share type default" }),
    );
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      '3 companies use "default" by name or by default',
    );
  });

  it("does not warn about a type no company uses", async () => {
    const { user } = open(tokensRoute, {
      ...structuredClone(games["18Test"]),
      tokenTypes: { spare: ["A"] },
      companies: [],
    });
    await ready();
    await user.click(
      screen.getByRole("button", { name: "Remove token type spare" }),
    );
    expect(screen.queryByTestId("list-warning")).not.toBeInTheDocument();
  });
});

describe("edit panel token editor", () => {
  const section = (name) => `${route}?edit=true&editSection=${name}`;
  const game = () => opened.getState().game;
  const withCompany = (token) => {
    const base = structuredClone(games["18Test"]);
    if (token === undefined) delete base.companies[0].token;
    else base.companies[0] = { ...base.companies[0], token };
    return base;
  };
  const token = () => game().companies[0].token;
  const dialog = () => screen.findByRole("dialog");

  // Opens the editor of the token of the first company
  const openCompany = async (value) => {
    const view = open(section("companies"), withCompany(value));
    await screen.findByRole("button", { name: "Add company" });
    await view.user.click(within(cards()[0]).getAllByRole("button")[0]);
    await view.user.click(
      within(cards()[0]).getByRole("button", { name: "More fields" }),
    );
    await view.user.click(
      within(cards()[0]).getByRole("button", { name: "Edit token" }),
    );
    return view;
  };
  const addDecoration = async (user, name) => {
    await user.click(screen.getByRole("combobox", { name: "Add decoration" }));
    await user.click(await screen.findByRole("option", { name }));
  };

  it("opens from a company and changes the token as you go, the rest stays", async () => {
    const { user } = await openCompany();
    const editor = within(await dialog());
    expect(token()).toBeUndefined();
    expect(
      screen.getByRole("dialog", { name: "Edit token of Black Railroad BLRR" }),
    ).toBeVisible();
    expect(
      editor.getByRole("img", { name: "Preview of the token" }),
    ).toBeVisible();

    await user.type(editor.getByRole("combobox", { name: "Color" }), "red");
    await user.keyboard("{Enter}");
    expect(token()).toEqual({ color: "red" });
    expect(game().companies[0].name).toBe("Black Railroad");

    await addDecoration(user, "Bar");
    expect(token()).toEqual({ color: "red", bar: true });
    await user.type(editor.getByRole("combobox", { name: "Bar" }), "blue");
    await user.keyboard("{Enter}");
    expect(token()).toEqual({ color: "red", bar: "blue" });
  });

  it("changes the shape of the token", async () => {
    const { user } = await openCompany();
    const editor = within(await dialog());
    await user.click(editor.getByRole("combobox", { name: "Token Shape" }));
    await user.click(await screen.findByRole("option", { name: "Square" }));
    expect(token()).toEqual({ tokenShape: "square" });
  });

  it("keeps the length of a list of colors", async () => {
    const { user } = await openCompany();
    const editor = within(await dialog());
    await addDecoration(user, "Halves");
    expect(token()).toBeUndefined();
    await user.type(editor.getByRole("combobox", { name: "Halves 2" }), "blue");
    await user.keyboard("{Enter}");
    expect(token()).toEqual({ halves: ["", "blue"] });
    await user.type(editor.getByRole("combobox", { name: "Halves 1" }), "red");
    await user.keyboard("{Enter}");
    expect(token()).toEqual({ halves: ["red", "blue"] });
    await user.click(editor.getByRole("button", { name: "Remove Halves" }));
    expect(token()).toBeUndefined();
  });

  it("keeps a key the schema does not know, and removes a token with nothing in it", async () => {
    const { user } = await openCompany({ color: "red", mystery: 1 });
    const editor = within(await dialog());
    await user.clear(editor.getByRole("combobox", { name: "Color" }));
    await user.tab();
    expect(token()).toEqual({ mystery: 1 });
    await user.click(editor.getByRole("button", { name: "Advanced" }));
    expect(token()).toEqual({ mystery: 1 });
  });

  it("changes one key and leaves the blank values of the others", async () => {
    const { user } = await openCompany({ label: "", color: "red" });
    const editor = within(await dialog());
    await user.clear(editor.getByRole("combobox", { name: "Color" }));
    await user.type(editor.getByRole("combobox", { name: "Color" }), "blue");
    await user.keyboard("{Enter}");
    expect(token()).toEqual({ label: "", color: "blue" });
  });

  it("shows a key the schema does not know as JSON that can be removed", async () => {
    const { user } = await openCompany({ color: "red", mystery: 1 });
    const editor = within(await dialog());
    await user.click(editor.getByRole("button", { name: "Advanced" }));
    const mystery = editor.getByRole("textbox", { name: "Mystery" });
    expect(mystery).toHaveValue("1");
    await user.clear(mystery);
    await user.tab();
    expect(token()).toEqual({ color: "red" });
  });

  it("shows the problem of a value on its field", async () => {
    allowConsole(/./);
    await openCompany({ width: "x" });
    const editor = within(await dialog());
    const width = editor.getByRole("spinbutton", { name: "Width" });
    await waitFor(() => expect(width).toHaveAttribute("aria-invalid", "true"));
  });

  it("goes back to its first state with Reset, decorations added included", async () => {
    const { user } = await openCompany();
    const editor = within(await dialog());
    await addDecoration(user, "Halves");
    expect(editor.getByRole("button", { name: "Remove Halves" })).toBeVisible();
    await user.click(editor.getByRole("button", { name: "Reset" }));
    expect(
      editor.queryByRole("button", { name: "Remove Halves" }),
    ).not.toBeInTheDocument();
  });

  it("changes the background of the preview", async () => {
    const { user } = await openCompany();
    const editor = within(await dialog());
    const preview = editor.getByTestId("token-editor-preview");
    expect(preview).toHaveAttribute("data-background", "light");
    await user.click(editor.getByRole("button", { name: "Dark" }));
    expect(preview).toHaveAttribute("data-background", "dark");
  });

  it("keeps a token shape the editor does not list", async () => {
    await openCompany({ tokenShape: "hexagon" });
    const editor = within(await dialog());
    expect(
      editor.getByRole("combobox", { name: "Token Shape" }),
    ).toHaveTextContent("hexagon");
  });

  it("removes the token when its last value goes", async () => {
    const { user } = await openCompany({ color: "red" });
    const editor = within(await dialog());
    await user.clear(editor.getByRole("combobox", { name: "Color" }));
    await user.tab();
    expect(game().companies[0]).not.toHaveProperty("token");
  });

  it("resets to the token as it was when the editor opened", async () => {
    const { user } = await openCompany({ color: "red", label: "X" });
    const editor = within(await dialog());
    await user.type(editor.getByRole("combobox", { name: "Color" }), "dark");
    await user.keyboard("{Enter}");
    await addDecoration(user, "Bar");
    expect(token()).toEqual({ color: "reddark", label: "X", bar: true });
    await user.click(editor.getByRole("button", { name: "Reset" }));
    expect(token()).toEqual({ color: "red", label: "X" });
  });

  it("resets to no token when there was none", async () => {
    const { user } = await openCompany();
    const editor = within(await dialog());
    await user.type(editor.getByRole("combobox", { name: "Color" }), "red");
    await user.keyboard("{Enter}");
    await user.click(editor.getByRole("button", { name: "Reset" }));
    expect(game().companies[0]).not.toHaveProperty("token");
  });

  it("draws a token it cannot draw as nothing and does not fall over", async () => {
    allowConsole(/./);
    await openCompany({ icon: "nope" });
    const editor = within(await dialog());
    expect(editor.getByRole("combobox", { name: "Icon" })).toHaveValue("nope");
    expect(editor.getByText("The app has no icon named nope.")).toBeVisible();
    expect(
      editor.queryByRole("img", { name: "Preview of the token" }),
    ).not.toBeInTheDocument();
  });

  it("draws the token again once the icon that failed is cleared", async () => {
    allowConsole(/./);
    const { user } = await openCompany({ icon: "nope", color: "red" });
    const editor = within(await dialog());
    expect(
      editor.queryByRole("img", { name: "Preview of the token" }),
    ).not.toBeInTheDocument();
    await user.clear(editor.getByRole("combobox", { name: "Icon" }));
    await user.tab();
    expect(
      await editor.findByRole("img", { name: "Preview of the token" }),
    ).toBeVisible();
  });

  it("Escape closes the editor, then the panel", async () => {
    const { user } = await openCompany();
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("edit-panel")).toBeInTheDocument();
    await user.click(
      await screen.findByRole("button", { name: "Add company" }),
    );
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByTestId("edit-panel")).not.toBeInTheDocument(),
    );
  });

  it("opens from a private and edits its token", async () => {
    const base = structuredClone(games["18Test"]);
    const { user } = open(section("privates"), base);
    await screen.findByRole("button", { name: "Add private" });
    const card = within(cards()[2]);
    await user.click(card.getByRole("button", { name: "More fields" }));
    await user.click(card.getByRole("button", { name: "Edit token" }));
    const editor = within(await dialog());
    expect(
      screen.getByRole("dialog", { name: /Edit token of / }),
    ).toBeVisible();
    await user.clear(editor.getByRole("textbox", { name: "Label" }));
    await user.type(editor.getByRole("textbox", { name: "Label" }), "9");
    await user.tab();
    expect(game().privates[2].token).toEqual({ color: "green", label: 9 });
  });

  it("keeps a token that is text as JSON, with no editor button", async () => {
    const { user } = open(section("companies"), withCompany("X"));
    await screen.findByRole("button", { name: "Add company" });
    await user.click(within(cards()[0]).getAllByRole("button")[0]);
    await user.click(
      within(cards()[0]).getByRole("button", { name: "More fields" }),
    );
    const card = within(cards()[0]);
    expect(card.getByRole("textbox", { name: "Token" }).tagName).toBe(
      "TEXTAREA",
    );
    expect(
      card.queryByRole("button", { name: "Edit token" }),
    ).not.toBeInTheDocument();
  });

  it("gives the focus to the edit button of a token that became an object", async () => {
    const { user } = open(section("tokens"), {
      ...structuredClone(games["18Test"]),
      tokens: ["Round"],
    });
    await screen.findAllByRole("button", { name: "Add token" });
    await user.click(
      screen.getByRole("button", { name: "Edit token of Round" }),
    );
    const editor = within(await dialog());
    await user.type(editor.getByRole("combobox", { name: "Color" }), "red");
    await user.keyboard("{Enter}");
    expect(game().tokens[0]).toEqual({ label: "Round", color: "red" });
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Edit token of Round" }),
      ).toHaveFocus(),
    );
  });

  it("opens from a token of the game, which stays text or a number while only the label is set", async () => {
    const { user } = open(section("tokens"), {
      ...structuredClone(games["18Test"]),
      tokens: ["Round", 5, { label: "Obj" }],
    });
    await screen.findAllByRole("button", { name: "Add token" });
    await user.click(
      screen.getByRole("button", { name: "Edit token of Round" }),
    );
    let editor = within(await dialog());
    const label = editor.getByRole("textbox", { name: "Label" });
    expect(label).toHaveValue("Round");
    await user.clear(label);
    await user.type(label, "Stop");
    await user.tab();
    expect(game().tokens[0]).toBe("Stop");

    await user.type(editor.getByRole("combobox", { name: "Color" }), "red");
    await user.keyboard("{Enter}");
    expect(game().tokens[0]).toEqual({ label: "Stop", color: "red" });
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Edit token of 5" }));
    editor = within(await dialog());
    const number = editor.getByRole("textbox", { name: "Label" });
    await user.clear(number);
    await user.type(number, "7");
    await user.tab();
    expect(game().tokens[1]).toBe(7);
    await user.keyboard("{Escape}");

    await user.click(
      await screen.findByRole("button", { name: "Edit token of Obj" }),
    );
    editor = within(await dialog());
    await user.clear(editor.getByRole("textbox", { name: "Label" }));
    await user.tab();
    expect(game().tokens[2]).toEqual({});
  });

  it("puts the button beside the item buttons, not inside the title button", async () => {
    open(section("tokens"), {
      ...structuredClone(games["18Test"]),
      tokens: ["Round", { label: "Obj" }],
    });
    await screen.findAllByRole("button", { name: "Add token" });
    // A button in the title button would be invalid: the edit button is one
    // of the buttons of the card, beside the title
    const obj = within(cards()[1]);
    expect(
      obj.getByRole("button", { name: "Edit token of Obj" }),
    ).toBeVisible();
    expect(
      within(obj.getAllByRole("button")[0]).queryByRole("button"),
    ).not.toBeInTheDocument();
    expect(
      within(cards()[0]).getByRole("button", { name: "Edit token of Round" }),
    ).toBeVisible();
  });
});
