import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";

import SchemaField, {
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";
import {
  clearValue,
  insertAt,
  isRequired,
  moveItem,
  removeAt,
  setValue,
} from "@/components/schemaForm/resolve";

// A schema with a deprecated field: no field of the real game schema is
// deprecated for the panel yet
const root = {
  type: "object",
  properties: {
    players: {
      type: "integer",
      description: "How many players.",
      deprecated: true,
    },
    exports: {
      type: "object",
      properties: { paginated: { type: "boolean", deprecated: true } },
    },
  },
};

const setup = (game, issues = []) => {
  const set = vi.fn();
  const clear = vi.fn();
  const view = render(
    <SchemaFormContext.Provider
      value={{
        root,
        game,
        issues,
        set,
        clear,
        insert() {},
        remove() {},
        move() {},
      }}
    >
      <SchemaField keys={["players"]} schema={root.properties.players} />
    </SchemaFormContext.Provider>,
  );
  return { set, clear, view, user: userEvent.setup() };
};

const revenueRoot = {
  type: "object",
  properties: {
    revenue: {
      oneOf: [
        { type: "number", minimum: 0 },
        { type: "array", items: { type: "number", minimum: 0 } },
        { type: "string" },
      ],
    },
  },
};

const setupRevenue = (game) => {
  const set = vi.fn();
  const clear = vi.fn();
  const element = (game) => (
    <SchemaFormContext.Provider
      value={{
        root: revenueRoot,
        game,
        issues: [],
        set,
        clear,
        insert() {},
        remove() {},
        move() {},
      }}
    >
      <SchemaField keys={["revenue"]} schema={revenueRoot.properties.revenue} />
    </SchemaFormContext.Provider>
  );
  const view = render(element(game));
  return {
    set,
    clear,
    user: userEvent.setup(),
    rerender: (next) => view.rerender(element(next)),
  };
};

describe("a revenue field", () => {
  it("shows a list as 10/20 and sets what is typed", async () => {
    const { set, clear, user } = setupRevenue({ revenue: [10, 20] });
    const input = screen.getByRole("textbox", { name: /Revenue/ });
    expect(input).toHaveValue("10/20");

    await user.clear(input);
    await user.type(input, "5{Enter}");
    expect(set).toHaveBeenLastCalledWith(["revenue"], 5);
    await user.clear(input);
    await user.type(input, "10, 30{Enter}");
    expect(set).toHaveBeenLastCalledWith(["revenue"], [10, 30]);
    await user.clear(input);
    await user.type(input, "$10/$20{Enter}");
    expect(set).toHaveBeenLastCalledWith(["revenue"], "$10/$20");
    await user.clear(input);
    await user.type(input, "{Enter}");
    expect(clear).toHaveBeenCalledWith(["revenue"]);
  });

  it("keeps the draft when the value it makes comes back, and follows other changes", async () => {
    const { rerender, user } = setupRevenue({ revenue: [10, 20] });
    const input = screen.getByRole("textbox", { name: /Revenue/ });
    await user.clear(input);
    await user.type(input, "10, 30");
    // The same list in a new array: the text is not rewritten
    rerender({ revenue: [10, 30] });
    expect(input).toHaveValue("10, 30");
    rerender({ revenue: [1, 2] });
    expect(input).toHaveValue("1/2");
  });
});

const deprecation = {
  severity: "warning",
  code: "deprecated",
  pointer: "players",
  params: { key: "players" },
};

describe("a deprecated field", () => {
  it("has the badge always, the note only with a value, and stays editable", async () => {
    const { set, user, view } = setup({ players: 3 }, [deprecation]);
    expect(screen.getByText("Deprecated")).toBeVisible();
    // One note: the validation warning is not shown a second time
    expect(screen.getAllByText("This field is deprecated.")).toHaveLength(1);
    // The note is the paragraph around the text
    // eslint-disable-next-line testing-library/no-node-access
    const note = screen.getByText("This field is deprecated.").closest("p");
    expect(note).toHaveClass("text-warning-text");

    const input = screen.getByRole("spinbutton", { name: /Players/ });
    expect(input).not.toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "How many players. This field is deprecated. Remove",
    );
    await user.clear(input);
    await user.type(input, "4");
    await user.tab();
    expect(set).toHaveBeenCalledWith(["players"], 4);

    view.unmount();
    setup({});
    expect(screen.getByText("Deprecated")).toBeVisible();
    expect(
      screen.queryByText("This field is deprecated."),
    ).not.toBeInTheDocument();
  });

  it("the note has a way to remove the value", async () => {
    const { clear, user } = setup({ players: 3 }, [deprecation]);
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(clear).toHaveBeenCalledWith(["players"]);
  });

  it("a warning that is not the deprecation is orange and not invalid", () => {
    setup({ players: 3 }, [
      {
        severity: "warning",
        code: "generic",
        pointer: "players",
        params: { message: "careful" },
      },
    ]);
    expect(
      screen.getByRole("spinbutton", { name: /Players/ }),
    ).not.toBeInvalid();
    expect(screen.getByRole("alert")).toHaveClass("text-warning-text");
  });

  it("an error is red and invalid", () => {
    setup({ players: 3 }, [
      {
        severity: "error",
        code: "generic",
        pointer: "players",
        params: { message: "bad" },
      },
    ]);
    expect(screen.getByRole("spinbutton", { name: /Players/ })).toBeInvalid();
    expect(screen.getByRole("alert")).toHaveClass("text-destructive");
  });
});

// A list in a form that holds the game in state, like the real provider
const listRoot = {
  type: "object",
  properties: {
    trains: {
      type: "array",
      items: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          code: { type: "string" },
          note: { type: "string" },
        },
      },
    },
  },
};

const numberRoot = structuredClone(listRoot);
numberRoot.properties.trains.items.properties.code = { type: "number" };

const ListForm = ({ initial, issues = [], root = listRoot, ...props }) => {
  const [game, setGame] = useState(initial);
  const latest = useRef(game);
  latest.current = game;
  const change = (fn) => {
    latest.current = fn(latest.current);
    setGame(latest.current);
  };
  return (
    <SchemaFormContext.Provider
      value={{
        root,
        game,
        issues,
        latest: () => latest.current,
        set: (keys, value) => change((g) => setValue(g, keys, value)),
        clear: (keys) => change((g) => clearValue(g, keys)),
        insert: (keys, index, item) =>
          change((g) => insertAt(g, keys, index, item)),
        remove: (keys, index) => change((g) => removeAt(g, keys, index)),
        move: (keys, from, to) => change((g) => moveItem(g, keys, from, to)),
      }}
    >
      <SchemaField
        keys={["trains"]}
        schema={root.properties.trains}
        defaults={{}}
        {...props}
      />
    </SchemaFormContext.Provider>
  );
};

const toggle = (name) => screen.getByRole("button", { name });

describe("a list of cards", () => {
  const initial = { trains: [{ name: "A", code: "a" }, { name: "B" }] };

  it("starts open, and closed with startCollapsed", () => {
    const { unmount } = render(<ListForm initial={initial} />);
    expect(toggle("A")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("B")).toHaveAttribute("aria-expanded", "true");
    unmount();

    render(<ListForm initial={initial} startCollapsed />);
    expect(toggle("A")).toHaveAttribute("aria-expanded", "false");
    expect(toggle("B")).toHaveAttribute("aria-expanded", "false");
  });

  it("opens an added and a copied card, the others stay closed", async () => {
    const user = userEvent.setup();
    render(<ListForm initial={initial} startCollapsed />);

    await user.click(screen.getByRole("button", { name: "Add train" }));
    expect(toggle("3")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("A")).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: "Duplicate train B" }));
    // The copy is after its source and open
    const toggles = screen
      .getAllByRole("button", { name: /^(A|B|3|4)$/ })
      .map((button) => [button.textContent, button.ariaExpanded]);
    expect(toggles).toEqual([
      ["A", "false"],
      ["B", "false"],
      ["4", "true"],
      ["3", "true"],
    ]);
  });

  it("keeps what is open when a card moves, is removed and comes back", async () => {
    const user = userEvent.setup();
    render(<ListForm initial={initial} startCollapsed />);
    await user.click(toggle("B"));

    await user.click(screen.getByRole("button", { name: "Move train B up" }));
    expect(toggle("B")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("A")).toHaveAttribute("aria-expanded", "false");

    await user.click(screen.getByRole("button", { name: "Remove train B" }));
    expect(toggle("A")).toHaveAttribute("aria-expanded", "false");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(toggle("B")).toHaveAttribute("aria-expanded", "true");
    expect(toggle("A")).toHaveAttribute("aria-expanded", "false");
  });

  it("takes defaults from a function of the items and a hook for copies", async () => {
    const user = userEvent.setup();
    render(
      <ListForm
        initial={initial}
        primary={["name", "code"]}
        defaults={(items) => ({ code: `c${items.length}` })}
        copyOf={(copy) => ({ code: `${copy.code ?? "x"}2` })}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Add train" }));
    const codes = () =>
      screen.getAllByRole("textbox", { name: "Code" }).map((i) => i.value);
    expect(codes()).toEqual(["a", "", "c2"]);

    await user.click(screen.getByRole("button", { name: "Duplicate train A" }));
    expect(codes()).toEqual(["a", "a2", "", "c2"]);
  });

  it("identifies the items by another key, titled with a translation", async () => {
    const user = userEvent.setup();
    render(
      <ListForm
        root={numberRoot}
        initial={{ trains: [{ name: "x", code: 7 }, { name: "y" }] }}
        primary={["name", "code"]}
        idKey="code"
        titleKey="code"
        title="editPanel.titles.players"
        defaults={{}}
      />,
    );
    // An item without the key falls back to its position
    expect(toggle("7 players")).toBeVisible();
    expect(toggle("#2")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Add train" }));
    // The new code is a number, not text
    expect(screen.getAllByRole("spinbutton", { name: "Code" })[2]).toHaveValue(
      8,
    );
    expect(toggle("8 players")).toBeVisible();
  });

  it("shows the summary in place of the title", () => {
    render(
      <ListForm
        initial={initial}
        summary={(item) => <span>{`${item.name}!`}</span>}
      />,
    );
    expect(toggle("A!")).toBeVisible();
  });

  it("marks a closed card that has a problem, an open one has the message", async () => {
    const user = userEvent.setup();
    const issues = [
      {
        severity: "error",
        code: "generic",
        pointer: "trains[1].note",
        params: { message: "bad" },
      },
    ];
    render(<ListForm initial={initial} issues={issues} startCollapsed />);
    const marker = screen.getByRole("img", {
      name: "The train B has a problem",
    });
    expect(marker).toBeVisible();
    expect(screen.getAllByRole("img")).toHaveLength(1);

    await user.click(toggle("B"));
    expect(
      screen.queryByRole("img", { name: /has a problem/ }),
    ).not.toBeInTheDocument();
  });

  it("does not mark a card for the deprecation note", () => {
    render(
      <ListForm
        initial={initial}
        startCollapsed
        issues={[
          {
            severity: "warning",
            code: "deprecated",
            pointer: "trains[0].note",
            params: { key: "note" },
          },
        ]}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("the notes of a list", () => {
  const initial = { trains: [{ name: "A" }, { name: "B" }] };
  const status = () => screen.getByRole("status");

  it("announces an add, a remove with undo, a restore and a move", async () => {
    const user = userEvent.setup();
    render(<ListForm initial={initial} />);

    await user.click(screen.getByRole("button", { name: "Add train" }));
    expect(status()).toHaveTextContent("Added train 3");

    await user.click(screen.getByRole("button", { name: "Remove train B" }));
    expect(status()).toHaveTextContent("Removed train B");
    expect(screen.queryByRole("button", { name: "B" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(status()).toHaveTextContent("Restored train B");
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    expect(
      screen
        .getAllByRole("button", { name: /^(A|B|3)$/ })
        .map((b) => b.textContent),
    ).toEqual(["A", "B", "3"]);

    await user.click(screen.getByRole("button", { name: "Move train B up" }));
    expect(status()).toHaveTextContent("Moved train B to position 1 of 3");
  });

  it("drops the undo when the list changes again, and shows the warning", async () => {
    const user = userEvent.setup();
    render(
      <ListForm
        initial={initial}
        onChange={(kind) => (kind === "remove" ? "Check the rest" : "")}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Remove train A" }));
    expect(screen.getByTestId("list-warning")).toHaveTextContent(
      "Check the rest",
    );
    expect(screen.getByRole("button", { name: "Undo" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Add train" }));
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("list-warning")).not.toBeInTheDocument();
  });
});

// One field of a form that holds the game in state, and the game as it is
const fieldRoot = {
  type: "object",
  properties: {
    colors: {
      type: "object",
      description: "Colors by name.",
      additionalProperties: { type: "string" },
    },
    cards: { type: "array", items: { type: "string" } },
    formats: {
      type: "array",
      items: { type: "string", enum: ["pdf", "png", "svg"] },
    },
    upgrades: {
      type: "object",
      additionalProperties: { type: "array", items: { type: "string" } },
    },
  },
  required: ["upgrades"],
};

let current;

const FieldForm = ({ initial, field, issues = [] }) => {
  const [game, setGame] = useState(initial);
  const latest = useRef(game);
  latest.current = game;
  current = game;
  const change = (fn) => {
    latest.current = fn(latest.current);
    setGame(latest.current);
  };
  return (
    <SchemaFormContext.Provider
      value={{
        root: fieldRoot,
        game,
        issues,
        latest: () => latest.current,
        set: (keys, value) => change((g) => setValue(g, keys, value)),
        clear: (keys) =>
          isRequired(fieldRoot, keys)
            ? false
            : change((g) => clearValue(g, keys)),
        insert() {},
        remove() {},
        move() {},
      }}
    >
      <SchemaField keys={[field]} schema={fieldRoot.properties[field]} />
    </SchemaFormContext.Provider>
  );
};

const nameInputs = () =>
  screen.getAllByRole("textbox", { name: /^Name of / }).map((i) => i.value);

describe("a record field", () => {
  const initial = { colors: { red: "#f00", green: "#0f0", blue: "#00f" } };

  it("shows a row for each name, with the value as a field", () => {
    render(<FieldForm initial={initial} field="colors" />);
    expect(screen.getByText("Colors by name.")).toBeVisible();
    expect(nameInputs()).toEqual(["red", "green", "blue"]);
    expect(screen.getByRole("textbox", { name: "Green" })).toHaveValue("#0f0");
  });

  it("edits a value under its name", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    const input = screen.getByRole("textbox", { name: "Green" });
    await user.clear(input);
    await user.type(input, "#fff");
    await user.tab();
    expect(current.colors).toEqual({
      red: "#f00",
      green: "#fff",
      blue: "#00f",
    });
  });

  it("adds a row with a free name, focused", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    await user.click(screen.getByRole("button", { name: "Add color" }));
    expect(nameInputs()).toEqual(["red", "green", "blue", "new"]);
    expect(screen.getByRole("textbox", { name: "Name of new" })).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Added color new");
    expect(current.colors.new).toBe("");
    await user.click(screen.getByRole("button", { name: "Add color" }));
    expect(nameInputs().slice(3)).toEqual(["new", "new2"]);
  });

  it("renames when the field is left, and keeps the order", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    const input = screen.getByRole("textbox", { name: "Name of green" });
    await user.clear(input);
    await user.type(input, " lime ");
    await user.tab();
    expect(Object.entries(current.colors)).toEqual([
      ["red", "#f00"],
      ["lime", "#0f0"],
      ["blue", "#00f"],
    ]);
    expect(screen.getByRole("textbox", { name: "Lime" })).toHaveValue("#0f0");
  });

  it("refuses an empty, blank or taken name, with a message, and goes back", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    const input = screen.getByRole("textbox", { name: "Name of green" });

    await user.clear(input);
    await user.tab();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name.");
    expect(input).toBeInvalid();
    expect(input).toHaveValue("green");

    await user.clear(input);
    await user.type(input, "   ");
    await user.tab();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name.");
    expect(input).toHaveValue("green");

    await user.clear(input);
    await user.type(input, "blue");
    await user.tab();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Another entry already has this name.",
    );
    expect(input).toHaveValue("green");
    expect(Object.keys(current.colors)).toEqual(["red", "green", "blue"]);

    // Typing again takes the message away
    await user.type(input, "x");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // The same name is no change
    await user.clear(input);
    await user.type(input, "green ");
    await user.tab();
    expect(input).toHaveValue("green");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps what is typed in a row when another row is renamed", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    const first = screen.getByRole("textbox", { name: "Name of red" });
    await user.type(first, "dish");
    // Left the first row by clicking the value of the second one
    await user.click(screen.getByRole("textbox", { name: "Blue" }));
    expect(nameInputs()).toEqual(["reddish", "green", "blue"]);
    expect(screen.getByRole("textbox", { name: "Reddish" })).toHaveValue(
      "#f00",
    );
  });

  it("works with names that are special to JavaScript or to a path", async () => {
    const user = userEvent.setup();
    render(
      <FieldForm initial={{ colors: { a: "1", b: "2" } }} field="colors" />,
    );
    const own = (name) =>
      Object.getOwnPropertyDescriptor(current.colors, name)?.value;
    let expected = "1";
    for (const name of ["__proto__", "constructor", "a.b", "a/b", "a~b"]) {
      const input = screen.getAllByRole("textbox", { name: /^Name of / })[0];
      await user.clear(input);
      await user.type(input, name);
      await user.tab();
      expect(Object.keys(current.colors)).toEqual([name, "b"]);
      expect(own(name)).toBe(expected);
      expect(Object.getPrototypeOf(current.colors)).toBe(Object.prototype);
      expect(nameInputs()).toEqual([name, "b"]);

      // The value follows the name, and an edit of it keeps the name
      expected = `v ${name}`;
      const value = screen.getAllByRole("textbox")[1];
      await user.clear(value);
      await user.type(value, expected);
      await user.tab();
      expect(own(name)).toBe(expected);
      expect(Object.keys(current.colors)).toEqual([name, "b"]);

      // Back to a plain name for the next round
      const again = screen.getAllByRole("textbox", { name: /^Name of / })[0];
      await user.clear(again);
      await user.type(again, "a");
      await user.tab();
      expect(Object.keys(current.colors)).toEqual(["a", "b"]);
    }
  });

  it("removes a row and puts it back where it was", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    await user.click(
      screen.getByRole("button", { name: "Remove color green" }),
    );
    expect(nameInputs()).toEqual(["red", "blue"]);
    expect(screen.getByRole("status")).toHaveTextContent("Removed color green");

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(nameInputs()).toEqual(["red", "green", "blue"]);
    expect(current.colors.green).toBe("#0f0");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Restored color green",
    );
    expect(
      screen.queryByRole("button", { name: "Undo" }),
    ).not.toBeInTheDocument();
  });

  it("puts a removed row back under a free name when another row took its name", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    await user.click(
      screen.getByRole("button", { name: "Remove color green" }),
    );
    const input = screen.getByRole("textbox", { name: "Name of blue" });
    await user.clear(input);
    await user.type(input, "green");
    await user.tab();
    expect(nameInputs()).toEqual(["red", "green"]);

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(Object.entries(current.colors)).toEqual([
      ["red", "#f00"],
      ["green2", "#0f0"],
      ["green", "#00f"],
    ]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Restored color green2",
    );
  });

  it("removes the key with the last row, unless the key is required", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <FieldForm initial={{ colors: { a: "1" } }} field="colors" />,
    );
    await user.click(screen.getByRole("button", { name: "Remove color a" }));
    expect(current).toEqual({});
    expect(screen.getByText("Nothing here yet.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(current).toEqual({ colors: { a: "1" } });
    unmount();

    render(<FieldForm initial={{ upgrades: { a: ["x"] } }} field="upgrades" />);
    await user.click(screen.getByRole("button", { name: "Remove upgrade a" }));
    expect(current).toEqual({ upgrades: {} });
  });

  it("shows the problems of a row on its value", () => {
    render(
      <FieldForm
        initial={initial}
        field="colors"
        issues={[
          {
            severity: "error",
            code: "generic",
            pointer: "colors.green",
            params: { message: "bad green" },
          },
        ]}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Green" })).toBeInvalid();
    expect(screen.getByRole("alert")).toHaveTextContent("bad green");
  });

  it("does not remove the value of a row with an empty value", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={initial} field="colors" />);
    const input = screen.getByRole("textbox", { name: "Green" });
    await user.clear(input);
    await user.tab();
    expect(current.colors.green).toBe("#0f0");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This field is required.",
    );
  });
});

describe("a list of texts", () => {
  it("is one text a line and always saved as a list", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={{ cards: ["1", "2"] }} field="cards" />);
    const input = screen.getByRole("textbox", { name: "Cards" });
    expect(input).toHaveValue("1\n2");

    await user.clear(input);
    await user.type(input, "7{Tab}");
    expect(current.cards).toEqual(["7"]);

    await user.clear(input);
    await user.type(input, " a {Enter}{Enter}  {Enter}b{Tab}");
    expect(current.cards).toEqual(["a", "b"]);

    await user.clear(input);
    await user.tab();
    expect(current.cards).toBeUndefined();
    expect(input).toHaveAccessibleDescription(
      "One per line. Always saved as a list, even for a single line.",
    );
  });
});

describe("a list of choices", () => {
  const box = (name) => screen.getByRole("checkbox", { name });

  it("is a checkbox for each choice, in the order of the schema", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={{ formats: ["svg", "pdf"] }} field="formats" />);
    expect(
      screen
        .getAllByRole("checkbox")
        .map((b) => b.getAttribute("aria-checked")),
    ).toEqual(["true", "false", "true"]);

    await user.click(box("png"));
    expect(current.formats).toEqual(["pdf", "png", "svg"]);
    await user.click(box("pdf"));
    await user.click(box("png"));
    expect(current.formats).toEqual(["svg"]);
  });

  it("clears the key with no choice left", async () => {
    const user = userEvent.setup();
    render(<FieldForm initial={{ formats: ["pdf"] }} field="formats" />);
    await user.click(box("pdf"));
    expect(current.formats).toBeUndefined();
    expect(Object.keys(current)).toEqual([]);
    await user.click(box("png"));
    expect(current.formats).toEqual(["png"]);
  });

  it("keeps a value the schema does not know, until it is unchecked", async () => {
    const user = userEvent.setup();
    render(
      <FieldForm
        initial={{ formats: ["pdf", "gif", "gif"] }}
        field="formats"
      />,
    );
    expect(box("gif")).toBeChecked();
    await user.click(box("svg"));
    expect(current.formats).toEqual(["pdf", "svg", "gif"]);

    await user.click(box("gif"));
    expect(current.formats).toEqual(["pdf", "svg"]);
    expect(
      screen.queryByRole("checkbox", { name: "gif" }),
    ).not.toBeInTheDocument();
  });
});
