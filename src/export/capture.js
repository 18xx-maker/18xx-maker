import { cropPng, withResolution } from "./png.js";

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

// How far an edge can be off a whole pixel and still be on it, in pixels: an
// edge at 796.9999999 is at 797
const EPSILON = 1e-3;

// The whole pixels from start to end on a grid of ratio pixels a CSS pixel
// (and 0, not -0)
const inside = (start, end, ratio) => [
  Math.ceil(start * ratio - EPSILON) || 0,
  Math.floor(end * ratio + EPSILON),
];

// The device pixels of an image at a scale that an element of the page
// ({ x, y, width, height } in CSS pixels) covers whole: { left, top, width,
// height }.
// Chromium paints a box on the pixel grid of the page (ratio, its
// devicePixelRatio before the capture: 1 in the CLI and the offscreen windows
// of the app) and only then scales it by the emulated device scale of the
// capture (dpi / 96). A card of 255.109 CSS pixels is painted 255 wide, to
// 796.875 device pixels at 300 dpi, and the pixel it partly covers is
// antialiased: partly transparent (dark on a dark background), or blended
// into white. The image only has the pixels inside both the element and the
// box it is painted in, so it has no such edge.
const devicePixels = ({ x = 0, y = 0, width, height }, scale, ratio = 1) => {
  const pixels = (start, end) => {
    const [first, last] = inside(start, end, ratio);
    return inside(
      Math.max(start, first / ratio),
      Math.min(end, last / ratio),
      scale,
    );
  };
  const [left, right] = pixels(x, x + width);
  const [top, bottom] = pixels(y, y + height);
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  };
};

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

// The pixel size of an image of an element of a page ({ x, y, width, height }
// in CSS pixels) at a resolution, on a screen of ratio device pixels a CSS
// pixel: the device pixels the element covers whole (see devicePixels)
export const imageSize = (rect, dpi, ratio = 1) => {
  const { width, height } = devicePixels(rect, dpi / CSS_DPI, ratio);
  return { width, height };
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

// An element of the page at a resolution, with the resolution in the file.
// The image is the device pixels the element covers whole (see devicePixels),
// from a whole device pixel. Chromium makes a clip a whole number of CSS
// pixels (so an image of 255 CSS pixels is 797 device pixels at 300 dpi, with
// a last column that is 7/8 painted), so the clip is a little larger and the
// image is cut to its size.
const captureElement = async (adapter, { selector }, dpi, maxPixels) => {
  const rect = await adapter.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    const { left, top, width, height } = element.getBoundingClientRect();
    return {
      x: left + scrollX,
      y: top + scrollY,
      width,
      height,
      ratio: devicePixelRatio,
    };
  })()`);
  if (!rect) throw new Error(`The page has no ${selector}`);

  const scale = dpi / CSS_DPI;
  const pixels = devicePixels(rect, scale, rect.ratio);
  checkPixels(pixels.width, pixels.height, maxPixels);

  await adapter.send("Emulation.setDeviceMetricsOverride", {
    width: Math.max(1, Math.ceil(rect.x + rect.width)),
    height: Math.max(1, Math.ceil(rect.y + rect.height)),
    deviceScaleFactor: scale,
    mobile: false,
  });
  const png = await screenshot(adapter, {
    x: pixels.left / scale,
    y: pixels.top / scale,
    width: Math.ceil(pixels.width / scale),
    height: Math.ceil(pixels.height / scale),
    scale: 1,
  });
  return withResolution(await cropPng(png, pixels.width, pixels.height), dpi);
};

// Captures a file of an export list ({ doc, format }, see exportJobs) from the
// page the adapter has open, and returns its bytes:
//   pdf  the page printed on the paper of its css
//   png  the element of the document, at dpi (at most MAX_DPI)
//   b18  a screenshot of a viewport the size of the image
// The background of a png is transparent, or opaque white when background is
// "white", except for the documents with capture.transparent (tokens and
// tiles). A b18 image does not take the background: the map and the market
// are always white, the tokens and tiles always transparent.
// The media is always print, and the page is left as it was found: the device
// size and the background are reset.
export const capture = async (
  adapter,
  { doc, format },
  { dpi = MAX_DPI, maxPixels = MAX_PIXELS, background = "transparent" } = {},
) => {
  if (!(dpi >= 1 && dpi <= MAX_DPI)) {
    throw new Error(`The resolution must be 1 to ${MAX_DPI} dpi`);
  }

  await adapter.send("Emulation.setEmulatedMedia", { media: "print" });
  if (format === "pdf") return printToPdf(adapter);

  try {
    // An image is transparent where the page paints nothing, or white: without
    // the override the page is white, or the color of its color-scheme (black
    // in a dark theme). Tokens and tiles are always transparent.
    const white =
      !doc.capture.transparent && (format === "b18" || background === "white");
    await adapter.send("Emulation.setDefaultBackgroundColorOverride", {
      color: white
        ? { r: 255, g: 255, b: 255, a: 1 }
        : { r: 0, g: 0, b: 0, a: 0 },
    });
    return format === "png"
      ? await captureElement(adapter, doc.capture, dpi, maxPixels)
      : await captureViewport(adapter, doc.capture, maxPixels);
  } finally {
    await adapter.send("Emulation.clearDeviceMetricsOverride");
    await adapter.send("Emulation.setDefaultBackgroundColorOverride");
  }
};
