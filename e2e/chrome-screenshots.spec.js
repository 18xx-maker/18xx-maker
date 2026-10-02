import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

// Visual regression for the app chrome (nav, drawers, buttons, home, docs). It
// guards the UI overhaul: the chrome keeps its look, print output is covered
// separately by tests/snapshots.test.jsx.
//
// Pixels are only stable on one OS and Chromium build, so this runs on Linux
// only (the CI e2e job), with the Chromium that the pinned @playwright/test
// version installs. It also skips when there is no committed baseline for a
// page, so the suite never fails just because baselines were not generated yet.
// Baselines live next to this file in chrome-screenshots.spec.js-snapshots/
// and must NEVER be generated on macOS or Windows.
//
// To generate or intentionally update them, run the "Update Chrome Baselines"
// workflow (.github/workflows/e2e-baselines.yml, workflow_dispatch) on the
// branch, download the `chrome-baselines` artifact and commit the png files
// into e2e/chrome-screenshots.spec.js-snapshots/. Or, on Linux with the CI
// Playwright version installed:
//
//   pnpm build && pnpm exec playwright test e2e/chrome-screenshots.spec.js --update-snapshots=all
//
// Review the image diffs in the pull request: regenerate once per intended
// visual change only.

test.skip(
  process.platform !== "linux",
  "chrome screenshots are only stable on Linux",
);

test.use({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce",
  colorScheme: "light",
});

const baselines = path.join(
  import.meta.dirname,
  "chrome-screenshots.spec.js-snapshots",
);

const pages = [
  { name: "home", url: "/", ready: (page) => page.getByTestId("home") },
  {
    name: "games-list",
    url: "/games/",
    ready: (page) => page.getByTestId("games"),
  },
  {
    name: "game-map",
    url: "/games/18Test/map",
    ready: (page) => page.getByTestId("game-18Test-map"),
  },
  {
    name: "config-drawer",
    url: "/games/18Test/map?config=true",
    ready: (page) => page.getByRole("button", { name: "Close Config" }),
  },
  {
    name: "docs",
    url: "/docs",
    ready: (page) => page.locator("[data-testid^='docs-']"),
  },
];

for (const { name, url, ready } of pages) {
  test(`chrome looks the same: ${name}`, async ({ page }) => {
    const baseline = path.join(baselines, `${name}-chromium-linux.png`);
    const missing =
      !fs.existsSync(baseline) && test.info().config.updateSnapshots !== "all";
    if (missing) {
      test.info().annotations.push({
        type: "warning",
        description: `NO BASELINE for ${name}: this screenshot gate checks nothing`,
      });
      console.warn(
        `WARNING: no chrome screenshot baseline for ${name}, skipped`,
      );
    }
    test.skip(missing, `no baseline for ${name} yet (see the header)`);

    await page.goto(url);
    await expect(ready(page)).toBeVisible();
    // Wait for the drawer and page transitions to finish
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished)),
    );

    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.005,
      // Ripples are time dependent
      mask: [page.locator(".MuiTouchRipple-root")],
    });
  });
}
