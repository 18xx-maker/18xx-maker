import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SchemaField, {
  SchemaFormContext,
} from "@/components/schemaForm/SchemaField";

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
