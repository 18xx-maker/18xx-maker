import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const fixture = path.join(import.meta.dirname, "fixtures", "e2e-game.json");

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

// Dropping a game file anywhere in the app loads it (#dropzone), also while a
// drawer is open: the config drawer is a panel next to the page, the side nav
// on a narrow screen is a modal <dialog> whose backdrop covers the page. The
// drop is dispatched at the element under the given point, which is what the
// browser does with a real drop, so an overlay that swallowed it would fail.
const dropAt = (page, { x, y }) =>
  page.evaluate(
    async ({ x, y, text }) => {
      const target = document.elementFromPoint(x, y);
      const data = new DataTransfer();
      data.items.add(new File([text], "dropped.json"));
      const fire = (type) => {
        const event = new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          dataTransfer: data,
        });
        target.dispatchEvent(event);
        return event;
      };
      const over = fire("dragover");
      fire("drop");
      return {
        where: target.closest("[data-testid]")?.dataset.testid,
        overPrevented: over.defaultPrevented,
      };
    },
    { x, y, text: fs.readFileSync(fixture, "utf8") },
  );

for (const { name, size, open, covered } of [
  {
    name: "the config drawer",
    size: { width: 1280, height: 800 },
    open: async (page) => {
      await page.goto("/games/18Test/map?config=true");
      await expect(
        page.getByRole("button", { name: "Close Config" }),
      ).toBeVisible();
    },
    covered: "config-drawer",
  },
  {
    name: "the side nav backdrop",
    size: { width: 500, height: 800 },
    open: async (page) => {
      await page.goto("/games/18Test/map");
      await page.getByRole("button", { name: "menu" }).click();
      await expect(page.getByTestId("side-nav-temporary")).toBeVisible();
    },
    covered: "side-nav-temporary",
  },
]) {
  test(`loads a dropped game file while ${name} is open`, async ({ page }) => {
    await page.addInitScript(() => {
      delete window.showOpenFilePicker;
    });
    await page.setViewportSize(size);
    await open(page);

    // The right edge is the drawer (config) or the backdrop (side nav, whose
    // panel is 300px wide)
    const result = await dropAt(page, { x: size.width - 20, y: 400 });
    expect(result).toEqual({ where: covered, overPrevented: true });

    await expect(page).toHaveURL(/\/games\/internal:[^/]+\/map$/);
    await expect(page.getByText("Game Loaded")).toBeVisible();
  });
}
