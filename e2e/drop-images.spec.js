import { expect, test } from "@playwright/test";

const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h5v5z"/></svg>';

// A drop of files onto the app, from the page (a real drag cannot be made)
const drop = (page, files) =>
  page.evaluate((files) => {
    const transfer = new DataTransfer();
    for (const { name, type, text, base64 } of files) {
      const body = base64
        ? Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
        : text;
      transfer.items.add(new File([body], name, { type }));
    }
    document.getElementById("dropzone").dispatchEvent(
      new DragEvent("drop", {
        dataTransfer: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, files);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
    delete window.showSaveFilePicker;
  });
});

test("dropping an image with no game open shows an error", async ({ page }) => {
  await page.goto("/");

  await drop(page, [{ name: "snow.svg", type: "image/svg+xml", text: SVG }]);

  await expect(page.getByText(/Open or create a game first/)).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("dropping images on a copy of a game adds them and they show in the browser storage", async ({
  page,
}) => {
  await page.goto("/games/18Test");
  await page.getByRole("button", { name: "Save as..." }).click();
  const save = page.getByRole("dialog", { name: "Save as" });
  await save.getByLabel("File name").fill("drop copy");
  await save.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("game-internal:drop copy")).toBeVisible();

  await drop(page, [
    { name: "snow.svg", type: "image/svg+xml", text: SVG },
    { name: "wagon.png", type: "image/png", base64: PNG },
  ]);

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Name")).toHaveValue("snow");
  await expect(dialog.getByRole("button", { name: "Add" })).toBeDisabled();
  await dialog.getByRole("radio", { name: "Icon" }).check();
  await dialog.getByRole("button", { name: "Add" }).click();

  const alert = page.getByText("Icon custom/snow");
  await expect(alert).toBeVisible();
  await expect(page.getByText("Train image custom/wagon")).toBeVisible();

  // Kept in the browser storage
  await page.reload();
  await expect(page.getByTestId("game-internal:drop copy")).toBeVisible();

  // Forget the copy so the storage is clean for the next run
  await page.goto("/games/internal:drop copy");
  await page.getByRole("button", { name: "Forget" }).click();
  await expect(page).toHaveURL(/\/games\/?$/);
});
