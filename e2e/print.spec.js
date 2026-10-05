import { expect, test } from "@playwright/test";

import { pages } from "./export-files.js";

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

const backgrounds = (page) =>
  page.evaluate(() =>
    ["html", "body", "#viewport"].map(
      (selector) =>
        getComputedStyle(document.querySelector(selector)).backgroundColor,
    ),
  );

test("the editor prints on white in the dark theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/games/18Test/map");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();

  // On screen the body follows the dark theme
  expect((await backgrounds(page))[1]).not.toBe("rgb(255, 255, 255)");

  await page.emulateMedia({ colorScheme: "dark", media: "print" });
  expect(await backgrounds(page)).toEqual(Array(3).fill("rgb(255, 255, 255)"));
});

test("print mode pages keep a transparent background in print", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", media: "print" });
  await page.goto("/games/18Test/map?print=true");
  await expect(page.getByTestId("game-18Test-map")).toBeVisible();

  expect((await backgrounds(page))[0]).toBe("rgba(0, 0, 0, 0)");
  expect((await backgrounds(page))[1]).toBe("rgba(0, 0, 0, 0)");
});

// Plain pages sit below the toolbar on screen; none of that may reach paper.
// The editor is swapped for the plain page on beforeprint, and a leftover
// top padding pushed the map onto a second page.
const printLayout = async (page, path, testId) => {
  await page.goto(path);
  await expect(page.getByTestId(testId)).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#editor")).toHaveCount(0);
  return page.evaluate(() => {
    const style = getComputedStyle(
      document.querySelector("#viewport-children"),
    );
    return { paddingTop: style.paddingTop, display: style.display };
  });
};

test("the map prints on one page without the toolbar padding", async ({
  page,
}, testInfo) => {
  expect(
    await printLayout(page, "/games/18Test/map", "game-18Test-map"),
  ).toEqual({ paddingTop: "0px", display: "block" });
  const file = testInfo.outputPath("map.pdf");
  await page.pdf({ path: file, preferCSSPageSize: true });
  expect(pages(file)).toBe(1);
});

test("a paginated plain page prints without the toolbar padding", async ({
  page,
}) => {
  expect(
    await printLayout(page, "/games/18Test/tiles", "game-18Test-tiles"),
  ).toEqual({ paddingTop: "0px", display: "block" });
});
