import { act, screen } from "@testing-library/react";
import { page } from "@vitest/browser/context";

import { renderApp } from "@tests/helpers.jsx";

// useBindings listens on document and only ignores INPUT and TEXTAREA targets,
// so shortcuts also fire while the focus is on a select trigger, a select
// option or a menu item. That is how it behaved with the MUI popups and these
// tests pin it so a change of popup library does not silently change it.
describe("bindings with popups open", () => {
  it("fires with a select popup open", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(screen.getByRole("combobox", { name: /^Theme/ }));
    await screen.findByRole("listbox");
    await user.keyboard("e");

    expect(router.state.location.pathname).toBe("/elements");
  });

  it("fires with a select trigger focused", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    act(() => screen.getByRole("combobox", { name: /^Theme/ }).focus());
    await user.keyboard("h");

    expect(router.state.location.pathname).toBe("/");
  });

  it("fires with a menu open", async () => {
    await page.viewport(414, 896);
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.click(screen.getByRole("button", { name: "Home" }));
    await screen.findByRole("menuitem", { name: "Load Games" });
    await user.keyboard("e");

    expect(router.state.location.pathname).toBe("/elements");
  });
});
