import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import JsonSection from "@/components/editPanel/JsonSection";

import { allowConsole } from "@tests/support/console.js";

// The editor fails until the test lets it work
const state = vi.hoisted(() => ({ fail: true }));

vi.mock("@/components/editPanel/JsonEditor", async () => {
  const { createElement } = await import("react");
  return {
    default: () => {
      if (state.fail) throw new Error("chunk failed");
      return createElement("textarea", { "aria-label": "Game JSON" });
    },
  };
});

describe("json section", () => {
  it("loads the editor on retry after a failed load", async () => {
    allowConsole(/./);
    render(<JsonSection game={{}} />);
    const retry = await screen.findByRole("button", { name: "Try again" });
    state.fail = false;
    await userEvent.click(retry);
    expect(
      await screen.findByRole("textbox", { name: "Game JSON" }),
    ).toBeInTheDocument();
  });
});
