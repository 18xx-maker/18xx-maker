import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";

import SchemaField, {
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";
import {
  clearValue,
  insertAt,
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
