import path from "node:path";

import { expect, test } from "@playwright/test";

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

// Required gate for the print rules in src/styles/root.css (@media print):
// the chrome is hidden and the game viewport loses its margins and width
// constraint. The print snapshots in tests/ cannot see this, because they only
// compare the markup. Only data-testid hooks are used here so the check
// survives a change of UI library.
//
// export-fab replaces print-fab in the electron app only, and side-nav-temporary
// is already display:none at this width (the md breakpoint), so a check here
// would pass for the wrong reason. Both are covered by the same print rules.
//
// A tooltip closes by itself the moment its button is hidden (the print rules
// hide both), so it cannot stay open to be checked. The test copies the open
// tooltip's markup (a static node that React cannot close) and checks the
// copy, which has the same data-chrome hook the print rule matches on.
const chrome = [
  "app-bar",
  "side-nav",
  "config-drawer",
  "print-fab",
  "tooltip-copy",
];

test("print media hides the chrome and frees the viewport", async ({
  page,
}) => {
  // Config drawer open: on screen the viewport is narrowed to make room
  await page.goto("/games/18Test/map?config=true");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();
  // Keyboard focus shows the tooltip (the open drawer covers the button)
  await page.keyboard.press("Tab");
  await page.getByTestId("print-fab").focus();
  const tooltip = page.getByTestId("tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute("data-chrome", "tooltip");
  await tooltip.evaluate((el) => {
    const copy = el.cloneNode(true);
    copy.dataset.testid = "tooltip-copy";
    document.body.appendChild(copy);
  });

  const viewport = page.getByTestId("viewport");
  const margins = () =>
    viewport.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        left: style.marginLeft,
        right: style.marginRight,
        fillsPage:
          Math.abs(
            el.getBoundingClientRect().width -
              document.documentElement.clientWidth,
          ) < 1,
      };
    });

  // Drawer roots have no box of their own, so check the computed display
  const display = (id) =>
    page.getByTestId(id).evaluate((el) => getComputedStyle(el).display);
  for (const id of chrome) {
    expect(await display(id)).not.toBe("none");
  }
  const screen = await margins();
  expect(screen.left).not.toBe("0px");
  expect(screen.right).not.toBe("0px");
  expect(screen.fillsPage).toBe(false);

  await page.emulateMedia({ media: "print" });

  for (const id of chrome) {
    await expect.poll(() => display(id)).toBe("none");
  }
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();
  expect(await margins()).toEqual({
    left: "0px",
    right: "0px",
    fillsPage: true,
  });
});

test("print media hides the alert snackbar", async ({ page }) => {
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
  });
  await page.goto("/games/");
  await page
    .getByLabel("Open File")
    .setInputFiles(path.join(import.meta.dirname, "fixtures", "e2e-game.json"));
  await expect(page.getByText("Game Loaded")).toBeVisible();
  await expect(page.getByTestId("alert")).toBeVisible();

  // The snackbar closes itself after 4 seconds. Checking the computed display
  // (not toBeHidden) fails if it is gone, instead of passing for the wrong
  // reason
  await page.emulateMedia({ media: "print" });
  expect(
    await page
      .getByTestId("alert")
      .evaluate((el) => getComputedStyle(el).display),
  ).toBe("none");
});

// The background page wraps its page in a box that scrolls on screen
test("print media frees the background page's scroll box", async ({ page }) => {
  await page.goto("/games/18Test/background");
  const box = page.locator('[data-chrome="background"]');
  const overflow = () => box.evaluate((el) => getComputedStyle(el).overflowX);
  const frame = () =>
    box.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        left: style.marginLeft,
        right: style.marginRight,
        fillsParent:
          Math.abs(
            el.getBoundingClientRect().width - el.parentElement.clientWidth,
          ) < 1,
      };
    });
  expect(await overflow()).toBe("auto");
  await page.emulateMedia({ media: "print" });
  expect(await overflow()).toBe("visible");
  expect(await frame()).toEqual({
    left: "0px",
    right: "0px",
    fillsParent: true,
  });
});
