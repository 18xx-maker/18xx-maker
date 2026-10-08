import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { userEvent as realUser } from "vitest/browser";

import NumberField from "./NumberField";

const setup = (props) => {
  const onChange = vi.fn();
  const view = render(
    <NumberField aria-label="n" value={1} onChange={onChange} {...props} />,
  );
  return { onChange, user: userEvent.setup(), ...view };
};

describe("NumberField", () => {
  it("passes on a number when the field is left or Enter is pressed", async () => {
    const { user, onChange } = setup();
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.type(input, "2.5");
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(2.5);

    await user.clear(input);
    await user.type(input, "4{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it("goes back to the value for an empty or bad input, as Config does", async () => {
    const { user, onChange } = setup();
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue(1);

    await user.clear(input);
    await realUser.keyboard("-");
    await user.tab();
    expect(input).toHaveValue(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows nothing for no value", () => {
    setup({ value: undefined });
    expect(screen.getByRole("spinbutton")).toHaveValue(null);
  });

  it("clears with onClear, which can refuse", async () => {
    const onClear = vi.fn(() => false);
    const { user, onChange } = setup({ onClear });
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await user.tab();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue(1);
  });

  it("keeps a bad input with onInvalid", async () => {
    const onInvalid = vi.fn();
    const onClear = vi.fn();
    const { user } = setup({ onInvalid, onClear });
    const input = screen.getByRole("spinbutton");

    await user.clear(input);
    await realUser.keyboard("-");
    await user.tab();
    expect(onInvalid).toHaveBeenLastCalledWith(true);
    expect(onClear).not.toHaveBeenCalled();

    await user.type(input, "3");
    await user.tab();
    expect(onInvalid).toHaveBeenLastCalledWith(false);
  });

  it("keeps the value when removed with a bad input", async () => {
    const onClear = vi.fn();
    const { user, unmount } = setup({ flush: true, onClear });
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await realUser.keyboard("-");
    unmount();
    expect(onClear).not.toHaveBeenCalled();
  });

  it("passes on what is typed when removed, only with flush", async () => {
    for (const flush of [false, true]) {
      const { user, onChange, unmount } = setup({ flush });
      const input = screen.getByRole("spinbutton");
      await user.clear(input);
      await user.type(input, "7");
      unmount();
      expect(onChange).toHaveBeenCalledTimes(flush ? 1 : 0);
    }
  });

  it("passes on a step at once with commitOnStep, not typed digits", async () => {
    const { user, onChange } = setup({ commitOnStep: true, step: 1 });
    const input = screen.getByRole("spinbutton");
    input.focus();
    await act(() => realUser.keyboard("{ArrowUp}"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(2);

    await user.clear(input);
    await user.type(input, "9");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("does not pass on a step without commitOnStep", async () => {
    const { onChange } = setup({ step: 1 });
    screen.getByRole("spinbutton").focus();
    await act(() => realUser.keyboard("{ArrowUp}"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
