import { expect, test } from "@playwright/test";

// The JSON editor of the edit panel on the built site: j opens it, typing
// changes the page, a break keeps the last good game, Escape leaves it.

const editor = (page) => page.getByRole("textbox", { name: "Game JSON" });
const status = (page) => page.getByRole("status");

test("edits the game as JSON", async ({ page }) => {
  await page.goto("/games/18Test/map");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();

  await page.keyboard.press("j");
  await expect(editor(page)).toBeVisible();
  await expect(page).toHaveURL(/editSection=json/);

  // Typing is not a shortcut: the panel and the tab stay
  await editor(page).click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type("j");
  await expect(status(page)).toContainText("syntax error");
  await expect(page.getByTestId("edit-panel")).toBeVisible();
  await page.keyboard.press("Backspace");
  await expect(status(page)).toContainText("Valid JSON");

  // Format is for valid text
  await page.getByRole("button", { name: "Format" }).click();
  await expect(status(page)).toContainText("Valid JSON");

  // Broken text shows where, Escape leaves the editor, a second closes it
  await editor(page).click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type("{");
  await expect(status(page)).toContainText("syntax error");
  await expect(page.getByRole("button", { name: "Format" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(editor(page)).not.toBeFocused();
  await expect(page.getByTestId("edit-panel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("edit-panel")).toBeHidden();
});

test("only loads the editor when its tab opens", async ({ page }) => {
  const requested = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/games/18Test/map?edit=true");
  await expect(page.getByRole("tab", { name: "Game info" })).toBeVisible();
  await page.getByRole("tab", { name: "Trains" }).click();
  await expect(page.getByRole("button", { name: "Add train" })).toBeVisible();
  expect(requested.filter((url) => /JsonEditor/.test(url))).toEqual([]);

  await page.getByRole("tab", { name: "JSON" }).click();
  await expect(editor(page)).toBeVisible();
  expect(requested.filter((url) => /JsonEditor/.test(url))).not.toEqual([]);
});
