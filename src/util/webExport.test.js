import { unzipSync } from "fflate";
import { describe, expect, it, vi } from "vitest";

import { RENDER_STATE } from "../export/page.js";
import { FONT_ALIASES, svgExpression } from "../export/svg.js";
import { exportSvgs, frameEvaluate, frameSend } from "./webExport.js";

const SVG = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

const requestOf = (names) => ({
  id: "x",
  game: { info: { title: "18Test" } },
  config: {},
  jobs: names.map((name) => ({
    doc: { route: `/games/render:x/${name}`, query: {}, capture: "svg" },
    format: "svg",
    path: `svg/18test-${name}.svg`,
  })),
});

// A slot that is "ready" and answers svgs, or "empty" for the routes in empty
const slots = (empty = []) => {
  const made = [];
  const openSlot = async () => {
    let route = "";
    const slot = {
      load: vi.fn(async (path) => {
        route = path;
      }),
      evaluate: vi.fn(async (expression) =>
        expression.includes("renderState")
          ? empty.some((e) => route.includes(e))
            ? "empty"
            : "ready"
          : { text: SVG },
      ),
      send: vi.fn(async () => {}),
      close: vi.fn(async () => {}),
    };
    made.push(slot);
    return slot;
  };
  return { made, openSlot };
};

describe("exportSvgs", () => {
  it("one job downloads the bare svg", async () => {
    const { openSlot } = slots();
    const result = await exportSvgs(requestOf(["map"]), { openSlot });
    expect(result.file.name).toBe("18test-map.svg");
    expect(result.file.type).toBe("image/svg+xml");
    expect(new TextDecoder().decode(result.file.bytes)).toBe(SVG);
  });

  it("several jobs download a zip of the job paths", async () => {
    const { openSlot } = slots();
    const request = requestOf(["map", "market", "tokens"]);
    const { file } = await exportSvgs(request, { openSlot });
    expect(file.name).toBe("18test.zip");
    expect(file.type).toBe("application/zip");
    expect(Object.keys(unzipSync(file.bytes))).toEqual(
      request.jobs.map((job) => job.path),
    );
  });

  it("an empty document fails, the others are zipped", async () => {
    const { openSlot } = slots(["market"]);
    const result = await exportSvgs(requestOf(["map", "market", "tokens"]), {
      openSlot,
      concurrency: 1,
    });
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0].path).toBe("svg/18test-market.svg");
    expect(Object.keys(unzipSync(result.file.bytes))).toEqual([
      "svg/18test-map.svg",
      "svg/18test-tokens.svg",
    ]);
  });

  it("cancel closes every slot and returns no file", async () => {
    const { made, openSlot } = slots();
    const controller = new AbortController();
    const result = await exportSvgs(requestOf(["map", "market", "tokens"]), {
      openSlot,
      concurrency: 1,
      signal: controller.signal,
      onProgress: (event) => {
        if (event.type === "doc") controller.abort();
      },
    });
    expect(result.cancelled).toBe(true);
    expect(result.file).toBeNull();
    expect(made.length).toBeGreaterThan(0);
    for (const slot of made) expect(slot.close).toHaveBeenCalled();
  });
});

describe("exportSvgs cancel in progress", () => {
  it("ends at once when aborted during a pending capture", async () => {
    const made = [];
    const openSlot = async () => {
      const slot = {
        load: vi.fn(async () => {}),
        evaluate: vi.fn((expression) =>
          expression.includes("renderState")
            ? Promise.resolve("ready")
            : new Promise(() => {}),
        ),
        send: vi.fn(async () => {}),
        close: vi.fn(async () => {}),
      };
      made.push(slot);
      return slot;
    };
    const controller = new AbortController();
    const running = exportSvgs(requestOf(["map"]), {
      openSlot,
      concurrency: 1,
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(made[0]?.evaluate).toHaveBeenCalledTimes(2));
    controller.abort();
    const result = await running;
    expect(result.cancelled).toBe(true);
    expect(result.file).toBeNull();
    expect(made[0].close).toHaveBeenCalled();
  });
});

describe("frameSend", () => {
  it("accepts only the media emulation", async () => {
    await expect(
      frameSend("Emulation.setEmulatedMedia", {}),
    ).resolves.toBeUndefined();
    await expect(frameSend("Page.captureScreenshot", {})).rejects.toThrow(
      "Unsupported on the web: Page.captureScreenshot",
    );
  });
});

// The page has a Content Security Policy without 'unsafe-eval': the
// expressions of the capture are answered by functions of the iframe
describe("frameEvaluate", () => {
  const frame = (state) => ({
    document: { body: { dataset: { renderState: state } } },
    __EXPORT_SVG__: vi.fn(() => ({ text: SVG })),
  });

  it("answers the render state of the page", async () => {
    expect(await frameEvaluate(frame("ready"), RENDER_STATE)).toBe("ready");
    expect(await frameEvaluate({ document: {} }, RENDER_STATE)).toBeUndefined();
  });

  it("serializes the svg with the function of the iframe", async () => {
    const win = frame("ready");
    expect(await frameEvaluate(win, svgExpression('#a "b")'))).toEqual({
      text: SVG,
    });
    expect(win.__EXPORT_SVG__).toHaveBeenCalledWith('#a "b")', FONT_ALIASES);
  });

  it("fails when the iframe has no capture", async () => {
    await expect(
      frameEvaluate({ document: {} }, svgExpression("#a")),
    ).rejects.toThrow("The export page did not load the capture");
  });

  it("evaluates nothing else", async () => {
    await expect(frameEvaluate(frame("ready"), "alert(1)")).rejects.toThrow(
      "Unsupported on the web",
    );
  });
});
