import fs from "node:fs";
import zlib from "node:zlib";

import { readPng } from "../src/export/png.js";

// Helpers to read the real files of an export, the same on every OS

export const png = (file) => readPng(new Uint8Array(fs.readFileSync(file)));

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
  },
  b18: {
    zip: "board18-18Test-1.0.zip",
    folder: "board18-18Test-1.0",
    images: {
      "Map.png": [1000, 304],
      "Market.png": [1336, 995],
      "Tokens.png": [60, 1080],
      "Yellow.png": [300, 900],
    },
  },
};
