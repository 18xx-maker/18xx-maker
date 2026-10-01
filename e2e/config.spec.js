const { expect, test } = require("@playwright/test");

test("config changes persist across a reload and show on the page", async ({
  page,
}) => {
  await page.goto("/games/18Test/charters?config=true");
  await expect(page.getByTestId("game-18Test-charters")).toBeVisible();

  const layout = page.getByRole("combobox", { name: /Charter Layout/ });
  await layout.click();
  await page.getByRole("option", { name: "3x1", exact: true }).click();
  await expect(layout).toHaveText("3x1");

  // Only the difference from the defaults is stored
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("config"))))
    .toEqual({ charters: { layout: "3x1" } });

  // A fresh load with no config in the url still uses the stored config
  await page.goto("/games/18Test/charters?config=true");
  await expect(page.getByTestId("game-18Test-charters")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: /Charter Layout/ }),
  ).toHaveText("3x1");

  // And the drawer's reset clears it again
  await page.getByRole("button", { name: "Reset To Defaults" }).click();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("config"))))
    .toEqual({});
});

test("the config drawer opens and closes, reflected in the url", async ({
  page,
}) => {
  await page.goto("/games/18Test/map");
  await page.getByRole("button", { name: "config" }).click();
  await expect(page).toHaveURL(/config=true/);
  await page.getByRole("button", { name: "Close Config" }).click();
  await expect(page).not.toHaveURL(/config=true/);
});
