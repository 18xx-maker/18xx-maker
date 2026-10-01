const { expect, test } = require("@playwright/test");

test("the app nav reaches the games list and the docs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home")).toBeVisible();

  await page.getByRole("link", { name: "Load Games" }).click();
  await expect(page).toHaveURL(/\/games\/$/);
  await expect(page.getByTestId("games")).toBeVisible();

  await page.getByRole("link", { name: "Help" }).click();
  await expect(page).toHaveURL(/\/docs\//);
  await expect(page.locator("[data-testid^='docs-']")).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("home")).toBeVisible();
});

test.describe("bundled games", () => {
  test("opens 18Test from the games list and walks through its pages", async ({
    page,
  }) => {
    await page.goto("/games/");
    await page.getByRole("link", { name: "18Test", exact: true }).click();
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
      await page.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/games/18Test/${path}$`));
      await expect(page.getByTestId(`game-18Test-${path}`)).toBeVisible();
    }
  });

  test("opens a real game and its pages", async ({ page }) => {
    await page.goto("/games/");
    await page.getByRole("link", { name: "Shikoku 1889" }).click();
    await expect(page).toHaveURL(/\/games\/1889\/map$/);
    await expect(page.getByTestId("game-1889-map")).toBeVisible();

    await page.getByRole("link", { name: "Cards", exact: true }).click();
    await expect(page.getByTestId("game-1889-cards")).toBeVisible();
    await page.getByRole("link", { name: "Market", exact: true }).click();
    await expect(page.getByTestId("game-1889-market")).toBeVisible();
    await page.getByRole("link", { name: "Tiles", exact: true }).click();
    await expect(page).toHaveURL(/\/games\/1889\/tiles$/);
    await expect(page.getByTestId("game-1889-tiles")).toBeVisible();
  });

  test("a deep link loads on a fresh visit (spa fallback)", async ({
    page,
  }) => {
    await page.goto("/games/1889/revenue");
    await expect(page.getByTestId("game-1889-revenue")).toBeVisible();
    // Current section is marked in the side nav
    await expect(
      page.getByRole("link", { name: "Revenue", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("shows the game info page", async ({ page }) => {
    await page.goto("/games/1889");
    await expect(page.getByTestId("game-1889")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Shikoku 1889" }),
    ).toBeVisible();
  });
});
