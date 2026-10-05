import { act, screen } from "@testing-library/react";

import i18n from "@/locales/i18n";

import { renderApp } from "@tests/support/helpers.jsx";

// Docs exist in English, German and Chinese, so a browser in another language
// (fr-FR) must fall back to English instead of rendering a blank page.
describe("docs in a language without translations", () => {
  afterEach(() => act(() => i18n.changeLanguage("en")));

  it("falls back to English for docs and home", async () => {
    await i18n.changeLanguage("fr-FR");
    expect(i18n.languages[0]).toBe("fr");

    renderApp("/docs");
    expect(await screen.findByTestId("docs-index")).not.toBeEmptyDOMElement();
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });

  it("falls back to English for the home page", async () => {
    await i18n.changeLanguage("fr-FR");
    renderApp("/");
    const home = await screen.findByTestId("home");
    expect(home.textContent.trim()).not.toBe("");
  });
});
