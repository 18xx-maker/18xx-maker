import { expect, test } from "@playwright/test";

test("config changes persist across a reload and show on the page", async ({
  page,
}) => {
  await page.goto("/games/18Test/charters?config=true&section=charters");
  await expect(page.getByTestId("game-18Test-charters")).toBeVisible();

  const layout = page.getByRole("combobox", { name: /Charter Layout/ });
  await layout.click();
  await page.getByRole("option", { name: "3x1", exact: true }).click();
  await expect(layout).toHaveText("3x1");
  await expect(page.getByTestId("game-18Test-charters")).toHaveAttribute(
    "data-layout",
    "3x1",
  );
  // 3x1 puts three charters on a page, the default layout two
  await expect(page.getByTestId("game-18Test-charters")).toHaveAttribute(
    "data-per-page",
    "3",
  );

  // Only the difference from the defaults is stored
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("config"))))
    .toEqual({ charters: { layout: "3x1" } });

  // A fresh load with no config in the url still uses the stored config
  await page.goto("/games/18Test/charters?config=true&section=charters");
  await expect(page.getByTestId("game-18Test-charters")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: /Charter Layout/ }),
  ).toHaveText("3x1");
  await expect(page.getByTestId("game-18Test-charters")).toHaveAttribute(
    "data-layout",
    "3x1",
  );
  // 3x1 puts three charters on a page, the default layout two
  await expect(page.getByTestId("game-18Test-charters")).toHaveAttribute(
    "data-per-page",
    "3",
  );

  // And the reset in the drawer's data section clears it again
  await page.getByRole("combobox", { name: "Config Section" }).click();
  await page.getByRole("option", { name: "Data" }).click();
  await page.getByRole("button", { name: "Reset To Defaults" }).click();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("config"))))
    .toEqual({});
  await expect(page.getByTestId("game-18Test-charters")).toHaveAttribute(
    "data-per-page",
    "2",
  );
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

test("the toolbar warns about a game config that is off until it is allowed", async ({
  page,
}) => {
  await page.goto("/games/18Test/map");
  const icon = page.getByTestId("game-config-ignored");
  await expect(icon).toBeVisible();

  // The icon has no accessibility violations
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const results = await new AxeBuilder({ page })
    .include('[data-testid="game-config-ignored"]')
    .analyze();
  expect(results.violations).toEqual([]);

  await icon.click();
  await expect(page).toHaveURL(/section=data/);
  await page.getByRole("checkbox", { name: "Allow game config" }).click();
  await expect(icon).toHaveCount(0);

  // Only the setting is stored, not the config of the game
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("config"))))
    .toEqual({ allowGameConfig: true });
});
