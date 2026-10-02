import { decodePng, encodePng } from "./__fixtures__/png.js";
import {
  CSS_DPI,
  MAX_DPI,
  capture,
  checkPixels,
  imageSize,
  withTimeout,
} from "./capture.js";
import { readPng } from "./png.js";

// A 1 by 1 pixel png, what a screenshot is
const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);

// A screenshot of a clip like Chromium's: a whole number of CSS pixels at the
// scale of the device, rounded. The element is painted on whole CSS pixels;
// a pixel it covers whole is 255, one it partly covers 128 and the others 0.
// Only the header for an image too big to make.
const shot = (clip, scale, rect) => {
  const width = Math.round(Math.floor(clip.width) * scale);
  const height = Math.round(Math.floor(clip.height) * scale);
  const edge = (start, size) => Math.floor(start + size + 1e-3);
  const right = (edge(rect.x, rect.width) - clip.x) * scale;
  const bottom = (edge(rect.y, rect.height) - clip.y) * scale;
  const covered = (x, end) =>
    x + 1 <= end + 1e-6 ? 255 : x < end - 1e-6 ? 128 : 0;
  return encodePng(
    { width, height },
    width * height <= 1e6
      ? (x, y) => Math.min(covered(x, right), covered(y, bottom))
      : null,
  );
};

const base64 = (bytes) => {
  let text = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(text);
};

// An adapter that records what it was sent. The element is at rect, or at
// moved once the device size is changed (the page is laid out again)
const adapter = ({ rect, moved, reads = [btoa("pdf")] } = {}) => {
  let scale = 1;
  let at = rect;
  const calls = [];
  return {
    calls,
    names: () => calls.map(([method]) => method),
    send: async (method, params) => {
      calls.push([method, params]);
      if (method === "Page.printToPDF") return { stream: "s" };
      if (method === "IO.read") {
        const data = reads.shift();
        return { data, base64Encoded: true, eof: reads.length === 0 };
      }
      if (method === "Emulation.setDeviceMetricsOverride") {
        scale = params.deviceScaleFactor;
        if (moved) at = { ...moved, ratio: scale };
      }
      if (method === "Page.captureScreenshot") {
        return {
          data: params.clip
            ? base64(shot(params.clip, scale, at))
            : btoa(String.fromCharCode(...PNG)),
        };
      }
      return {};
    },
    evaluate: async () => at,
  };
};

const doc = (capture) => ({ capture });
const text = (bytes) => new TextDecoder().decode(bytes);

describe("pdf", () => {
  it("prints on the paper of the page, in print media", async () => {
    const a = adapter();

    const bytes = await capture(a, { format: "pdf", doc: doc(null) });

    expect(text(bytes)).toBe("pdf");
    expect(a.calls).toEqual([
      ["Emulation.setEmulatedMedia", { media: "print" }],
      [
        "Page.printToPDF",
        {
          preferCSSPageSize: true,
          printBackground: true,
          displayHeaderFooter: false,
          scale: 1,
          transferMode: "ReturnAsStream",
        },
      ],
      ["IO.read", { handle: "s" }],
      ["IO.close", { handle: "s" }],
    ]);
  });

  it("reads the stream until its end", async () => {
    const a = adapter({ reads: [btoa("one "), btoa("two "), btoa("three")] });

    const bytes = await capture(a, { format: "pdf", doc: doc(null) });

    expect(text(bytes)).toBe("one two three");
    expect(a.names().filter((name) => name === "IO.read")).toHaveLength(3);
  });
});

const WHITE = [
  "Emulation.setDefaultBackgroundColorOverride",
  { color: { r: 255, g: 255, b: 255, a: 1 } },
];
const TRANSPARENT = [
  "Emulation.setDefaultBackgroundColorOverride",
  { color: { r: 0, g: 0, b: 0, a: 0 } },
];

describe("b18", () => {
  // The map or the market, and the tokens or tiles
  const job = (background = true) => ({
    format: "b18",
    doc: doc({ viewport: { w: 60, h: 90 }, background }),
  });

  it("is a screenshot of a viewport of the size of the image", async () => {
    const a = adapter();

    expect(await capture(a, job())).toEqual(PNG);

    expect(a.calls).toEqual([
      ["Emulation.setEmulatedMedia", { media: "print" }],
      WHITE,
      [
        "Emulation.setDeviceMetricsOverride",
        { width: 60, height: 90, deviceScaleFactor: 1, mobile: false },
      ],
      ["Page.captureScreenshot", { format: "png", fromSurface: true }],
      ["Emulation.clearDeviceMetricsOverride", undefined],
      ["Emulation.setDefaultBackgroundColorOverride", undefined],
    ]);
  });

  it("has no resolution in the file", async () => {
    expect(readPng(await capture(adapter(), job()))).toMatchObject({
      pixelsPerMeter: null,
    });
  });

  it.each(["transparent", "white", undefined])(
    "does not take the background (%s): a map is white, tokens transparent",
    async (background) => {
      const map = adapter();
      await capture(map, job(), { background });
      expect(map.calls).toContainEqual(WHITE);
      expect(map.calls).not.toContainEqual(TRANSPARENT);

      const tokens = adapter();
      await capture(tokens, job(false), { background });
      expect(tokens.calls).toContainEqual(TRANSPARENT);
      expect(tokens.calls).not.toContainEqual(WHITE);

      // The background is reset after
      expect(tokens.calls.at(-1)).toEqual([
        "Emulation.setDefaultBackgroundColorOverride",
        undefined,
      ]);
    },
  );

  it("is not dpi dependent", async () => {
    const a = adapter();

    await capture(a, job(), { dpi: 72 });

    expect(a.calls[2][1].deviceScaleFactor).toBe(1);
  });

  it("refuses an image with too many pixels", async () => {
    const a = adapter();
    const big = {
      format: "b18",
      doc: doc({ viewport: { w: 20000, h: 20000 } }),
    };

    await expect(capture(a, big)).rejects.toThrow("400 megapixels");
    expect(a.names()).not.toContain("Page.captureScreenshot");
    // The page is left as it was
    expect(a.names().slice(-2)).toEqual([
      "Emulation.clearDeviceMetricsOverride",
      "Emulation.setDefaultBackgroundColorOverride",
    ]);
  });
});

describe("png", () => {
  const job = () => ({
    format: "png",
    doc: doc({ selector: ".printElement" }),
  });
  const rect = { x: 0, y: 0, width: 240, height: 150 };
  // A card of 18Test, measured by Chromium
  const card = { x: 0, y: 0, width: 255.109375, height: 166.296875 };

  it("captures the element at 300 dpi by default", async () => {
    const a = adapter({ rect });

    const bytes = await capture(a, job());

    expect(a.calls[2]).toEqual([
      "Emulation.setDeviceMetricsOverride",
      { width: 240, height: 150, deviceScaleFactor: 3.125, mobile: false },
    ]);
    expect(a.calls[3]).toEqual([
      "Page.captureScreenshot",
      {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: 240, height: 150, scale: 1 },
      },
    ]);
    // 150 CSS pixels are 468.75 device pixels, the half covered one is cut
    expect(readPng(bytes)).toEqual({
      width: 750,
      height: 468,
      pixelsPerMeter: 11811,
    });
  });

  it("writes the resolution it was captured at", async () => {
    const bytes = await capture(adapter({ rect }), job(), { dpi: 150 });

    expect(readPng(bytes).pixelsPerMeter).toBe(5906);
  });

  it("scales by the dpi over the 96 dpi of CSS", async () => {
    const a = adapter({ rect });

    await capture(a, job(), { dpi: 96 });
    await capture(a, job(), { dpi: 192 });

    const scales = a.calls
      .filter(([method]) => method === "Emulation.setDeviceMetricsOverride")
      .map(([, params]) => params.deviceScaleFactor);
    expect(scales).toEqual([1, 2]);
  });

  // Chromium paints the card 255 by 166 CSS pixels and captures a clip of
  // 255 by 166 CSS pixels as 797 by 519 device pixels: the last column is
  // 7/8 painted and the last row 3/4, an edge that is partly transparent
  it.each([
    [300, 796, 518],
    [150, 398, 259],
    [96, 255, 166],
  ])(
    "has only the pixels a card covers whole at %i dpi",
    async (dpi, width, height) => {
      const a = adapter({ rect: card });

      const bytes = await capture(a, job(), { dpi });

      const image = decodePng(bytes);
      expect(image).toMatchObject({ width, height });
      // Every pixel is painted whole: the edge past it is cut off
      expect(image.pixels.every((value) => value === 255)).toBe(true);
    },
  );

  it("starts at a whole device pixel inside the element", async () => {
    const a = adapter({
      rect: { x: 10.5, y: 3.25, width: 255.109375, height: 166.296875 },
    });

    const bytes = await capture(a, job());

    expect(a.calls[2][1]).toMatchObject({ width: 266, height: 170 });
    const { x, y, width, height } = a.calls[3][1].clip;
    // Painted from 11 to 265 and from 4 to 169 CSS pixels
    expect(x * 3.125).toBeCloseTo(35, 9);
    expect(y * 3.125).toBeCloseTo(13, 9);
    expect(x).toBeGreaterThanOrEqual(11);
    expect(y).toBeGreaterThanOrEqual(4);
    expect(readPng(bytes)).toMatchObject({ width: 793, height: 515 });
    expect(x + 793 / 3.125).toBeLessThanOrEqual(265);
    expect(y + 515 / 3.125).toBeLessThanOrEqual(169);
    // The clip is whole CSS pixels, enough for the image
    expect([width, height]).toEqual([254, 165]);
  });

  // The background is centered in the window, a device size of the window cut
  // to it moves it left
  it("captures the element where it is at the device size of the capture", async () => {
    const a = adapter({
      rect: { x: 128, y: 0, width: 240, height: 150, ratio: 1 },
      moved: { x: 64, y: 0, width: 240, height: 150 },
    });

    const bytes = await capture(a, job());

    expect(a.calls[2][1]).toMatchObject({ width: 368, height: 150 });
    expect(a.calls[3][1].clip).toMatchObject({ x: 64, y: 0 });
    const image = decodePng(bytes);
    expect(image).toMatchObject({ width: 750, height: 468 });
    // Every pixel is the element's
    expect(image.pixels.every((value) => value === 255)).toBe(true);
  });

  it("does not lose a pixel to a float error", async () => {
    const bytes = await capture(
      adapter({ rect: { ...rect, width: 239.9999999 } }),
      job(),
    );

    expect(readPng(bytes).width).toBe(750);
  });

  it("is painted on the pixel grid of the page", async () => {
    // At a devicePixelRatio of 2, 100.75 CSS pixels are painted 100.5 wide
    const wide = { ...rect, width: 100.75 };

    const one = await capture(adapter({ rect: wide }), job());
    const two = await capture(adapter({ rect: { ...wide, ratio: 2 } }), job());

    expect(readPng(one).width).toBe(312);
    expect(readPng(two).width).toBe(314);
  });

  // The map, market, par, revenue and tile manifest
  const withBackground = () => ({
    format: "png",
    doc: doc({ selector: ".printElement", background: true }),
  });

  it("is white by default for a document with the background, and resets the page after", async () => {
    const a = adapter({ rect });

    await capture(a, withBackground());

    expect(a.calls).toContainEqual(WHITE);
    expect(a.calls).not.toContainEqual(TRANSPARENT);
    expect(a.names().slice(-2)).toEqual([
      "Emulation.clearDeviceMetricsOverride",
      "Emulation.setDefaultBackgroundColorOverride",
    ]);
  });

  it("is transparent when asked for a document with the background", async () => {
    const a = adapter({ rect });

    await capture(a, withBackground(), { background: "transparent" });

    expect(a.calls).toContainEqual(TRANSPARENT);
    expect(a.calls).not.toContainEqual(WHITE);
  });

  // Cards, charters, tokens, tiles and the background page
  it.each(["transparent", "white", undefined])(
    "is always transparent for any other document (%s)",
    async (background) => {
      const a = adapter({ rect });

      await capture(a, job(), { background });

      expect(a.calls).toContainEqual(TRANSPARENT);
      expect(a.calls).not.toContainEqual(WHITE);
    },
  );

  it("fails when the page has no such element", async () => {
    const a = adapter({ rect: null });

    await expect(capture(a, job())).rejects.toThrow("no .printElement");
    expect(a.names().at(-1)).toBe(
      "Emulation.setDefaultBackgroundColorOverride",
    );
  });

  it("refuses an element with more pixels than the limit", async () => {
    const a = adapter({ rect: { ...rect, width: 3000, height: 3000 } });

    await expect(capture(a, job(), { maxPixels: 1_000_000 })).rejects.toThrow(
      /\d+ x \d+ pixels is \d+ megapixels, more than the limit of 1, use a lower --dpi/,
    );
    expect(a.names()).not.toContain("Page.captureScreenshot");
  });

  it("allows 200 megapixels by default", async () => {
    // 300 dpi: 14000 x 14000 pixels is 196 megapixels
    const a = adapter({ rect: { ...rect, width: 4480, height: 4480 } });

    await expect(capture(a, job())).resolves.toBeDefined();
    const over = adapter({ rect: { ...rect, width: 4800, height: 4800 } });
    await expect(capture(over, job())).rejects.toThrow("limit of 200");
  });

  it("only takes a resolution of 1 to 300 dpi", async () => {
    const a = adapter({ rect });

    for (const dpi of [0, 301, NaN, -5]) {
      await expect(capture(a, job(), { dpi })).rejects.toThrow(
        `The resolution must be 1 to ${MAX_DPI} dpi`,
      );
    }
    expect(a.calls).toEqual([]);
    await expect(capture(a, job(), { dpi: 300 })).resolves.toBeDefined();
    await expect(capture(a, job(), { dpi: 1 })).resolves.toBeDefined();
  });
});

describe("imageSize", () => {
  it("is the device pixels the element covers whole at dpi over 96", () => {
    expect(imageSize({ width: 240, height: 150 }, 300)).toEqual({
      width: 750,
      height: 468,
    });
    expect(imageSize({ width: 255.109375, height: 166.296875 }, 300)).toEqual({
      width: 796,
      height: 518,
    });
    expect(imageSize({ width: 96, height: 192 }, 96)).toEqual({
      width: 96,
      height: 192,
    });
    expect(CSS_DPI).toBe(96);
  });

  it("is painted on the grid of the ratio of the page", () => {
    expect(imageSize({ width: 100.75, height: 10 }, 96, 2)).toEqual({
      width: 100,
      height: 10,
    });
    expect(imageSize({ width: 100.75, height: 10 }, 192, 2)).toEqual({
      width: 201,
      height: 20,
    });
  });
});

describe("checkPixels", () => {
  it("names the size and the limit", () => {
    expect(() => checkPixels(20000, 20000)).toThrow(
      "20000 x 20000 pixels is 400 megapixels, more than the limit of 200, use a lower --dpi",
    );
    expect(() => checkPixels(10000, 20000)).not.toThrow();
  });
});

describe("withTimeout", () => {
  it("rejects when it takes too long", async () => {
    await expect(
      withTimeout(new Promise(() => {}), 10, "Timed out"),
    ).rejects.toThrow("Timed out");
  });

  it("is the result when it is in time", async () => {
    await expect(withTimeout(Promise.resolve(5), 1000, "x")).resolves.toBe(5);
  });
});
