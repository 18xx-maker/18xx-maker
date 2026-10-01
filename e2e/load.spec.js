const path = require("node:path");

const { expect, test } = require("@playwright/test");

const fixture = path.join(__dirname, "fixtures", "e2e-game.json");

// Chromium has the file system access api, which makes the app use a native
// file picker that Playwright cannot drive. Removing it before the app starts
// gives the same <input type="file"> flow Firefox and Safari get, saved to
// the origin private file system
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
  });
});

test("loads a game from a file, lists it, reopens it after a reload, deletes it", async ({
  page,
}) => {
  await page.goto("/games/");
  await expect(page.getByRole("link", { name: "18Test" })).toBeVisible();
  await expect(page.getByText("E2E Fixture Game")).toHaveCount(0);

  await page.getByLabel("Open File").setInputFiles(fixture);

  // Opens the loaded game
  await expect(page).toHaveURL(/\/games\/internal:[^/]+\/map$/);
  await expect(page.getByText("Game Loaded")).toBeVisible();
  const url = page.url();

  // It is listed alongside the bundled games
  await page.goto("/games/");
  const row = page.getByRole("row", { name: /E2E Fixture Game/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText("internal");

  // Persisted: still there after a reload, and the saved url still opens
  await page.reload();
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "E2E Fixture Game" }).click();
  await expect(page).toHaveURL(url);
  await expect(page.locator("[data-testid^='game-internal:']")).toBeVisible();

  // Delete it
  await page.goto("/games/");
  await row.getByRole("button", { name: "Delete E2E Fixture Game" }).click();
  await expect(
    page.getByText("Internal game E2E Fixture Game deleted"),
  ).toBeVisible();
  await expect(row).toHaveCount(0);

  // And it stays deleted
  await page.reload();
  await expect(page.getByRole("link", { name: "18Test" })).toBeVisible();
  await expect(page.getByText("E2E Fixture Game")).toHaveCount(0);
});

test("bundled games cannot be deleted", async ({ page }) => {
  await page.goto("/games/");
  const row = page.getByRole("row", { name: /Shikoku 1889/ });
  await expect(row).toBeVisible();
  await expect(row.getByRole("button", { name: /^Delete/ })).toHaveCount(0);
});
