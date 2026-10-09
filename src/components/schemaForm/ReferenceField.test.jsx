import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { Provider } from "react-redux";

import { TooltipProvider } from "@/components/ui/tooltip";

import SchemaField, {
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";
import {
  clearValue,
  insertAt,
  moveItem,
  removeAt,
  schemaAt,
  setValue,
} from "@/components/schemaForm/resolve";

import root from "@/schemas/game.schema.json";
import { initialState, rootReducer } from "@/state";

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
const Form = ({ initial, section = "trains", keys = [section], onGame }) => {
  const [store] = useState(() =>
    configureStore({ reducer: rootReducer, preloadedState: initialState }),
  );
  const [game, setGame] = useState(initial);
  const latest = useRef(game);
  latest.current = game;
  onGame?.(game);
  const change = (fn) => {
    latest.current = fn(latest.current);
    setGame(latest.current);
  };
  return (
    <Provider store={store}>
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
        <TooltipProvider>
          <SchemaField
            keys={keys}
            schema={schemaAt(root, keys)}
            defaults={{}}
          />
        </TooltipProvider>
      </SchemaFormContext.Provider>
    </Provider>
  );
};

const setup = (initial, section, keys) => {
  let current;
  const view = render(
    <Form
      initial={initial}
      section={section}
      keys={keys}
      onGame={(g) => (current = g)}
    />,
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

  describe("the train of a phase, a name or a list", () => {
    const phase = (train) => ({
      ...trains(),
      phases: [{ name: "1", limit: 4, tiles: "yellow", train }],
    });
    const trainBox = () => screen.getByRole("combobox", { name: /^Train$/ });

    it("lists the trains, stores one name as a string and two as a list", async () => {
      const { user, game } = setup(phase(), "phases", ["phases", 0, "train"]);
      await user.click(trainBox());
      expect(optionNames()).toEqual(["2", "3", "4D"]);
      await user.click(screen.getByRole("option", { name: /^3/ }));
      expect(game().phases[0].train).toBe("3");

      await user.type(trainBox(), "5H{Enter}");
      expect(game().phases[0].train).toEqual(["3", "5H"]);
      await user.click(screen.getByRole("button", { name: "Remove 3" }));
      expect(game().phases[0].train).toBe("5H");
    });

    it("hints at a train the game does not have, for a list too", () => {
      setup(phase(["2", "9"]), "phases", ["phases", 0, "train"]);
      expect(
        screen.getByText(/Not in the trains of this game: 9/),
      ).toBeVisible();
      expect(trainBox()).not.toBeInvalid();
    });
  });

  it("keeps a name twice in the list as two chips, removed one at a time", async () => {
    const { user, game } = setup(trains(["2", "2", "3"]));
    expect(screen.getAllByRole("button", { name: "Remove 2" })).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: "Remove 2" })[0]);
    expect(game().trains[0].rust).toEqual(["2", "3"]);
  });

  it("describes the field by its description and the hint of an unknown name", () => {
    // The companies of a market cell have a description in the schema
    setup(
      { companies, stock: { market: [[{ value: 100, companies: ["ZZZ"] }]] } },
      "stock",
      ["stock", "market", 0, 0, "companies"],
    );
    const box = screen.getByRole("combobox", { name: /Companies/ });
    const ids = box.getAttribute("aria-describedby").split(" ");
    expect(ids).toHaveLength(2);
    expect(ids.some((id) => id.endsWith("-help"))).toBe(true);
    expect(ids.some((id) => id.endsWith("-unknown"))).toBe(true);
    // eslint-disable-next-line testing-library/no-node-access
    ids.forEach((id) => expect(document.getElementById(id)).not.toBeNull());
    expect(box).toHaveAccessibleDescription(/Companies shown as bars/);
    expect(box).toHaveAccessibleDescription(/Not in the companies/);
  });

  describe("the companies of a market cell, an array only", () => {
    const cellKeys = ["stock", "market", 0, 0, "companies"];
    const withCell = (cell) => ({
      companies,
      stock: { market: [[{ value: 100, ...cell }]] },
    });
    const cellBox = () => screen.getByRole("combobox", { name: /Companies/ });

    it("stores a list of one and removes the key with the last chip", async () => {
      const { user, game } = setup(withCell({}), "stock", cellKeys);
      await user.click(cellBox());
      await user.click(screen.getByRole("option", { name: /^PRR/ }));
      expect(game().stock.market[0][0].companies).toEqual(["PRR"]);

      await user.click(screen.getByRole("button", { name: "Remove PRR" }));
      expect(game().stock.market[0][0]).not.toHaveProperty("companies");
    });

    it("leaves a mixed list of names and objects to the JSON field", () => {
      setup(
        withCell({ companies: ["PRR", { company: "NYC", row: 1 }] }),
        "stock",
        cellKeys,
      );
      expect(
        screen.queryByRole("combobox", { name: /Companies/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /Companies/ }),
      ).toBeInTheDocument();
    });
  });
});
