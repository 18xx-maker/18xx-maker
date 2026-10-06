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

import root from "@/schemas/game.schema.json";

const train = (name, extra = {}) => ({
  name,
  color: "gray",
  price: 100,
  quantity: 1,
  ...extra,
});

const companies = [
  { name: "Pennsylvania", abbrev: "PRR" },
  { name: "New York Central", abbrev: "NYC" },
];

// The real schema in a form that holds the game in state: the draft is what the
// options are read from
const Form = ({ initial, section = "trains", onGame }) => {
  const [game, setGame] = useState(initial);
  const latest = useRef(game);
  latest.current = game;
  onGame?.(game);
  const change = (fn) => {
    latest.current = fn(latest.current);
    setGame(latest.current);
  };
  return (
    <SchemaFormContext.Provider
      value={{
        root,
        game,
        issues: [],
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
        keys={[section]}
        schema={root.properties[section]}
        defaults={{}}
      />
    </SchemaFormContext.Provider>
  );
};

const setup = (initial, section) => {
  let current;
  const view = render(
    <Form initial={initial} section={section} onGame={(g) => (current = g)} />,
  );
  return { ...view, user: userEvent.setup(), game: () => current };
};

const trains = (...rust) => ({
  trains: [
    train("2", rust[0] === undefined ? {} : { rust: rust[0] }),
    train("3"),
    train("4D"),
  ],
});

const rustBox = () => screen.getAllByRole("combobox", { name: /^Rust/ })[0];
const optionNames = () =>
  screen
    .queryAllByRole("option")
    .map((option) => option.firstChild.textContent);

describe("a reference field", () => {
  it("lists the names of the game, from the game as it is now", async () => {
    const { user } = setup(trains());
    await user.click(rustBox());
    expect(optionNames()).toEqual(["2", "3", "4D"]);
    await user.keyboard("{Escape}");

    // A train renamed in another card is an option right away
    const names = screen.getAllByRole("textbox", { name: /^Name/ });
    await user.clear(names[1]);
    await user.type(names[1], "5{Tab}");
    await user.click(rustBox());
    expect(optionNames()).toEqual(["2", "5", "4D"]);
  });

  it("filters the names as you type", async () => {
    const { user } = setup(trains());
    await user.click(rustBox());
    await user.keyboard("4");
    expect(optionNames()).toEqual(["4D"]);
    await user.keyboard("x");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/No matches/)).toBeVisible();
  });

  it("picks a name with the pointer or the keyboard, as a string", async () => {
    const { user, game } = setup(trains());
    await user.click(rustBox());
    await user.click(screen.getByRole("option", { name: /^3/ }));
    expect(game().trains[0].rust).toBe("3");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    // One name is a chip
    expect(screen.getByRole("button", { name: "Remove 3" })).toBeVisible();

    const second = screen.getAllByRole("combobox", { name: /^Obsolete/ })[0];
    await user.click(second);
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(game().trains[0].obsolete).toBe("3");
  });

  it("stores a list once there are two names", async () => {
    const { user, game } = setup(trains("2"));
    await user.click(rustBox());
    await user.click(screen.getByRole("option", { name: /^3/ }));
    expect(game().trains[0].rust).toEqual(["2", "3"]);

    await user.click(screen.getByRole("button", { name: "Remove 2" }));
    expect(game().trains[0].rust).toBe("3");
    await user.click(screen.getByRole("button", { name: "Remove 3" }));
    expect(game().trains[0]).not.toHaveProperty("rust");
  });

  it("takes free text when Enter is pressed or the field is left", async () => {
    const { user, game } = setup(trains());
    await user.click(rustBox());
    await user.keyboard("6{Enter}");
    expect(game().trains[0].rust).toBe("6");
    expect(rustBox()).toHaveValue("");

    await user.click(rustBox());
    await user.keyboard("7");
    await user.tab();
    expect(game().trains[0].rust).toEqual(["6", "7"]);

    // Twice the same name is one
    await user.click(rustBox());
    await user.keyboard("7{Enter}");
    expect(game().trains[0].rust).toEqual(["6", "7"]);
  });

  it("hints at a name the game does not have, without an error", () => {
    setup(trains("9"));
    const box = rustBox();
    expect(screen.getByText(/Not in the trains of this game: 9/)).toBeVisible();
    expect(box).not.toBeInvalid();
    expect(box).toHaveAccessibleDescription(/Not in the trains of this game/);
    // The name stays as it is
    expect(screen.getByRole("button", { name: "Remove 9" })).toBeVisible();
  });

  it("has no hint for a name the game has", () => {
    setup(trains("3"));
    expect(screen.queryByText(/Not in the/)).not.toBeInTheDocument();
  });

  it("leaves a value that holds an object to the JSON field", () => {
    setup(trains({ on: "2", index: 2 }));
    expect(screen.getAllByRole("textbox", { name: /^Rust/ })[0]).toHaveValue(
      JSON.stringify({ on: "2", index: 2 }, null, 2),
    );
    expect(screen.getAllByRole("combobox", { name: /^Rust/ })).toHaveLength(2);
  });

  it("is a single value for a company of a private", async () => {
    const { user, game } = setup(
      { companies, privates: [{ name: "P", company: "XYZ" }] },
      "privates",
    );
    const box = screen.getByRole("combobox", { name: /^Company/ });
    expect(box).toHaveValue("XYZ");
    expect(
      screen.getByText(/Not in the companies of this game: XYZ/),
    ).toBeVisible();

    await user.click(box);
    expect(optionNames()).toEqual(["PRR", "NYC"]);
    expect(screen.getByRole("option", { name: /NYC/ })).toHaveTextContent(
      "New York Central",
    );
    await user.click(screen.getByRole("option", { name: /NYC/ }));
    expect(game().privates[0].company).toBe("NYC");
    expect(box).toHaveValue("NYC");
    expect(screen.queryByText(/Not in the/)).not.toBeInTheDocument();

    // Empty clears it, never an empty string
    await user.clear(box);
    await user.tab();
    expect(game().privates[0]).not.toHaveProperty("company");
  });

  it("works for a game without the list, with free text only", async () => {
    const { user, game } = setup({ privates: [{ name: "P" }] }, "privates");
    const box = screen.getByRole("combobox", { name: /^Company/ });
    await user.click(box);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await user.type(box, "ABC{Enter}");
    expect(game().privates[0].company).toBe("ABC");
  });
});
