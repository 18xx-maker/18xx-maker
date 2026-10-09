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

// The real schema in a form that holds the game in state: the draft is what the
// options are read from
const Form = ({ initial, keys, onGame }) => {
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

const setup = (initial, keys) => {
  let current;
  const view = render(
    <Form initial={initial} keys={keys} onGame={(g) => (current = g)} />,
  );
  return { ...view, user: userEvent.setup(), game: () => current };
};

const optionNames = () =>
  screen
    .queryAllByRole("option")
    .map((option) => option.firstChild.textContent);

const PRIVATE_ICON = ["privates", 0, "icon"];
const COMPANY_LOGO = ["companies", 0, "logo"];
const privateIcon = { privates: [{ name: "P", icon: "boat" }] };

describe("a field the schema marks with x-widget", () => {
  it("is an icon picker for the icon of a private, listing the app icons", async () => {
    const { user, game } = setup(privateIcon, PRIVATE_ICON);
    const box = screen.getByRole("combobox", { name: /^Icon$/ });
    expect(box).toHaveValue("boat");
    expect(screen.queryByText(/The app has no/)).not.toBeInTheDocument();

    await user.click(box);
    expect(optionNames()).toContain("boat");
    await user.clear(box);
    await user.keyboard("tra");
    expect(optionNames().every((name) => name.includes("tra"))).toBe(true);
    await user.click(screen.getAllByRole("option")[0]);
    expect(game().privates[0].icon).toBe(box.value);
  });

  it("is an icon picker for the icon of a round", () => {
    setup({ rounds: [{ name: "OR1", icon: "boat" }] }, ["rounds", 0, "icon"]);
    expect(screen.getByRole("combobox", { name: /^Icon$/ })).toHaveValue(
      "boat",
    );
  });

  it("stores the option that is picked as a string", async () => {
    const { user, game } = setup({ privates: [{ name: "P" }] }, PRIVATE_ICON);
    const box = screen.getByRole("combobox", { name: /^Icon$/ });
    await user.click(box);
    await user.click(screen.getByRole("option", { name: "boat" }));
    expect(game().privates[0].icon).toBe("boat");
    expect(box).toHaveValue("boat");
  });

  it("takes free text and hints at a name the app does not have", async () => {
    const { user, game } = setup({ privates: [{ name: "P" }] }, PRIVATE_ICON);
    const box = screen.getByRole("combobox", { name: /^Icon$/ });
    await user.type(box, "my-own{Enter}");
    expect(game().privates[0].icon).toBe("my-own");
    expect(screen.getByText("The app has no icon named my-own.")).toBeVisible();
    expect(box).toHaveAccessibleDescription(/The app has no icon/);
    expect(box).not.toBeInvalid();

    // Empty removes it, never an empty string
    await user.clear(box);
    await user.tab();
    expect(game().privates[0]).not.toHaveProperty("icon");
  });

  it("is a logo picker for the logo of a company", async () => {
    const { user, game } = setup(
      { companies: [{ name: "A", abbrev: "A" }] },
      COMPANY_LOGO,
    );
    const box = screen.getByRole("combobox", { name: /^Logo$/ });
    await user.click(box);
    await user.click(screen.getAllByRole("option")[0]);
    expect(game().companies[0].logo).toBe(box.value);
    expect(box.value).not.toBe("");
    expect(screen.queryByText(/The app has no/)).not.toBeInTheDocument();
  });

  it("is an icon picker for the icon of a legend entry", () => {
    setup({ stock: { legend: [{ description: "D", icon: "zzz" }] } }, [
      "stock",
      "legend",
      0,
      "icon",
    ]);
    expect(screen.getByRole("combobox", { name: /^Icon$/ })).toHaveValue("zzz");
    expect(screen.getByText("The app has no icon named zzz.")).toBeVisible();
  });

  it("is a logo and icon picker for the game token", () => {
    const game = { tokens: [{ logo: "nope", icon: "boat" }] };
    setup(game, ["tokens", 0, "logo"]);
    setup(game, ["tokens", 0, "icon"]);
    expect(screen.getByRole("combobox", { name: /^Logo$/ })).toHaveValue(
      "nope",
    );
    expect(screen.getByRole("combobox", { name: /^Icon$/ })).toHaveValue(
      "boat",
    );
  });

  it("is a publisher picker with the publishers of the app and self", async () => {
    const { user, game } = setup({ info: { title: "T" } }, ["info"]);
    const box = screen.getByRole("combobox", { name: /^Publisher$/ });
    await user.click(box);
    expect(optionNames()).toEqual(expect.arrayContaining(["aag", "self"]));
    expect(screen.getByRole("option", { name: /^self/ })).toHaveTextContent(
      "Self Published",
    );
    await user.click(screen.getByRole("option", { name: /^self/ }));
    expect(game().info.publisher).toBe("self");

    await user.clear(box);
    await user.type(box, "acme{Enter}");
    expect(game().info.publisher).toBe("acme");
    expect(
      screen.getByText("The app has no publisher named acme."),
    ).toBeVisible();
  });

  it("leaves a value that is not a string to the JSON field", () => {
    setup({ privates: [{ name: "P", icon: 5 }] }, PRIVATE_ICON);
    expect(
      screen.queryByRole("combobox", { name: /^Icon$/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Icon$/ })).toHaveValue("5");
  });
});
