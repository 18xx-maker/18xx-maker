import { expect, test } from "@playwright/test";

// Below the md breakpoint (960px) the side nav is a modal drawer: a backdrop,
// focus kept inside, Escape and a click on the backdrop close it.
test.use({ viewport: { width: 500, height: 800 } });

test("the side nav drawer opens from the menu button and closes with Escape", async ({
  page,
}) => {
  await page.goto("/games/18Test/map");
  const nav = page.getByTestId("side-nav-temporary");
  await expect(nav).toBeHidden();

  await page.getByRole("button", { name: "menu" }).click();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: /18Test/ }).first()).toBeVisible();

  // Focus is trapped in the drawer
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () =>
        !!document.activeElement.closest("[data-testid=side-nav-temporary]"),
    ),
  ).toBe(true);

  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
});

test("the side nav drawer closes with a click on the backdrop, not on the panel", async ({
  page,
}) => {
  await page.goto("/games/18Test/map");
  const nav = page.getByTestId("side-nav-temporary");
  await page.getByRole("button", { name: "menu" }).click();
  await expect(nav).toBeVisible();

  // Text inside the panel (not a link)
  await nav.getByText("Work in progress").click();
  await expect(nav).toBeVisible();

  await page.mouse.click(450, 600);
  await expect(nav).toBeHidden();
});

test("keyboard shortcuts work while the drawer is open", async ({ page }) => {
  await page.goto("/games/18Test/map");
  await page.getByRole("button", { name: "menu" }).click();
  await expect(page.getByTestId("side-nav-temporary")).toBeVisible();

  // "l" goes to the games list (see useBindings)
  await page.keyboard.press("l");
  await expect(page).toHaveURL(/\/games\/$/);
});

test("the config drawer is reachable only while it is open", async ({
  page,
}) => {
  // Wide: on a phone the "Game Loaded" alert covers the button for 4 seconds
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/games/18Test/map");
  const drawer = page.getByTestId("config-drawer");
  await expect(
    drawer.getByRole("button", { name: "Close Config" }),
  ).toBeHidden();

  await page.getByRole("button", { name: "config" }).click();
  await expect(
    drawer.getByRole("button", { name: "Close Config" }),
  ).toBeVisible();

  await drawer.getByRole("button", { name: "Close Config" }).click();
  await expect(
    drawer.getByRole("button", { name: "Close Config" }),
  ).toBeHidden();
});
