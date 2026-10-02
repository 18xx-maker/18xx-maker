import { act, screen } from "@testing-library/react";
import { page } from "@vitest/browser/context";

import { renderApp } from "@tests/helpers.jsx";

// useBindings listens on document and only ignores INPUT and TEXTAREA targets.
// With the MUI popups the shortcuts also fired while a select popup or a menu
// was open, on top of the popup's own typeahead: typing "t" to reach "traxx"
// also went to the tiles page. The Base UI popups handle printable keys
// themselves (typeahead) and do not let them reach the document, so the
// shortcuts are quiet while a popup holds the focus. A closed select trigger
// does not handle keys, so shortcuts still work there.
describe("bindings with popups", () => {
  it("do not fire for keys typed in an open select popup", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    await user.click(screen.getByRole("combobox", { name: /^Theme/ }));
    const listbox = await screen.findByRole("listbox");
    await user.keyboard("e");

    expect(router.state.location.pathname).toBe("/games/18Test/map");
    expect(listbox).toBeInTheDocument();
  });

  it("do not fire for keys typed in an open menu", async () => {
    await page.viewport(414, 896);
    const { user, router } = renderApp("/");
    await screen.findByTestId("home");

    await user.click(screen.getByRole("button", { name: "Home" }));
    await screen.findByRole("menuitem", { name: "Load Games" });
    await user.keyboard("e");

    expect(router.state.location.pathname).toBe("/");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("fire with a closed select trigger focused", async () => {
    const { user, router } = renderApp("/games/18Test/map?config=true");
    await screen.findByRole("button", { name: "Close Config" });

    act(() => screen.getByRole("combobox", { name: /^Theme/ }).focus());
    await user.keyboard("h");

    expect(router.state.location.pathname).toBe("/");
  });
});
