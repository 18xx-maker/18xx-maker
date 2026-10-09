import { expect, test } from "@playwright/test";

// Cmd/Ctrl+S saves the open game on the built site. A browser's own "save
// page" dialog can not be seen, so a listener after the app's records whether
// the key was kept from the browser, and the saved file is read back.

const editor = (page) => page.getByRole("textbox", { name: "Game JSON" });

test("Ctrl+S and the toolbar button save a game and keep the browser out of it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
    delete window.showSaveFilePicker;
    window.addEventListener("keydown", (event) => {
      if (event.key === "s" && (event.ctrlKey || event.metaKey))
        (window.seen ??= []).push(event.defaultPrevented);
    });
  });

  // A copy in the private file system, which can be saved
  await page.goto("/games/18Test");
  await page.getByRole("button", { name: "Save as..." }).click();
  const dialog = page.getByRole("dialog", { name: "Save as" });
  await dialog.getByLabel("File name").fill("save-key");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(/\/games\/internal:save-key$/);
  await page.goto("/games/internal:save-key/map");
  await expect(page.getByTestId("game-internal:save-key-map")).toBeVisible();
  await expect(page.getByTestId("toolbar-save")).toHaveCount(0);

  // Edit in the JSON editor and save with the key
  await page.keyboard.press("j");
  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.type('"firstEdit": 1,');
  await expect(page.getByTestId("toolbar-save")).toBeVisible();
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.getByTestId("toolbar-save")).toHaveCount(0);
  expect(await page.evaluate(() => window.seen)).toEqual([true]);

  // The button saves the next edit
  await editor(page).click();
  await page.keyboard.press("ControlOrMeta+Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.type('"secondEdit": 2,');
  await page.getByTestId("toolbar-save").click();
  await expect(page.getByTestId("toolbar-save")).toHaveCount(0);

  // Both edits are in the file
  await page.goto("/games/internal:save-key/map?edit=true&editSection=json");
  await expect(editor(page)).toContainText("secondEdit");
  await expect(editor(page)).toContainText("firstEdit");
  await expect(page.getByTestId("toolbar-save")).toHaveCount(0);

  // Ctrl+S with nothing to save still keeps the browser out
  await page.keyboard.press("ControlOrMeta+s");
  expect((await page.evaluate(() => window.seen)).at(-1)).toBe(true);

  await page.goto("/games/internal:save-key");
  await page.getByRole("button", { name: "Forget" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
});
