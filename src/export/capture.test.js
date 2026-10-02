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

// An adapter that records what it was sent
const adapter = ({ rect, reads = [btoa("pdf")] } = {}) => {
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
      if (method === "Page.captureScreenshot") {
        return { data: btoa(String.fromCharCode(...PNG)) };
      }
      return {};
    },
    evaluate: async () => rect,
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

describe("b18", () => {
  const job = (transparent) => ({
    format: "b18",
    doc: doc({ viewport: { w: 60, h: 90 }, transparent }),
  });

  it("is a screenshot of a viewport of the size of the image", async () => {
    const a = adapter();

    expect(await capture(a, job(false))).toEqual(PNG);

    expect(a.calls).toEqual([
      ["Emulation.setEmulatedMedia", { media: "print" }],
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
    expect(readPng(await capture(adapter(), job(false)))).toMatchObject({
      pixelsPerMeter: null,
    });
  });

  it("is transparent when asked, and the background is reset after", async () => {
    const a = adapter();

    await capture(a, job(true));

    expect(a.calls).toContainEqual([
      "Emulation.setDefaultBackgroundColorOverride",
      { color: { r: 0, g: 0, b: 0, a: 0 } },
    ]);
    expect(a.calls.at(-1)).toEqual([
      "Emulation.setDefaultBackgroundColorOverride",
      undefined,
    ]);
  });

  it("is not dpi dependent", async () => {
    const a = adapter();

    await capture(a, job(false), { dpi: 72 });

    expect(a.calls[1][1].deviceScaleFactor).toBe(1);
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
  const job = (transparent = false) => ({
    format: "png",
    doc: doc({ selector: ".printElement", transparent }),
  });
  const rect = { x: 0, y: 0, width: 240, height: 150 };

  it("captures the element at 300 dpi by default", async () => {
    const a = adapter({ rect });

    const bytes = await capture(a, job());

    expect(a.calls[1]).toEqual([
      "Emulation.setDeviceMetricsOverride",
      { width: 240, height: 150, deviceScaleFactor: 3.125, mobile: false },
    ]);
    expect(a.calls[2]).toEqual([
      "Page.captureScreenshot",
      {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: 240, height: 150, scale: 1 },
      },
    ]);
    expect(readPng(bytes).pixelsPerMeter).toBe(11811);
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

  it("rounds the size up to whole CSS pixels", async () => {
    const a = adapter({
      rect: { x: 10.5, y: 3.25, width: 255.109375, height: 166.296875 },
    });

    await capture(a, job());

    expect(a.calls[1][1]).toMatchObject({ width: 11 + 256, height: 4 + 167 });
    expect(a.calls[2][1].clip).toEqual({
      x: 10.5,
      y: 3.25,
      width: 256,
      height: 167,
      scale: 1,
    });
  });

  it("does not round up what is only off by a float error", async () => {
    const a = adapter({ rect: { ...rect, width: 240.0000001 } });

    await capture(a, job());

    expect(a.calls[2][1].clip.width).toBe(240);
  });

  it("is transparent when asked, and resets the page after", async () => {
    const a = adapter({ rect });

    await capture(a, job(true));

    expect(a.calls).toContainEqual([
      "Emulation.setDefaultBackgroundColorOverride",
      { color: { r: 0, g: 0, b: 0, a: 0 } },
    ]);
    expect(a.names().slice(-2)).toEqual([
      "Emulation.clearDeviceMetricsOverride",
      "Emulation.setDefaultBackgroundColorOverride",
    ]);
  });

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
  it("is the size in CSS pixels times dpi over 96, rounded up before", () => {
    expect(imageSize({ width: 240, height: 150 }, 300)).toEqual({
      width: 750,
      height: 469,
    });
    expect(imageSize({ width: 255.1, height: 166.3 }, 300)).toEqual({
      width: 800,
      height: 522,
    });
    expect(imageSize({ width: 96, height: 192 }, 96)).toEqual({
      width: 96,
      height: 192,
    });
    expect(CSS_DPI).toBe(96);
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
