import { screen, waitFor } from "@testing-library/react";

import { renderApp } from "@tests/support/helpers.jsx";

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

describe("language setting", () => {
  const detect = (language) =>
    vi.spyOn(navigator, "languages", "get").mockReturnValue([language]);

  it("shows the detected language, system by default", async () => {
    detect("en-US");
    renderApp("/settings", { settings: {} });
    expect(
      await screen.findByRole("combobox", { name: "Language" }),
    ).toHaveTextContent("System");
    expect(screen.getByTestId("detected")).toHaveTextContent(
      "Detected language: American English",
    );
  });

  it("says when the detected language has no translations", async () => {
    detect("de-DE");
    renderApp("/settings", { settings: {} });
    expect(await screen.findByTestId("detected")).toHaveTextContent(
      "German (Germany) (not available, using English)",
    );
  });

  it("stores an override and system removes it again", async () => {
    detect("de-DE");
    const { user, store } = renderApp("/settings", { settings: {} });
    const select = await screen.findByRole("combobox", { name: "Language" });

    await user.click(select);
    await user.click(await screen.findByRole("option", { name: "English" }));
    expect(store.getState().settings).toEqual({ language: "en" });
    expect(select).toHaveTextContent("English");

    await user.click(select);
    await user.click(await screen.findByRole("option", { name: "System" }));
    expect(store.getState().settings).toEqual({});
    expect(select).toHaveTextContent("System");
  });
});

describe("editor keys setting", () => {
  it("is normal by default, stores vim and emacs, and normal removes it", async () => {
    const { user, store } = renderApp("/settings", { settings: {} });
    const select = await screen.findByRole("combobox", { name: "Editor keys" });
    expect(select).toHaveTextContent("Normal");

    await user.click(select);
    await user.click(await screen.findByRole("option", { name: "Vim" }));
    expect(store.getState().settings).toEqual({ editorKeys: "vim" });
    expect(select).toHaveTextContent("Vim");

    await user.click(select);
    await user.click(await screen.findByRole("option", { name: "Emacs" }));
    expect(store.getState().settings).toEqual({ editorKeys: "emacs" });

    await user.click(select);
    await user.click(await screen.findByRole("option", { name: "Normal" }));
    expect(store.getState().settings).toEqual({});
  });

  it("shows the stored mode", async () => {
    renderApp("/settings", { settings: { editorKeys: "emacs" } });
    expect(
      await screen.findByRole("combobox", { name: "Editor keys" }),
    ).toHaveTextContent("Emacs");
  });
});
