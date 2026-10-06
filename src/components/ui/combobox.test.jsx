import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { Combobox } from "@/components/ui/combobox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";

const options = [
  { value: "2", label: "$80" },
  { value: "3", label: "$180" },
  { value: "4", label: "$300" },
];

const Harness = ({ onSelect, onEnter }) => {
  const [value, setValue] = useState("");
  return (
    <>
      <label htmlFor="box">Train</label>
      <Combobox
        id="box"
        aria-describedby="hint"
        options={options}
        value={value}
        onValueChange={setValue}
        onSelect={(option) => {
          setValue(option.value);
          onSelect?.(option);
        }}
        onEnter={onEnter}
        emptyText="No matches"
      />
      <p id="hint">A hint</p>
    </>
  );
};

const setup = (props) => ({
  user: userEvent.setup(),
  ...render(<Harness {...props} />),
});

const box = () => screen.getByRole("combobox", { name: "Train" });

describe("a combobox", () => {
  it("is a closed combobox with the list attributes", () => {
    setup();
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(box()).toHaveAttribute("aria-autocomplete", "list");
    expect(box()).not.toHaveAttribute("aria-controls");
    expect(box()).not.toHaveAttribute("aria-activedescendant");
    expect(box()).toHaveAccessibleDescription("A hint");
  });

  it("opens on a click and ties the list to the input", async () => {
    const { user } = setup();
    await user.click(box());
    expect(box()).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("listbox");
    expect(box()).toHaveAttribute("aria-controls", list.id);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    // Focus stays in the input
    expect(box()).toHaveFocus();
  });

  it("moves through the list with the arrows, Home and End", async () => {
    const { user } = setup();
    await user.click(box());
    const active = () =>
      screen
        .getAllByRole("option")
        .findIndex((o) => o.getAttribute("aria-selected") === "true");
    expect(active()).toBe(-1);

    await user.keyboard("{ArrowDown}");
    expect(active()).toBe(0);
    expect(box()).toHaveAttribute(
      "aria-activedescendant",
      screen.getAllByRole("option")[0].id,
    );
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(active()).toBe(2);
    await user.keyboard("{ArrowUp}");
    expect(active()).toBe(1);
    await user.keyboard("{Home}");
    expect(active()).toBe(0);
    await user.keyboard("{End}");
    expect(active()).toBe(2);
    expect(box()).toHaveFocus();
  });

  it("opens with the arrow when closed", async () => {
    const { user } = setup();
    box().focus();
    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")[0]).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("picks the active option with Enter", async () => {
    const onSelect = vi.fn();
    const onEnter = vi.fn();
    const { user } = setup({ onSelect, onEnter });
    await user.click(box());
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith(options[1]);
    expect(onEnter).not.toHaveBeenCalled();
    expect(box()).toHaveValue("3");
    expect(box()).toHaveAttribute("aria-expanded", "false");
  });

  it("gives Enter to the owner when no option is active", async () => {
    const onSelect = vi.fn();
    const onEnter = vi.fn();
    const { user } = setup({ onSelect, onEnter });
    await user.click(box());
    await user.keyboard("zz{Enter}");
    expect(onEnter).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("shows no matches with the typed text still free", async () => {
    const { user } = setup();
    await user.click(box());
    await user.keyboard("zz");
    expect(screen.getByText("No matches")).toBeVisible();
    expect(box()).toHaveValue("zz");
  });

  it("closes with Escape, and a second Escape is the sheet's", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
          <SheetDescription>Fields</SheetDescription>
          <Harness />
        </SheetContent>
      </Sheet>,
    );
    await user.click(box());
    expect(screen.getByRole("listbox")).toBeVisible();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(box()).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("is usable inside a sheet: a click picks an option", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
          <SheetDescription>Fields</SheetDescription>
          <Harness onSelect={onSelect} />
        </SheetContent>
      </Sheet>,
    );
    await user.click(box());
    await user.click(screen.getByRole("option", { name: /^4/ }));
    expect(onSelect).toHaveBeenCalledWith(options[2]);
  });
});
