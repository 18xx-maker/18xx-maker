import { createPageCapture } from "#export/page";
import { readPng } from "#export/png";
import { createPool } from "#export/pool";

// A 1 by 1 pixel png, what a screenshot is
const PNG = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);

// A slot of a pool whose page says what its render state is, after some polls
const fakeSlot = ({ states = ["ready"], load } = {}) => {
  const calls = [];
  const queue = [...states];
  const slot = {
    calls,
    polls: 0,
    load: vi.fn(load || (async () => {})),
    close: vi.fn(async () => {}),
    send: async (method, params) => {
      calls.push(method);
      if (method === "Page.printToPDF") return { stream: "s" };
      if (method === "IO.read") {
        return { data: btoa("%PDF"), base64Encoded: true, eof: true };
      }
      if (method === "Page.captureScreenshot") {
        return { data: btoa(String.fromCharCode(...PNG)) };
      }
      return params && {};
    },
    evaluate: async (expression) => {
      if (!expression.includes("renderState")) {
        return { x: 0, y: 0, width: 1, height: 1 };
      }
      slot.polls++;
      return queue.length > 1 ? queue.shift() : queue[0];
    },
  };
  return slot;
};

const setup = (slotOptions, pageOptions) => {
  const slots = [];
  const pool = createPool({
    size: 1,
    open: async () => {
      const slot = fakeSlot(slotOptions);
      slots.push(slot);
      return slot;
    },
  });
  return {
    slots,
    pool,
    capture: createPageCapture({ pool, pollMs: 1, ...pageOptions }),
  };
};

const job = (format = "pdf") => ({
  format,
  doc: {
    route: "/games/render:18Test/map",
    query: { variation: 1 },
    capture: { selector: ".printElement", viewport: null },
  },
});

describe("createPageCapture", () => {
  it("loads the page of the document and captures it once it is ready", async () => {
    const { capture, slots } = setup({ states: [null, null, "ready"] });

    const bytes = await capture(job());

    expect(slots[0].load).toHaveBeenCalledWith(
      "/games/render:18Test/map?variation=1",
    );
    expect(slots[0].calls).toContain("Page.printToPDF");
    expect(new TextDecoder().decode(bytes)).toBe("%PDF");
  });

  it("captures a png of the element at the resolution", async () => {
    const { capture } = setup({}, { dpi: 150 });

    expect(readPng(await capture(job("png")))).toMatchObject({
      pixelsPerMeter: 5906,
    });
  });

  it("reuses a window for the next document", async () => {
    const { capture, slots } = setup();

    await capture(job());
    await capture(job());

    expect(slots).toHaveLength(1);
    expect(slots[0].load).toHaveBeenCalledTimes(2);
  });

  it("fails a page with nothing to show and replaces its window", async () => {
    const { capture, slots } = setup({ states: ["empty"] });

    await expect(capture(job())).rejects.toThrow("has nothing to show");
    expect(slots[0].close).toHaveBeenCalledTimes(1);
  });

  it("fails a document that does not load, and the next one has a new window", async () => {
    const { capture, slots } = setup({
      load: async () => {
        throw new Error("ERR_FAILED");
      },
    });

    await expect(capture(job())).rejects.toThrow("ERR_FAILED");
    await expect(capture(job())).rejects.toThrow("ERR_FAILED");
    expect(slots).toHaveLength(2);
    expect(slots[0].close).toHaveBeenCalledTimes(1);
  });

  it("fails a page that is never ready after the timeout, and stops polling", async () => {
    const { capture, slots } = setup({ states: [null] }, { timeout: 50 });
    await expect(capture(job())).rejects.toThrow("Timed out after 0.05");
    expect(slots[0].close).toHaveBeenCalledTimes(1);

    // Nobody polls a window that was closed
    const polls = slots[0].polls;
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(slots[0].polls).toBe(polls);
  });
});
