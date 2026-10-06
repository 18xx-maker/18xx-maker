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
  await expect(page.getByRole("tab", { name: "Game" })).toBeVisible();
  await page.getByRole("tab", { name: "Trains" }).click();
  await expect(page.getByRole("button", { name: "Add train" })).toBeVisible();
  expect(requested.filter((url) => /JsonEditor/.test(url))).toEqual([]);

  await page.getByRole("button", { name: "JSON" }).click();
  await expect(editor(page)).toBeVisible();
  expect(requested.filter((url) => /JsonEditor/.test(url))).not.toEqual([]);
  // The Emacs and Vim keys load when they are chosen, not with the editor
  expect(requested.filter((url) => /editor(Vim|Emacs)/.test(url))).toEqual([]);
});

test("loads the Vim keys when they are chosen", async ({ page }) => {
  const requested = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/settings");
  await page.getByRole("combobox", { name: "Editor keys" }).click();
  await page.getByRole("option", { name: "Vim" }).click();
  await page.goto("/games/18Test/map?edit=true&editSection=json");
  await expect(editor(page)).toBeVisible();
  await expect
    .poll(() => requested.filter((url) => /editorVim/.test(url)).length)
    .toBeGreaterThan(0);
  expect(requested.filter((url) => /editorEmacs/.test(url))).toEqual([]);

  // In Vim the text is typed in insert mode
  await editor(page).click();
  await page.keyboard.press("Control+End");
  await page.keyboard.press("i");
  await page.keyboard.type("j");
  await expect(status(page)).toContainText("syntax error");
});

// A click on a line number marks the line in the url without a history entry,
// a link with lines marks them
test("marks lines with clicks on the line numbers", async ({ page }) => {
  const meta = process.platform === "darwin" ? "Meta" : "Control";
  const number = (line) =>
    page.locator(".cm-lineNumbers .cm-gutterElement", {
      hasText: new RegExp(`^${line}$`),
    });
  const marked = page.locator(".cm-line.cm-selected-line");

  await page.goto("/games/18Test/map?edit=true");
  await page.getByRole("button", { name: "JSON" }).click();
  await expect(editor(page)).toBeVisible();
  await expect(page).toHaveURL(/editSection=json$/);

  // The editor starts folded: unfold all so the lines are on screen
  await editor(page).click();
  await page.keyboard.press("Control+Alt+]");

  await number(3).first().click();
  await expect(page).toHaveURL(/editSection=json&lines=3$/);
  await expect(marked).toHaveCount(1);

  await number(5)
    .first()
    .click({ modifiers: ["Shift"] });
  await expect(page).toHaveURL(/lines=3-5$/);
  await expect(marked).toHaveCount(3);

  await number(8)
    .first()
    .click({ modifiers: [meta] });
  await expect(page).toHaveURL(/lines=3-5,8$/);
  await expect(marked).toHaveCount(4);

  // The clicks did not add history: Back leaves the JSON tab
  await page.goBack();
  await expect(page).toHaveURL(/\?edit=true$/);
  await page.goForward();
  await expect(page).toHaveURL(/lines=3-5,8$/);
  await expect(marked).toHaveCount(4);

  await page.goto("/games/18Test/map?edit=true&editSection=json&lines=2,4-5");
  await expect(marked).toHaveCount(3);
  await expect(page).toHaveURL(/lines=2,4-5$/);
});
