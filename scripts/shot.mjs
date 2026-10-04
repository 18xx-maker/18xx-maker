// Renders one print page (or an element of it) from a built site to a PNG, so
// a visual change can be looked at instead of guessed at. Snapshots and tests
// cannot see spacing, centering or stroke widths.
//
//   pnpm build
//   pnpm shot <game> <page> [options]
//
//   --sel <css>       capture this element inside the page (default: the page)
//   --clip x,y,w,h    capture this part of the page (CSS pixels from its corner)
//   --scale <n>       device scale, default 4 (zoomed in on details)
//   --name <text>     suffix of the file name
//   --route <path>    open this route instead of /games/<game>/<page>?print=true
//   --out <dir>       output folder, default shots/ (ignored by git)
//   --dist <dir>      site to render, default dist/site
//   --vs <dir>        also render this site (a build of main, for example) and
//                     write a before/after image with both side by side
//
// The page is <game>/<page>, e.g. `pnpm shot 18Test tokens --sel "g:has(> circle)"`.
// Print output is rendered with the en-US locale and the same fonts as the
// docs images, so shots are comparable on one machine, not across machines.
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";

import { chromium } from "playwright";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    sel: { type: "string" },
    clip: { type: "string" },
    scale: { type: "string", default: "4" },
    name: { type: "string" },
    route: { type: "string" },
    out: { type: "string", default: "shots" },
    dist: { type: "string", default: "dist/site" },
    vs: { type: "string" },
  },
});
const [game, page] = positionals;
if (!game || !page) {
  console.error(
    "usage: pnpm shot <game> <page> [options], see scripts/shot.mjs",
  );
  process.exit(1);
}

const route = values.route ?? `/games/${game}/${page}?print=true`;
const testid = `[data-testid^=game-${game}-${page}]`;
const scale = Number(values.scale);
const clip = values.clip && values.clip.split(",").map(Number);
const base = `${game}-${page}${values.name ? `-${values.name}` : ""}`;

const serve = (dist, port) =>
  spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "preview",
      "--outDir",
      dist,
      "--port",
      port,
      "--strictPort",
      "--no-open",
    ],
    { stdio: "ignore" },
  );

const waitFor = async (port) => {
  for (let i = 0; i < 50; i++) {
    if (
      await fetch(`http://localhost:${port}`).then(
        (r) => r.ok,
        () => false,
      )
    )
      return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`nothing is serving on port ${port}`);
};

const render = async (browser, port) => {
  const context = await browser.newContext({
    colorScheme: "light",
    locale: "en-US",
    deviceScaleFactor: scale,
    viewport: { width: 1400, height: 1000 },
  });
  try {
    const tab = await context.newPage();
    await tab.goto(`http://localhost:${port}${route}`);
    const root = tab.locator(testid).first();
    await root.waitFor();
    await tab.evaluate(() => document.fonts.ready);
    if (clip) {
      const box = await root.boundingBox();
      const [x, y, width, height] = clip;
      return await tab.screenshot({
        clip: { x: box.x + x, y: box.y + y, width, height },
      });
    }
    const element = values.sel ? root.locator(values.sel).first() : root;
    await element.waitFor();
    return await element.screenshot();
  } finally {
    await context.close();
  }
};

const servers = [serve(values.dist, 4320)];
if (values.vs) servers.push(serve(values.vs, 4321));
const browser = await chromium.launch();
try {
  await mkdir(values.out, { recursive: true });
  await waitFor(4320);
  const after = await render(browser, 4320);
  const path = `${values.out}/${base}.png`;
  await writeFile(path, after);
  console.log(path);

  if (values.vs) {
    await waitFor(4321);
    const before = await render(browser, 4321);
    const beforePath = `${values.out}/${base}-before.png`;
    await writeFile(beforePath, before);
    console.log(beforePath);

    const compare = await browser.newPage({
      viewport: { width: 1400, height: 1000 },
    });
    const src = (png) => `data:image/png;base64,${png.toString("base64")}`;
    await compare.setContent(`
      <body style="margin:0;padding:16px;background:#fff;font:bold 14px sans-serif;display:flex;gap:24px;align-items:flex-start;width:max-content">
        <figure style="margin:0"><figcaption>before</figcaption><img src="${src(before)}" style="outline:1px solid #ccc"></figure>
        <figure style="margin:0"><figcaption>after</figcaption><img src="${src(after)}" style="outline:1px solid #ccc"></figure>
      </body>`);
    await compare.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    const comparePath = `${values.out}/${base}-compare.png`;
    await compare.screenshot({ path: comparePath, fullPage: true });
    console.log(comparePath);
  }
} finally {
  await browser.close();
  for (const server of servers) server.kill();
}
