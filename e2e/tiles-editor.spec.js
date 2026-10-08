import { expect, test } from "@playwright/test";

// The Tiles tab of the edit panel on the built site: a tile is picked, renamed
// (the private that draws it follows), copied, customized and removed.

const panel = (page) => page.getByTestId("edit-panel");
const tile = (page, id) =>
  page.getByRole("button", { name: new RegExp(`^${id.replace("|", "\\|")} `) });

test("renames a tile and the private that draws it", async ({ page }) => {
  await page.goto("/games/18Test/tiles?edit=true&editSection=tiles");
  await expect(page.getByTestId("game-18Test-tiles")).toBeVisible();

  await tile(page, "T1").click();
  await expect(page).toHaveURL(/tile=T1/);
  const editor = page.getByTestId("tile-editor");
  await expect(editor).toContainText("1 private draws this tile");

  const id = editor.getByRole("textbox", { name: "Tile id" });
  await id.fill("T11");
  await id.press("Enter");
  await expect(tile(page, "T11")).toBeVisible();
  await expect(tile(page, "T1")).toHaveCount(0);
  await expect(page).toHaveURL(/tile=T11/);

  // The changes page lists the tile and the private that draws it
  await page.getByRole("link", { name: "Review and save changes" }).click();
  const changes = page.getByTestId("game-18Test-changes");
  await expect(changes).toContainText('"T11": {');
  await expect(changes).toContainText('"tile": "T11"');
});

test("picks a tile with a variant, customizes and copies it", async ({
  page,
}) => {
  await page.goto("/games/18Test/tiles?edit=true&editSection=tiles");
  await tile(page, "26|T2").click();
  await expect(page).toHaveURL(/tile=26%257CT2/);
  const editor = page.getByTestId("tile-editor");
  await expect(editor).toContainText("never edited");

  await editor.getByRole("button", { name: "Customize" }).click();
  await expect(page.getByTestId("hex-editor")).toBeVisible();
  await expect(editor.getByRole("button", { name: "Customize" })).toHaveCount(
    0,
  );

  await editor.getByRole("button", { name: "Copy tile" }).click();
  await expect(tile(page, "26|T2-copy")).toBeVisible();
  await expect(page).toHaveURL(/tile=26%257CT2-copy/);

  await editor.getByRole("button", { name: "Remove tile" }).click();
  await expect(tile(page, "26|T2-copy")).toHaveCount(0);
  await expect(page).not.toHaveURL(/tile=/);
  await expect(panel(page)).toBeVisible();
});

test("adds a tile and loads the editor only when a tile of your own shows", async ({
  page,
}) => {
  const requested = [];
  page.on("request", (request) => requested.push(request.url()));

  await page.goto("/games/18Test/tiles?edit=true&editSection=tiles");
  await expect(
    page.getByRole("list", { name: "Tiles of the game" }),
  ).toBeVisible();
  expect(requested.filter((url) => /HexEditor/.test(url))).toEqual([]);

  await page.getByRole("textbox", { name: "New tile id" }).fill("Z9");
  await page.getByRole("button", { name: "Add tile" }).click();
  await expect(page.getByTestId("hex-editor")).toBeVisible();
  expect(requested.filter((url) => /HexEditor/.test(url))).not.toEqual([]);
  await expect(tile(page, "Z9")).toBeVisible();
});

test("the Tiles tab is on every page and goes to the tiles page", async ({
  page,
}) => {
  await page.goto("/games/18Test/market?edit=true");
  await page.getByRole("tab", { name: "Tiles" }).click();
  await expect(page).toHaveURL(/\/games\/18Test\/tiles\?/);
  await expect(page.getByTestId("game-18Test-tiles")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Tiles" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

// The page of the sheet is fitted to the window and the panel covers a part of
// it, so the clicks are on the dispatched events of the elements themselves
const tap = (locator) =>
  locator.evaluate((el) => {
    const view = document.getElementById("editor");
    const box = el.getBoundingClientRect();
    const at = {
      clientX: box.x + box.width / 2,
      clientY: box.y + box.height / 2,
    };
    const pointer = {
      pointerId: 3,
      button: 0,
      buttons: 1,
      bubbles: true,
      ...at,
    };
    el.dispatchEvent(new PointerEvent("pointerdown", pointer));
    view.dispatchEvent(
      new PointerEvent("pointerup", { ...pointer, buttons: 0 }),
    );
  });

test("a click on a tile of the sheet picks it, the dashed cell adds one", async ({
  page,
}) => {
  await page.goto("/games/18Test/tiles?edit=true&editSection=json&lines=1-2");
  await expect(page.getByTestId("game-18Test-tiles")).toBeVisible();

  await tap(page.locator('[data-tile="63"]').first());
  await expect(page).toHaveURL(/editSection=tiles/);
  await expect(page).toHaveURL(/tile=63/);
  await expect(page).not.toHaveURL(/lines=/);
  await expect(page.getByTestId("tile-editor")).toBeVisible();
  await expect(page.getByTestId("tile-selected")).toHaveCount(1);

  // T1 and T2 are tiles of the game already
  await page.getByRole("button", { name: /^T1 / }).waitFor();
  await tap(page.locator("[data-next]"));
  await expect(tile(page, "T2")).toBeVisible();
  await expect(page).toHaveURL(/tile=T2/);
  await expect(page.getByTestId("tile-selected")).toHaveCount(1);
});
