import { expect, test } from "@playwright/test";

const forget = async (page, url) => {
  await page.goto(url.replace(/\/map$/, ""));
  await page.getByRole("button", { name: "Forget" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
};

// Browsers without a file picker keep the copy in the origin private file
// system, so both pickers are removed before the app starts (capability is
// read when the app is imported)
test("saves a copy of a bundled game by name (input flow), keeps it after a reload, lists it and forgets it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
    delete window.showSaveFilePicker;
  });
  await page.goto("/games/18Test");
  await page.getByRole("button", { name: "Save as..." }).click();

  const dialog = page.getByRole("dialog", { name: "Save as" });
  const name = dialog.getByLabel("File name");
  await expect(name).toHaveValue("18test.json");
  await name.fill("my copy #1 %?&:");
  await dialog.getByRole("button", { name: "Save" }).click();

  // The id is the name, without the characters a URL treats specially
  await expect(page).toHaveURL(/\/games\/internal:my%20copy%201$/);
  expect(new URL(page.url()).pathname).toMatch(
    /^\/games\/internal:[A-Za-z0-9._%-]+$/,
  );
  await expect(page.getByTestId("game-internal:my copy 1")).toBeVisible();
  const url = page.url();

  // Persisted
  await page.reload();
  await expect(page.getByTestId("game-internal:my copy 1")).toBeVisible();

  await page.goto("/games/");
  const link = page.getByTestId("games").getByRole("link", { name: "18Test" });
  await expect(link).toHaveCount(2);

  // The same name asks before it replaces the game
  await page.goto("/games/18Test");
  await page.getByRole("button", { name: "Save as..." }).click();
  await dialog.getByLabel("File name").fill("my copy 1");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByRole("alert")).toContainText("already exists");
  await dialog.getByRole("button", { name: "Replace" }).click();
  await expect(page).toHaveURL(url);

  await forget(page, url);
  await expect(link).toHaveCount(1);
});

// Chromium flow: showSaveFilePicker is stubbed to return a real handle (to a
// file in the origin private file system) and the app's own handle storage in
// indexedDB runs for real
test("saves a copy of a bundled game through the save picker (system flow)", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.showSaveFilePicker = async ({ suggestedName }) => {
      window.suggested = suggestedName;
      const root = await navigator.storage.getDirectory();
      return root.getFileHandle("picked-copy.json", { create: true });
    };
  });
  await page.goto("/games/18Test");

  await page.getByRole("button", { name: "Save as..." }).click();

  // No dialog of the app: the picker asks for the name
  await expect(page).toHaveURL(/\/games\/system:[^/]+$/);
  await expect(page.locator("[data-testid^='game-system:']")).toBeVisible();
  expect(await page.evaluate(() => window.suggested)).toBe("18test.json");
  const url = page.url();

  await page.goto("/games/");
  await expect(
    page.getByTestId("games").getByRole("link", { name: "18Test" }),
  ).toHaveCount(2);
  await forget(page, url);
});
