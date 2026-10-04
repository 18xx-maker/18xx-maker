import fs from "node:fs";
import zlib from "node:zlib";

import { decodePng } from "../src/export/__fixtures__/png.js";
import { readPng } from "../src/export/png.js";

// Helpers to read the real files of an export, the same on every OS

export const png = (file) => readPng(new Uint8Array(fs.readFileSync(file)));

// The pixels ([r, g, b, a]) on each edge of a png: { top, bottom, left,
// right }, from the top left
export const edges = (file) => {
  const { width, height, channels, pixels } = decodePng(fs.readFileSync(file));
  const pixel = (x, y) => {
    const at = (y * width + x) * channels;
    if (channels === 1) return [pixels[at], pixels[at], pixels[at], 255];
    return [
      ...pixels.subarray(at, at + 3),
      channels === 4 ? pixels[at + 3] : 255,
    ];
  };
  const line = (count, at) => Array.from({ length: count }, (_, i) => at(i));
  return {
    top: line(width, (x) => pixel(x, 0)),
    bottom: line(width, (x) => pixel(x, height - 1)),
    left: line(height, (y) => pixel(0, y)),
    right: line(height, (y) => pixel(width - 1, y)),
  };
};

// The lowest alpha on each edge of a png, 255 when every pixel is opaque
export const edgeAlpha = (file) =>
  Object.fromEntries(
    Object.entries(edges(file)).map(([side, line]) => [
      side,
      Math.min(...line.map(([, , , alpha]) => alpha)),
    ]),
  );

// The colors ("r,g,b,a") of the pixels on the edges of a png
export const edgeColors = (file) => [
  ...new Set(
    Object.values(edges(file)).flatMap((line) =>
      line.map((pixel) => pixel.join(",")),
    ),
  ),
];

export const OPAQUE = { top: 255, bottom: 255, left: 255, right: 255 };

export const pages = (file) =>
  [
    ...fs
      .readFileSync(file)
      .toString("latin1")
      .matchAll(/\/Type\s*\/Page\b(?!s)/g),
  ].length;

// The files of a zip by name, read from its central directory (the names are
// always the forward slash ones of the zip format, on every OS)
export const unzip = (file) => {
  const zip = fs.readFileSync(file);
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = zip.readUInt16LE(end + 10);
  const files = {};
  for (let at = zip.readUInt32LE(end + 16), i = 0; i < count; i++) {
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const extraLength = zip.readUInt16LE(at + 30);
    const commentLength = zip.readUInt16LE(at + 32);
    const local = zip.readUInt32LE(at + 42);
    const name = zip.toString("utf-8", at + 46, at + 46 + nameLength);
    const start =
      local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const data = zip.subarray(start, start + size);
    files[name] = method === 8 ? zlib.inflateRawSync(data) : data;
    at += 46 + nameLength + extraLength + commentLength;
  }
  return files;
};

// The one fixed set every export path writes for 18Test, and what is in it.
// The sizes are in pixels and come from the game, not from the fonts of the
// system, so they are the same on Linux, macOS and Windows.
export const expected = {
  pdf: { file: "18test-map.pdf", pages: 1 },
  png: {
    file: "18test-background.png",
    // 8 by 10.5 inches at 300 dpi, with its resolution of 11811 pixels/meter
    size: { width: 2400, height: 3150, pixelsPerMeter: 11811 },
    // The map and the market at their size in print, whatever the size of
    // the window they are captured in
    images: {
      "18test-map.png": { width: 4500, height: 1356 },
      "18test-market.png": { width: 4168, height: 3115 },
    },
    // The cards, 2.657 by 1.732 inches (255.11 by 166.3 CSS pixels): the
    // device pixels the card is painted on whole, 255 by 166 CSS pixels
    cards: { count: 48, width: 796, height: 518 },
  },
  // The svgs of the map, market, tiles and tokens: their size in CSS pixels
  // (1/96 inch), which is the size of the drawing in units (the viewBox of
  // the map is 1450 by 403.10875, the market 1340 by 985) at 0.96 pixels a
  // unit, with no border: it comes from the game, not from the fonts
  svg: {
    sizes: {
      "18test-map.svg": [1392, 386.984],
      "18test-market.svg": [1286.4, 945.6],
      // A tile is 2 inches, a token with its four sides 2.4 by 0.6
      "18test-tile-1.svg": [192, 192],
      "18test-token-1-BLRR.svg": [230.4, 57.6],
    },
  },
  b18: {
    zip: "board18-18Test-1.0.zip",
    folder: "board18-18Test-1.0",
    images: {
      "Map.png": [1000, 304],
      "Market.png": [1336, 995],
      "Tokens.png": [60, 1080],
      "Yellow.png": [750, 900],
    },
  },
};
