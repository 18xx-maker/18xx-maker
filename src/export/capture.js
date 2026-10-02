import { withResolution } from "./png.js";

// Captures a document from a page of the site with Chrome DevTools Protocol
// commands, the same ones in every browser adapter (Playwright in the CLI).
// An adapter is
//   send(method, params)  sends a command and returns its result
//   evaluate(expression)  evaluates a javascript expression in the page
// Plain JS: no Node APIs, no DOM.

// CSS pixels per inch, and the most dots per inch (and pixels in an image) a
// png is captured with
export const CSS_DPI = 96;
export const MAX_DPI = 300;
export const MAX_PIXELS = 200_000_000;

// How many CSS pixels a rounded up element can be over its real size before it
// is a pixel more: sizes like 240.0000001 are 240
const EPSILON = 1e-3;

// Chromium refuses fractional sizes and truncates a clip, so sizes are rounded
// up to whole CSS pixels
const ceil = (size) => Math.max(1, Math.ceil(size - EPSILON));

const decode = (base64) =>
  Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

const concat = (parts) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

// Rejects when a promise takes longer than ms
export const withTimeout = (promise, ms, message) => {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
};

// Throws when an image of this size has too many pixels
export const checkPixels = (width, height, maxPixels = MAX_PIXELS) => {
  if (width * height > maxPixels) {
    throw new Error(
      `${width} x ${height} pixels is ${Math.round((width * height) / 1e6)} ` +
        `megapixels, more than the limit of ${Math.round(maxPixels / 1e6)}, ` +
        `use a lower --dpi`,
    );
  }
};

// The pixel size of an image of an element of a size in CSS pixels at a
// resolution: the size is rounded up to whole CSS pixels first
export const imageSize = ({ width, height }, dpi) => {
  const scale = dpi / CSS_DPI;
  return {
    width: Math.round(ceil(width) * scale),
    height: Math.round(ceil(height) * scale),
  };
};

const printToPdf = async ({ send }) => {
  const { stream } = await send("Page.printToPDF", {
    preferCSSPageSize: true,
    printBackground: true,
    displayHeaderFooter: false,
    scale: 1,
    transferMode: "ReturnAsStream",
  });

  const parts = [];
  for (;;) {
    const { data, base64Encoded, eof } = await send("IO.read", {
      handle: stream,
    });
    parts.push(base64Encoded ? decode(data) : new TextEncoder().encode(data));
    if (eof) break;
  }
  await send("IO.close", { handle: stream });
  return concat(parts);
};

const screenshot = async ({ send }, clip) => {
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    ...(clip && { captureBeyondViewport: true, clip }),
  });
  return decode(data);
};

// A b18 image: the viewport is the size of the image, at one pixel per unit
const captureViewport = async (adapter, { viewport }, maxPixels) => {
  checkPixels(viewport.w, viewport.h, maxPixels);
  await adapter.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.w,
    height: viewport.h,
    deviceScaleFactor: 1,
    mobile: false,
  });
  return screenshot(adapter);
};

// An element of the page at a resolution, with the resolution in the file
const captureElement = async (adapter, { selector }, dpi, maxPixels) => {
  const rect = await adapter.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const { left, top, width, height } = element.getBoundingClientRect();
    return { x: left + scrollX, y: top + scrollY, width, height };
  })()`);
  if (!rect) throw new Error(`The page has no ${selector}`);

  const css = { width: ceil(rect.width), height: ceil(rect.height) };
  const size = imageSize(rect, dpi);
  checkPixels(size.width, size.height, maxPixels);

  await adapter.send("Emulation.setDeviceMetricsOverride", {
    width: Math.ceil(rect.x) + css.width,
    height: Math.ceil(rect.y) + css.height,
    deviceScaleFactor: dpi / CSS_DPI,
    mobile: false,
  });
  const png = await screenshot(adapter, {
    x: rect.x,
    y: rect.y,
    ...css,
    scale: 1,
  });
  return withResolution(png, dpi);
};

// Captures a file of an export list ({ doc, format }, see exportJobs) from the
// page the adapter has open, and returns its bytes:
//   pdf  the page printed on the paper of its css
//   png  the element of the document, at dpi (at most MAX_DPI)
//   b18  a screenshot of a viewport the size of the image
// The media is always print, and the page is left as it was found: the device
// size and the background are reset.
export const capture = async (
  adapter,
  { doc, format },
  { dpi = MAX_DPI, maxPixels = MAX_PIXELS } = {},
) => {
  if (!(dpi >= 1 && dpi <= MAX_DPI)) {
    throw new Error(`The resolution must be 1 to ${MAX_DPI} dpi`);
  }

  await adapter.send("Emulation.setEmulatedMedia", { media: "print" });
  if (format === "pdf") return printToPdf(adapter);

  try {
    if (doc.capture.transparent) {
      await adapter.send("Emulation.setDefaultBackgroundColorOverride", {
        color: { r: 0, g: 0, b: 0, a: 0 },
      });
    }
    return format === "png"
      ? await captureElement(adapter, doc.capture, dpi, maxPixels)
      : await captureViewport(adapter, doc.capture, maxPixels);
  } finally {
    await adapter.send("Emulation.clearDeviceMetricsOverride");
    await adapter.send("Emulation.setDefaultBackgroundColorOverride");
  }
};
