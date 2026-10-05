import { expect, test } from "@playwright/test";

test("the app nav reaches the games list and the docs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();

  await page.getByRole("link", { name: "Load Games" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
  await expect(page.getByTestId("games")).toBeVisible();

  await page.getByRole("link", { name: "Using 18xx Maker" }).click();
  await expect(page).toHaveURL(/\/docs\/?$/);
  await expect(page.locator("[data-testid^='docs-']")).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home")).toBeVisible();
});

// Game pages pick their section from the toolbar's select, whose options are
// prefixed with their keyboard shortcut ("4:Tiles")
const goToSection = async (page, label) => {
  await page.getByRole("combobox", { name: "Game Section" }).click();
  await page.getByRole("option", { name: new RegExp(`${label}$`) }).click();
};

test.describe("bundled games", () => {
  test("opens 18Test from the games list and walks through its pages", async ({
    page,
  }) => {
    await page.goto("/games/");
    await page
      .getByTestId("games")
      .getByRole("link", { name: "18Test", exact: true })
      .click();
    await expect(page).toHaveURL(/\/games\/18Test$/);
    await expect(page.getByTestId("game-18Test")).toBeVisible();

    await page
      .getByTestId("game-18Test")
      .getByRole("link", { name: "Edit Game" })
      .click();
    await expect(page).toHaveURL(/\/games\/18Test\/map$/);
    await expect(page.getByTestId("game-18Test-map")).toBeVisible();

    const sections = [
      ["Tiles", "tiles"],
      ["Tokens", "tokens"],
      ["Charters", "charters"],
      ["Cards", "cards"],
      ["Market", "market"],
      ["Par", "par"],
      ["Revenue", "revenue"],
      ["Background", "background"],
      ["Map", "map"],
    ];
    for (const [label, path] of sections) {
      await goToSection(page, label);
      await expect(page).toHaveURL(new RegExp(`/games/18Test/${path}$`));
      await expect(page.getByTestId(`game-18Test-${path}`)).toBeVisible();
    }

    // The toolbar's back link returns to the game info page
    await page.getByRole("link", { name: "Game Info" }).click();
    await expect(page).toHaveURL(/\/games\/18Test$/);
    await expect(page.getByTestId("game-18Test")).toBeVisible();
  });

  test("edits the game info in the edit panel", async ({ page }) => {
    await page.goto("/games/18Test/map");
    await expect(page.getByTestId("game-18Test-map")).toBeVisible();

    await page.keyboard.press("e");
    const panel = page.getByTestId("edit-panel");
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(/\?edit=true$/);

    const subtitle = panel.getByRole("textbox", {
      name: "Subtitle",
      exact: true,
    });
    await subtitle.fill("Edited in the panel");
    await subtitle.press("Enter");
    await expect(
      page.getByRole("link", { name: "Changes" }).first(),
    ).toBeVisible();

    await subtitle.press("Escape");
    await expect(panel).toBeHidden();
  });

  test("opens a real game and its pages", async ({ page }) => {
    await page.goto("/games/");
    await page
      .getByTestId("games")
      .getByRole("link", { name: "Shikoku 1889" })
      .click();
    await page
      .getByTestId("game-1889")
      .getByRole("link", { name: "Edit Game" })
      .click();
    await expect(page).toHaveURL(/\/games\/1889\/map$/);
    await expect(page.getByTestId("game-1889-map")).toBeVisible();

    await goToSection(page, "Cards");
    await expect(page.getByTestId("game-1889-cards")).toBeVisible();
    await goToSection(page, "Market");
    await expect(page.getByTestId("game-1889-market")).toBeVisible();
    await goToSection(page, "Tiles");
    await expect(page).toHaveURL(/\/games\/1889\/tiles$/);
    await expect(page.getByTestId("game-1889-tiles")).toBeVisible();
  });

  test("a deep link loads on a fresh visit (spa fallback)", async ({
    page,
  }) => {
    await page.goto("/games/1889/revenue");
    await expect(page.getByTestId("game-1889-revenue")).toBeVisible();
    // Current section is shown in the toolbar
    await expect(
      page.getByRole("combobox", { name: "Game Section" }),
    ).toHaveText("8:Revenue");
  });

  test("shows the game info page", async ({ page }) => {
    await page.goto("/games/1889");
    await expect(page.getByTestId("game-1889")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Shikoku 1889" }),
    ).toBeVisible();
  });
});
