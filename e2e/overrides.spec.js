import { expect, test } from "@playwright/test";

// The app's own classes must win over the defaults of the src/ui primitives
// whatever order the CSS chunks load in, which only the built site shows.
test("app classes override the primitives' defaults", async ({ page }) => {
  await page.goto("/games/18Test/map?config=true");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();
  const style = (locator, property) =>
    locator.evaluate((el, p) => getComputedStyle(el)[p], property);

  // AppNav.module.css .appBar over AppBar (z-drawer + 1, not the app bar's)
  expect(await style(page.getByTestId("app-bar"), "zIndex")).toBe("1201");

  // ConfigDrawer.module.css .configToolbar over Toolbar (relative)
  const toolbar = page
    .getByRole("button", { name: "Close Config" })
    .locator("xpath=..");
  expect(await style(toolbar, "position")).toBe("sticky");

  // MobileMenuButton.module.css .menuButton hides the button from md up,
  // over IconButton's inline-flex
  expect(
    await style(
      page.getByRole("button", { name: "menu", includeHidden: true }),
      "display",
    ),
  ).toBe("none");
});
