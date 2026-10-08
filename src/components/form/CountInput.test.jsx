import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { userEvent as realUser } from "vitest/browser";

import CountInput from "./CountInput";

const setup = (props) => {
  const onChange = vi.fn();
  const onClear = vi.fn();
  const onInvalid = vi.fn();
  const view = render(
    <CountInput
      aria-label="Quantity"
      value={3}
      onChange={onChange}
      onClear={onClear}
      onInvalid={onInvalid}
      {...props}
    />,
  );
  return { onChange, onClear, onInvalid, user: userEvent.setup(), ...view };
};

const input = () => screen.getByRole("spinbutton", { name: "Quantity" });
const toggle = () => screen.getByRole("button", { name: "Infinity" });

describe("CountInput", () => {
  it("shows a number with the toggle off", () => {
    setup();
    expect(input()).toHaveValue(3);
    expect(input()).toBeEnabled();
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });

  it("shows infinity as a disabled empty field with the toggle on", () => {
    setup({ value: "∞" });
    expect(input()).toBeDisabled();
    expect(input()).toHaveValue(null);
    expect(input()).toHaveAttribute("placeholder", "∞");
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
  });

  it("turns infinity on and back to the last number", async () => {
    const { user, onChange, rerender } = setup();
    await user.click(toggle());
    expect(onChange).toHaveBeenLastCalledWith("∞");
    rerender(
      <CountInput aria-label="Quantity" value="∞" onChange={onChange} />,
    );
    await user.click(toggle());
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("goes back to the minimum when it started as infinity", async () => {
    const { user, onChange } = setup({ value: "∞", min: 2 });
    await user.click(toggle());
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  it("steps with the arrow keys, one change for each step", async () => {
    const { onChange } = setup();
    input().focus();
    await act(() => realUser.keyboard("{ArrowUp}"));
    expect(onChange).toHaveBeenLastCalledWith(4);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes on a typed number when the field is left", async () => {
    const { user, onChange } = setup();
    await user.clear(input());
    await user.type(input(), "7");
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(7);
  });

  it("refuses a number that is not a whole number of at least the minimum", async () => {
    const { user, onChange, onInvalid } = setup();
    for (const text of ["2.5", "0"]) {
      await user.clear(input());
      await user.type(input(), text);
      await user.tab();
      expect(onInvalid).toHaveBeenLastCalledWith(true);
    }
    await user.clear(input());
    await realUser.keyboard("-");
    await user.tab();
    expect(onInvalid).toHaveBeenLastCalledWith(true);
    await user.clear(input());
    await realUser.keyboard("e");
    await user.tab();
    expect(onInvalid).toHaveBeenLastCalledWith(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears with onClear when emptied", async () => {
    const { user, onClear } = setup();
    await user.clear(input());
    await user.tab();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("never clears or saves anything while infinity is on", async () => {
    const { onClear, onChange, unmount } = setup({ value: "∞" });
    unmount();
    expect(onClear).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not save an invalid number when removed", async () => {
    const { user, onChange, onInvalid, unmount } = setup();
    await user.clear(input());
    await user.type(input(), "0");
    unmount();
    expect(onChange).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenLastCalledWith(true);
  });

  it("saves a typed number when removed", async () => {
    const { user, onChange, unmount } = setup();
    await user.clear(input());
    await user.type(input(), "6");
    unmount();
    expect(onChange).toHaveBeenLastCalledWith(6);
  });
});
