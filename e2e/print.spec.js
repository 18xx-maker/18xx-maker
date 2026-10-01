const { expect, test } = require("@playwright/test");

// The web build shows a print button (the electron app shows the export
// button instead) that calls window.print()
test("the print button calls window.print on a game page", async ({ page }) => {
  await page.addInitScript(() => {
    window.__printCalls = 0;
    window.print = () => {
      window.__printCalls += 1;
    };
  });

  await page.goto("/games/18Test/map");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export" })).toHaveCount(0);

  await page.getByRole("button", { name: "print" }).click();
  await expect.poll(() => page.evaluate(() => window.__printCalls)).toBe(1);
});

test("there is no print button outside of a game, or in print mode", async ({
  page,
}) => {
  await page.goto("/games/");
  await expect(page.getByRole("button", { name: "print" })).toHaveCount(0);

  await page.goto("/games/18Test/map?print=true");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();
  await expect(page.getByRole("button", { name: "print" })).toHaveCount(0);
});
