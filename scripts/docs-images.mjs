// Regenerates the screenshots used by the docs in public/images from the built
// site (`vite preview` of dist/site). Run by hand when the UI or the print
// output changes, the PNGs are committed (pixels are only stable on one OS and
// Chromium build, so nothing diffs them in CI).
//
//   pnpm build
//   pnpm docs:images [file ...]     # only the named images, default all
import { spawn } from "node:child_process";

import { chromium } from "playwright";

const PORT = 4319;
const light = { colorScheme: "light", locale: "en-US" };

// file: name in public/images, route: page to open, selector: element to wait
// for, clip: part of the page to capture (default: the element), scale: device
// scale
const images = [
  {
    file: "export-button.png",
    route: "/#/games/18Test/map",
    selector: "div.fixed.top-4.left-4",
    // the export button only exists in the app: fake its agent and its api
    app: true,
    scale: 2,
  },
  {
    file: "borders-example.png",
    route: "/games/1867/map?print=true",
    selector: "[data-testid=game-1867-map]",
    clip: { x: 280, y: 670, width: 360, height: 330 },
  },
  {
    file: "tokens-example.png",
    route: "/games/18Test/tokens?print=true",
    selector: "[data-testid=game-18Test-tokens]",
    clip: { x: 316, y: 6, width: 300, height: 100 },
    // the labels are drawn over the page, x is the center of each token
    labels: [
      { text: "Market", x: 354 },
      { text: "Back", x: 411 },
      { text: "Station", x: 469 },
    ],
    scale: 2,
  },
];

const only = process.argv.slice(2);
const server = spawn(
  "pnpm",
  ["exec", "vite", "preview", "--port", PORT, "--strictPort", "--no-open"],
  { stdio: "ignore" },
);
const browser = await chromium.launch();
try {
  for (let i = 0; i < 50; i++) {
    if (
      await fetch(`http://localhost:${PORT}`).then(
        (r) => r.ok,
        () => false,
      )
    )
      break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  for (const {
    file,
    route,
    selector,
    clip,
    app,
    labels,
    scale = 1,
  } of images) {
    if (only.length && !only.includes(file)) continue;
    const context = await browser.newContext({
      ...light,
      ...(app ? { userAgent: "Mozilla/5.0 Chrome/140 Electron/38" } : {}),
      deviceScaleFactor: scale,
      viewport: { width: 1400, height: 1000 },
    });
    const page = await context.newPage();
    if (app) {
      await page.addInitScript(() => {
        window.api = new Proxy(
          {},
          {
            get: (_, name) =>
              name === "renderInput"
                ? undefined
                : name === "loadPlatformAndVersions"
                  ? () => ({ platform: "darwin", versions: {} })
                  : () => () => {},
          },
        );
      });
    }
    await page.goto(`http://localhost:${PORT}${route}`);
    const element = page.locator(selector).first();
    await element.waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (labels)
      await page.evaluate((labels) => {
        // the next row of tokens overlaps the bottom of this one
        for (const token of document.querySelectorAll(
          "[data-testid=game-18Test-tokens] g:has(> circle)",
        ))
          if (token.getBoundingClientRect().y > 90)
            token.style.visibility = "hidden";
        for (const { text, x } of labels) {
          const label = document.createElement("div");
          label.textContent = text;
          label.style.cssText = `position:absolute;z-index:99;top:10px;left:${x}px;transform:translateX(-50%);padding:1px 8px;border-radius:999px;background:#7c22d9;color:#fff;font:bold 10px sans-serif;`;
          const arrow = document.createElement("div");
          arrow.style.cssText = `position:absolute;z-index:99;top:28px;left:${x - 6}px;border:6px solid transparent;border-top:9px solid #7c22d9;`;
          document.body.append(label, arrow);
        }
      }, labels);
    const path = `public/images/${file}`;
    await (clip
      ? page.screenshot({ path, clip })
      : element.screenshot({ path }));
    await context.close();
    console.log(path);
  }
} finally {
  await browser.close();
  server.kill();
}
