import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

// The render input is read when the modules load, so it is set before them
vi.mock("@/util/renderInput", () => ({
  getRenderInput: () => ({ id: "x", game: {}, config: {} }),
}));

const html = document.documentElement;

afterEach(() => {
  vi.restoreAllMocks();
  html.classList.remove("light", "dark");
  html.style.removeProperty("color-scheme");
});

describe("theme in render mode", () => {
  it("stays light with a dark system and a dark setting", async () => {
    const real = window.matchMedia.bind(window);
    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      query === "(prefers-color-scheme: dark)"
        ? {
            matches: true,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
          }
        : real(query),
    );

    renderApp("/settings", { settings: { theme: "dark" } });
    await screen.findByRole("combobox", { name: "Theme" });

    await waitFor(() => expect(html).toHaveClass("light"));
    expect(html).not.toHaveClass("dark");
    expect(html.style.getPropertyValue("color-scheme")).toBe("light");
  });
});
