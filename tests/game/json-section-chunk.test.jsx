import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import JsonSection from "@/components/editPanel/JsonSection";

import { allowConsole } from "@tests/support/console.js";

// The editor chunk fails to load until the test lets it work
const state = vi.hoisted(() => ({ fail: true }));

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal();
  return {
    ...react,
    lazy: (load) =>
      react.lazy(() =>
        state.fail ? Promise.reject(new Error("chunk failed")) : load(),
      ),
  };
});

vi.mock("@/components/editPanel/JsonEditor", async () => {
  const { createElement } = await import("react");
  return {
    default: () => createElement("textarea", { "aria-label": "Game JSON" }),
  };
});

describe("json section chunk", () => {
  it("loads on a later mount after a retry fixed a failed import", async () => {
    allowConsole(/./);
    const view = render(<JsonSection game={{}} />);
    const retry = await screen.findByRole("button", { name: "Try again" });
    state.fail = false;
    await userEvent.click(retry);
    expect(
      await screen.findByRole("textbox", { name: "Game JSON" }),
    ).toBeInTheDocument();
    view.unmount();

    render(<JsonSection game={{}} />);
    expect(
      await screen.findByRole("textbox", { name: "Game JSON" }),
    ).toBeInTheDocument();
  });
});
