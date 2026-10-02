import { crc32 } from "node:zlib";

import { decodePng, encodePng } from "./__fixtures__/png.js";
import { cropPng, pixelsPerMeter, readPng, withResolution } from "./png.js";

const chunk = (type, data) => {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
};

const join = (...parts) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};

const ihdr = new Uint8Array(13);
new DataView(ihdr.buffer).setUint32(0, 30);
new DataView(ihdr.buffer).setUint32(4, 20);
const SIGNATURE = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
const png = (...extra) =>
  join(
    SIGNATURE,
    chunk("IHDR", ihdr),
    ...extra,
    chunk("IDAT", Uint8Array.of(1, 2, 3)),
    chunk("IEND", new Uint8Array()),
  );

const types = (bytes) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset);
  const found = [];
  for (let at = 8; at < bytes.length; at += 12 + view.getUint32(at)) {
    found.push(String.fromCharCode(...bytes.subarray(at + 4, at + 8)));
  }
  return found;
};

describe("pixelsPerMeter", () => {
  it("is 11811 at 300 dpi", () => {
    expect(pixelsPerMeter(300)).toBe(11811);
    expect(pixelsPerMeter(96)).toBe(3780);
    expect(pixelsPerMeter(1)).toBe(39);
  });
});

describe("withResolution", () => {
  it("adds a pHYs chunk after the header", () => {
    const out = withResolution(png(), 300);

    expect(types(out)).toEqual(["IHDR", "pHYs", "IDAT", "IEND"]);
    expect(readPng(out)).toEqual({
      width: 30,
      height: 20,
      pixelsPerMeter: 11811,
    });
  });

  it("writes the chunk as the format says, in meters", () => {
    const out = withResolution(png(), 300);
    const view = new DataView(out.buffer);
    // signature 8, IHDR 25, then length, type, x, y, unit, crc
    expect(view.getUint32(33)).toBe(9);
    expect(view.getUint32(41)).toBe(11811);
    expect(view.getUint32(45)).toBe(11811);
    expect(out[49]).toBe(1);
    expect(view.getUint32(50)).toBe(crc32(out.subarray(37, 50)));
  });

  it("keeps the other chunks as they were", () => {
    const original = png(chunk("sRGB", Uint8Array.of(0)));
    const out = withResolution(original, 150);

    expect(types(out)).toEqual(["IHDR", "pHYs", "sRGB", "IDAT", "IEND"]);
    expect(out.length).toBe(original.length + 21);
    expect(readPng(out).pixelsPerMeter).toBe(5906);
  });

  it("replaces a resolution it already has", () => {
    const first = withResolution(png(), 72);
    const out = withResolution(first, 300);

    expect(types(out)).toEqual(["IHDR", "pHYs", "IDAT", "IEND"]);
    expect(readPng(out).pixelsPerMeter).toBe(11811);
  });

  it("does not take other files", () => {
    expect(() => withResolution(Uint8Array.of(1, 2, 3), 300)).toThrow(
      "Not a PNG file",
    );
    expect(() => readPng(Uint8Array.of(1, 2, 3))).toThrow("Not a PNG file");
  });
});

describe("readPng", () => {
  it("has no resolution without a pHYs chunk", () => {
    expect(readPng(png()).pixelsPerMeter).toBeNull();
  });
});

describe("cropPng", () => {
  // A different value for every pixel and channel, filtered with every filter
  const value = (x, y, k = 0) => x * 7 + y * 13 + k * 31;

  it("keeps the top left pixels, as they were", async () => {
    const bytes = encodePng({ width: 9, height: 7 }, value);

    const image = decodePng(await cropPng(bytes, 5, 4));

    expect(image).toMatchObject({ width: 5, height: 4 });
    expect(Array.from(image.pixels)).toEqual(
      Array.from(
        { length: 20 },
        (_, i) => value(i % 5, Math.floor(i / 5)) & 255,
      ),
    );
  });

  it("cuts rgba pixels", async () => {
    const bytes = encodePng({ width: 6, height: 6 }, value, { channels: 4 });

    const image = decodePng(await cropPng(bytes, 5, 6));

    expect(image).toMatchObject({ width: 5, height: 6, channels: 4 });
    expect(image.pixels[(5 * 5 + 4) * 4 + 3]).toBe(value(4, 5, 3) & 255);
    expect(readPng(await cropPng(bytes, 5, 6))).toEqual({
      width: 5,
      height: 6,
      pixelsPerMeter: null,
    });
  });

  it("keeps the other chunks", async () => {
    const bytes = withResolution(
      encodePng({ width: 4, height: 4 }, value),
      300,
    );

    const cut = await cropPng(bytes, 3, 3);

    expect(types(cut)).toEqual(["IHDR", "pHYs", "tEXt", "IDAT", "IEND"]);
    expect(readPng(cut).pixelsPerMeter).toBe(11811);
  });

  it("is the same png when it has the size", async () => {
    const bytes = encodePng({ width: 4, height: 4 }, value);

    expect(await cropPng(bytes, 4, 4)).toBe(bytes);
  });

  it("does not make a png larger", async () => {
    const bytes = encodePng({ width: 4, height: 4 }, value);

    await expect(cropPng(bytes, 5, 4)).rejects.toThrow(
      "A 4 x 4 PNG can not be cut to 5 x 4",
    );
    await expect(cropPng(bytes, 0, 4)).rejects.toThrow("can not be cut");
  });
});
