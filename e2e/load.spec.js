const fs = require("node:fs");
const path = require("node:path");

const { expect, test } = require("@playwright/test");

const fixture = path.join(__dirname, "fixtures", "e2e-game.json");

// Firefox and Safari flow: no file system access api, so the app uses an
// <input type="file"> and saves the game in the origin private file system.
// Chromium has the api, so it is removed before the app starts
test("loads a game from a file (input flow), lists it, reopens it after a reload, deletes it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
  });
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

// Chromium flow: the native picker cannot be driven, so showOpenFilePicker is
// stubbed to return a real handle (to a file in the origin private file
// system) and the app's own handle storage in indexedDB runs for real
test("loads a game through the file picker (system flow), lists it, reopens it after a reload, deletes it", async ({
  page,
}) => {
  const text = fs.readFileSync(fixture, "utf8");
  await page.addInitScript((text) => {
    window.showOpenFilePicker = async () => {
      const root = await navigator.storage.getDirectory();
      const file = await root.getFileHandle("picked.json", { create: true });
      const writable = await file.createWritable();
      await writable.write(text);
      await writable.close();
      return [file];
    };
  }, text);

  await page.goto("/games/");
  await expect(page.getByText("E2E Fixture Game")).toHaveCount(0);

  await page.getByRole("button", { name: "Open File" }).click();

  await expect(page).toHaveURL(/\/games\/system:[^/]+\/map$/);
  await expect(page.locator("[data-testid^='game-system:']")).toBeVisible();
  const url = page.url();

  await page.goto("/games/");
  const row = page.getByRole("row", { name: /E2E Fixture Game/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText("system");

  // Persisted: the stored handle still opens after a reload
  await page.reload();
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: "E2E Fixture Game" }).click();
  await expect(page).toHaveURL(url);
  await expect(page.locator("[data-testid^='game-system:']")).toBeVisible();

  await page.goto("/games/");
  await row.getByRole("button", { name: "Delete E2E Fixture Game" }).click();
  await expect(row).toHaveCount(0);

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
