import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const fixture = path.join(import.meta.dirname, "fixtures", "e2e-game.json");

// The saved game's info page, where it can be forgotten
const forget = async (page, url) => {
  await page.goto(url.replace(/\/map$/, ""));
  await page.getByRole("button", { name: "Forget" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
};

// Firefox and Safari flow: no file system access api, so the app uses an
// <input type="file"> and saves the game in the origin private file system.
// Chromium has the api, so it is removed before the app starts
test("loads a game from a file (input flow), lists it, reopens it after a reload, forgets it", async ({
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
  await expect(page.getByText("Game Loaded", { exact: true })).toBeVisible();
  const url = page.url();

  // It is listed alongside the bundled games
  await page.goto("/games/");
  const link = page
    .getByTestId("games")
    .getByRole("link", { name: "E2E Fixture Game" });
  await expect(link).toBeVisible();

  // Persisted: still there after a reload, and the saved url still opens
  await page.reload();
  await link.click();
  await expect(page).toHaveURL(url.replace(/\/map$/, ""));
  await expect(page.locator("[data-testid^='game-internal:']")).toBeVisible();

  // Forget it
  await forget(page, url);
  await expect(page.getByTestId("games")).toBeVisible();
  await expect(link).toHaveCount(0);

  // And it stays forgotten
  await page.reload();
  await expect(page.getByRole("link", { name: "18Test" })).toBeVisible();
  await expect(page.getByText("E2E Fixture Game")).toHaveCount(0);
});

// Chromium flow: the native picker cannot be driven, so showOpenFilePicker is
// stubbed to return a real handle (to a file in the origin private file
// system) and the app's own handle storage in indexedDB runs for real
test("loads a game through the file picker (system flow), lists it, reopens it after a reload, forgets it", async ({
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
  const link = page
    .getByTestId("games")
    .getByRole("link", { name: "E2E Fixture Game" });
  await expect(link).toBeVisible();

  // Persisted: the stored handle still opens after a reload
  await page.reload();
  await link.click();
  await expect(page).toHaveURL(url.replace(/\/map$/, ""));
  await expect(page.locator("[data-testid^='game-system:']")).toBeVisible();

  await forget(page, url);
  await expect(page.getByTestId("games")).toBeVisible();
  await expect(link).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("link", { name: "18Test" })).toBeVisible();
  await expect(page.getByText("E2E Fixture Game")).toHaveCount(0);
});

test("bundled games cannot be forgotten", async ({ page }) => {
  await page.goto("/games/1889");
  await expect(page.getByTestId("game-1889")).toBeVisible();
  await expect(page.getByRole("button", { name: "Forget" })).toHaveCount(0);
});

// The file input is wrapped in the visible button label, so clicking the
// label opens the chooser
test("the open file button opens a file chooser (input flow)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
  });
  await page.goto("/games/");
  const chooser = page.waitForEvent("filechooser", { timeout: 3000 });
  // The visible label, not the file input inside it
  await page.locator("label", { hasText: "Open File" }).click();
  await chooser;
});

// Browsers without a save picker keep the new game in the origin private file
// system, so both pickers are removed before the app starts
test("creates a new game, opens it on the map, lists it and forgets it (input flow)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
    delete window.showSaveFilePicker;
  });
  await page.goto("/games/");

  await page.getByRole("button", { name: "New Game" }).click();

  await expect(page).toHaveURL(/\/games\/internal:[^/]+\/map$/);
  const url = page.url();
  await page.goto(`${url}?edit=true`);
  // The 4 by 4 block of hexes of the template
  for (const row of "ABCD") {
    const first = "AC".includes(row) ? 1 : 2;
    for (const column of [0, 2, 4, 6].map((n) => n + first)) {
      await expect(
        page.locator(`[data-coord="${row}${column}"]`),
      ).toBeVisible();
    }
  }

  await page.goto("/games/");
  await expect(page.getByRole("link", { name: "New Game" })).toBeVisible();
  await forget(page, url);
});
