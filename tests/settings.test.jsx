import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/helpers.jsx";

const html = document.documentElement;

const chooseTheme = async (user, name) => {
  await user.click(await screen.findByRole("combobox", { name: "Theme" }));
  await user.click(await screen.findByRole("option", { name }));
};

const expectTheme = async (theme) => {
  await waitFor(() => expect(html).toHaveClass(theme));
  expect(html).not.toHaveClass(theme === "dark" ? "light" : "dark");
  expect(html.style.getPropertyValue("color-scheme")).toBe(theme);
};

// Make the OS color scheme preference report dark (or light)
const preferDark = (dark) => {
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, "matchMedia").mockImplementation((query) =>
    query === "(prefers-color-scheme: dark)"
      ? {
          matches: dark,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }
      : real(query),
  );
};

afterEach(() => {
  vi.restoreAllMocks();
  html.classList.remove("light", "dark", "system");
  html.style.removeProperty("color-scheme");
});

describe("settings page", () => {
  it("switches to dark and back to light, storing the choice", async () => {
    preferDark(false);
    const { user, store } = renderApp("/settings", { settings: {} });
    expect(await screen.findByTestId("settings")).toBeInTheDocument();
    await expectTheme("light");

    await chooseTheme(user, "Dark");
    await expectTheme("dark");
    expect(store.getState().settings).toEqual({ theme: "dark" });
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveTextContent(
      "Dark",
    );

    await chooseTheme(user, "Light");
    await expectTheme("light");
    expect(store.getState().settings).toEqual({ theme: "light" });
  });

  it("applies a stored theme on load", async () => {
    preferDark(false);
    renderApp("/settings", { settings: { theme: "dark" } });
    expect(
      await screen.findByRole("combobox", { name: "Theme" }),
    ).toHaveTextContent("Dark");
    await expectTheme("dark");
  });

  it("system removes the stored theme and follows the os preference", async () => {
    preferDark(true);
    const { user, store } = renderApp("/settings", {
      settings: { theme: "light" },
    });
    await expectTheme("light");

    await chooseTheme(user, "System");
    expect(store.getState().settings).toEqual({});
    await expectTheme("dark");
    expect(screen.getByRole("combobox", { name: "Theme" })).toHaveTextContent(
      "System",
    );
  });

  it("follows the os preference with no stored theme", async () => {
    preferDark(true);
    renderApp("/settings");
    expect(
      await screen.findByRole("combobox", { name: "Theme" }),
    ).toHaveTextContent("System");
    await expectTheme("dark");
  });
});
