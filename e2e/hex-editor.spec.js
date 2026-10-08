import { expect, test } from "@playwright/test";

// The form of the Hex tab on the built site: the buttons on the edges of the
// hex draw track, the fields change the game, the JSON view shows the same
// group and a group that is not valid keeps the form away.

const panel = (page) => page.getByTestId("edit-panel");
const edge = (page, side) =>
  page.getByRole("button", { name: new RegExp(`^Side ${side}: `) });

test("draws track on the hex and edits a field", async ({ page }) => {
  await page.goto("/games/18Test/map?edit=true&editSection=hex&hex=B12");
  await expect(page.getByTestId("hex-editor")).toBeVisible();

  // Two clicks on the edges draw the track between them
  await edge(page, 1).click();
  await expect(edge(page, 1)).toHaveAttribute("aria-pressed", "true");
  await edge(page, 4).click();
  const inspector = page.getByTestId("hex-inspector");
  await expect(inspector).toBeVisible();
  await expect(
    panel(page).getByRole("list", { name: "Elements of the hex" }),
  ).toContainText("Track");

  // The same group is its JSON
  await page.locator("label", { hasText: "JSON" }).click();
  const json = page.getByRole("textbox", { name: "Hex group JSON" });
  await expect(json).toContainText('"straight"');
  await expect(json).toContainText('"B12"');

  // A label added from the list, then its text
  await page.locator("label", { hasText: "Form" }).click();
  await page.getByRole("combobox", { name: "Add an element" }).click();
  await page.getByRole("option", { name: "Label" }).click();
  const label = page.getByTestId("hex-inspector").getByRole("textbox", {
    name: /^Label/,
  });
  await label.fill("Q");
  await label.blur();
  await page.locator("label", { hasText: "JSON" }).click();
  await expect(json).toContainText('"label": "Q"');
});

test("keeps the form away while the JSON is not valid", async ({ page }) => {
  await page.goto("/games/18Test/map?edit=true&editSection=hex&hex=B12");
  await page.locator("label", { hasText: "JSON" }).click();
  const json = page.getByRole("textbox", { name: "Hex group JSON" });
  await json.click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.type("{");
  await expect(page.getByRole("status")).toContainText("syntax error");

  await page.locator("label", { hasText: "Form" }).click();
  await expect(page.getByRole("alert")).toContainText("not valid yet");
  await expect(page.getByTestId("hex-editor")).toHaveCount(0);

  await json.click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.press("Backspace");
  await expect(page.getByRole("status")).toContainText("Valid JSON");
  await page.locator("label", { hasText: "Form" }).click();
  await expect(page.getByTestId("hex-editor")).toBeVisible();
});

test("only loads the form when the Hex tab shows it", async ({ page }) => {
  const requested = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/games/18Test/map?edit=true");
  await expect(panel(page)).toBeVisible();
  expect(requested.filter((url) => /HexEditor/.test(url))).toEqual([]);

  await page.locator('[data-coord="C11"]').click();
  await expect(page.getByTestId("hex-editor")).toBeVisible();
  expect(requested.filter((url) => /HexEditor/.test(url))).not.toEqual([]);
});

test("drags an element and undoes the drag", async ({ page }) => {
  await page.goto("/games/18Test/map?edit=true&editSection=hex&hex=B12");
  await expect(page.getByTestId("hex-editor")).toBeVisible();
  const city = page
    .getByTestId("hex-canvas-elements")
    .locator('[data-element="cities:0"]');
  const box = await city.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 15, y + 10, { steps: 5 });
  await page.mouse.up();

  const undo = page.getByTestId("hex-editor").getByRole("button", {
    name: /^Undo/,
  });
  await expect(undo).toHaveAttribute("aria-disabled", "false");
  await undo.click();
  await expect(undo).toHaveAttribute("aria-disabled", "true");

  // The JSON view starts over from the group: the drag is gone from it
  await page.locator("label", { hasText: "JSON" }).click();
  const json = page.getByRole("textbox", { name: "Hex group JSON" });
  await expect(json).toContainText('"cities"');
  await expect(json).not.toContainText('"x"');
});
