// Compares how the export is captured: Playwright's own calls (page.pdf,
// setViewportSize and screenshot) against the shared Chrome DevTools Protocol
// capture (src/export/capture.js), on one game of the built site.
//
//   pnpm build
//   node scripts/export-golden.mjs [game=18Test] [--keep dir]
//
// b18 images must be identical pixel for pixel, pdfs must have the same page
// count and page sizes (and, with pdftoppm installed, the same pages as
// images). Run it on Linux: fonts and Chromium builds make pixels comparable
// on one OS only. Exits 1 on any difference.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inflateSync } from "node:zlib";

import { chromium } from "playwright";

import { loadExportData, loadGameConfig } from "#cli/export";
import { loadGame, startExpress } from "#cli/util";
import { capture } from "#export/capture";
import { documents } from "#export/documents";
import { docPath, exportJobs } from "#export/names";
import { renderGame, renderSlug } from "#export/render";

const args = process.argv.slice(2);
const keepAt = args.indexOf("--keep");
const keep = keepAt >= 0 ? args.splice(keepAt, 2)[1] : null;
const id = args[0] || "18Test";

// A png as { width, height, data } of 8 bit rgb or rgba pixels
const decodePng = (png) => {
  let width, height, channels;
  const idat = [];
  for (let at = 8; at < png.length;) {
    const length = png.readUInt32BE(at);
    const type = png.toString("latin1", at + 4, at + 8);
    const data = png.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || ![2, 6].includes(data[9]) || data[12] !== 0) {
        throw new Error("Only 8 bit rgb and rgba pngs are compared");
      }
      channels = data[9] === 6 ? 4 : 3;
    }
    if (type === "IDAT") idat.push(data);
    at += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= channels ? out[y * stride + x - channels] : 0;
      const up = y ? out[(y - 1) * stride + x] : 0;
      const upLeft =
        y && x >= channels ? out[(y - 1) * stride + x - channels] : 0;
      const p = left + up - upLeft;
      const [pa, pb, pc] = [left, up, upLeft].map((v) => Math.abs(p - v));
      const paeth = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      out[y * stride + x] =
        (value + [0, left, up, (left + up) >> 1, paeth][filter]) & 255;
    }
  }
  return { width, height, channels, data: out };
};

// The number of pixels that differ, or null when the sizes are not equal
const diffPixels = (a, b) => {
  const [x, y] = [decodePng(a), decodePng(b)];
  if (x.width !== y.width || x.height !== y.height) return null;
  let count = 0;
  for (let i = 0; i < x.data.length; i += x.channels) {
    for (let c = 0; c < x.channels; c++) {
      if (x.data[i + c] !== y.data[i + c]) {
        count++;
        break;
      }
    }
  }
  return count;
};

// The sizes of the pages of a pdf, one entry for each page
const pdfPages = (pdf) => {
  const text = Buffer.from(pdf).toString("latin1");
  const count = [...text.matchAll(/\/Type\s*\/Page\b(?!s)/g)].length;
  const sizes = [...text.matchAll(/\/MediaBox\s*\[([^\]]*)\]/g)].map((match) =>
    match[1]
      .trim()
      .split(/\s+/)
      .map((n) => Math.round(Number(n)))
      .join(" "),
  );
  return sizes.length === count
    ? sizes
    : [`${count} pages, ${sizes.length} sizes`];
};

const pdfImages = (pdf, dir, name) => {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.pdf`);
  fs.writeFileSync(file, pdf);
  execFileSync("pdftoppm", ["-r", "50", "-png", file, path.join(dir, name)]);
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(`${name}-`) && f.endsWith(".png"))
    .sort()
    .map((f) => fs.readFileSync(path.join(dir, f)));
};

const hasPdftoppm = (() => {
  try {
    execFileSync("pdftoppm", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

const game = loadGame(id);
const config = loadGameConfig(game);
const data = loadExportData();
const server = startExpress(0);
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ args: ["--force-color-profile=srgb"] });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-golden-"));
const results = [];

// The documents of the site as it is today (the game of the build) and of
// render mode (the game is given to the page)
const plain = documents(game, config, { ...data, slug: id });
const injected = documents(game, config, { ...data, slug: renderSlug(id) });
const jobsOf = (docs) => exportJobs(game, docs, ["pdf", "b18"]);

const newPage = async (inject) => {
  const page = await browser.newPage();
  if (inject) {
    await page.addInitScript((input) => (window.__RENDER_INPUT__ = input), {
      id,
      game: renderGame(game, id),
      config: {},
    });
  }
  return page;
};

const open = async (page, doc, inject) => {
  await page.goto(`${base}${docPath(doc)}`, { waitUntil: "networkidle" });
  if (inject) {
    await page.waitForFunction(() => document.body.dataset.renderState);
  }
};

// What the CLI does today
const native = async (page, { doc, format }) => {
  if (format === "pdf") {
    return page.pdf({ scale: 1.0, preferCSSPageSize: true });
  }
  await page.emulateMedia({ media: "print" });
  await page.setViewportSize({
    width: doc.capture.viewport.w,
    height: doc.capture.viewport.h,
  });
  return page.screenshot({ omitBackground: true });
};

const record = (name, ok, detail) => {
  results.push({ name, ok });
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` ${detail}` : ""}`);
};

for (const inject of [false, true]) {
  const label = inject ? "render mode" : "plain page";
  const page = await newPage(inject);
  const session = await page.context().newCDPSession(page);
  const adapter = {
    send: (method, params) => session.send(method, params),
    evaluate: (expression) => page.evaluate(expression),
  };

  const jobs = jobsOf(inject ? injected : plain);
  const baseline = jobsOf(plain);
  const fresh = await newPage(false);
  for (const [i, job] of jobs.entries()) {
    const name = `${label} ${job.path}`;
    const old = baseline[i];
    // Fresh page for the baseline every time: Playwright's viewport size
    // sticks to the page
    await open(fresh, old.doc, false);
    const before = await native(fresh, old);
    await open(page, job.doc, inject);
    const after = await capture(adapter, job);

    if (job.format === "b18") {
      const diff = diffPixels(Buffer.from(before), Buffer.from(after));
      record(
        name,
        diff === 0,
        diff === null ? "size differs" : `${diff} pixels differ`,
      );
      if (keep && diff !== 0) {
        fs.mkdirSync(keep, { recursive: true });
        fs.writeFileSync(
          path.join(keep, `before-${path.basename(job.path)}`),
          before,
        );
        fs.writeFileSync(
          path.join(keep, `after-${path.basename(job.path)}`),
          after,
        );
      }
    } else {
      const [a, b] = [pdfPages(before), pdfPages(after)];
      let ok = a.length > 0 && JSON.stringify(a) === JSON.stringify(b);
      let detail = `${a.length} pages`;
      if (!ok) detail = `pages ${a.length} vs ${b.length}: ${a} / ${b}`;
      if (ok && hasPdftoppm) {
        const [x, y] = [
          pdfImages(
            before,
            path.join(tmp, "before"),
            path.basename(job.path, ".pdf"),
          ),
          pdfImages(
            after,
            path.join(tmp, "after"),
            path.basename(job.path, ".pdf"),
          ),
        ];
        const worst = x.map((image, n) => diffPixels(image, y[n]));
        const total = Math.max(...worst, 0);
        ok = x.length === y.length && !worst.includes(null);
        detail += `, ${total} pixels differ most on a page`;
      }
      record(name, ok, detail);
      if (keep) {
        fs.mkdirSync(keep, { recursive: true });
        fs.writeFileSync(
          path.join(keep, `before-${path.basename(job.path)}`),
          before,
        );
        fs.writeFileSync(
          path.join(keep, `after-${path.basename(job.path)}`),
          after,
        );
      }
    }
  }
  await page.close();
  await fresh.close();
}

await browser.close();
server.close();
fs.rmSync(tmp, { recursive: true, force: true });

const failed = results.filter(({ ok }) => !ok).length;
console.log(`\n${results.length - failed} of ${results.length} match`);
process.exitCode = failed ? 1 : 0;
