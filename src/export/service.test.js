import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { b18Names } from "#export/names";
import { createPool } from "#export/pool";
import { createExportService, validateRequest } from "#export/service";
import { createFileSink } from "#export/sink";

// A slot is a hidden window with a page: it answers the Chrome DevTools
// commands of the capture like a page that is ready
const fakeSlot = ({ state = "ready", hang } = {}) => ({
  close: vi.fn(async () => {}),
  load: vi.fn((route) => {
    if (hang) return new Promise(() => {});
    return Promise.resolve(route);
  }),
  send: async (method) => {
    if (method === "Page.printToPDF") return { stream: "s" };
    if (method === "IO.read") {
      return { data: btoa("%PDF"), base64Encoded: true, eof: true };
    }
    return {};
  },
  evaluate: async (expression) =>
    expression.includes("serializeSvg") ? { text: "<svg/>" } : state,
});

const job = (name, format = "pdf", route = "/games/render:18Test/map") => ({
  format,
  path: name,
  doc: { route, query: {}, capture: null },
});

const request = (overrides = {}) => ({
  id: "18Test",
  game: { info: { title: "18Test" } },
  config: {},
  dpi: 300,
  jobs: [job("a.pdf"), job("b.pdf")],
  ...overrides,
});

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-service-"));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

const setup = ({ slot, ...overrides } = {}) => {
  const slots = [];
  const ui = { progress: vi.fn(), alert: vi.fn() };
  const opened = [];
  const parts = {
    dialogs: {
      chooseFolder: vi.fn(async () => tmp),
      saveFile: vi.fn(async () => ({ out: tmp, name: "chosen.pdf" })),
    },
    openPool: vi.fn((input) => {
      opened.push(input);
      return createPool({
        size: 2,
        open: async () => {
          const next = fakeSlot(slot);
          slots.push(next);
          return next;
        },
      });
    }),
    createSink: createFileSink,
    zip: vi.fn(async () => {}),
    show: vi.fn(),
    concurrency: 2,
    pageOptions: { pollMs: 1 },
    ...overrides,
  };
  return { service: createExportService(parts), ui, slots, opened, ...parts };
};

// The files go in the folder of the game in the chosen folder
const gameDir = () => path.join(tmp, "18Test");
const files = () => fs.readdirSync(gameDir()).sort();

describe("run", () => {
  it("asks for a folder, captures the files into it and shows the result", async () => {
    const { service, ui, dialogs, show, opened } = setup();

    const result = await service.run(1, request({ reveal: true }), ui);

    expect(dialogs.chooseFolder).toHaveBeenCalledTimes(1);
    expect(files()).toEqual(["a.pdf", "b.pdf"]);
    expect(fs.readFileSync(path.join(gameDir(), "a.pdf"), "utf-8")).toBe(
      "%PDF",
    );
    expect(result).toEqual({
      done: 2,
      total: 2,
      failed: [],
      cancelled: false,
      out: gameDir(),
    });
    expect(opened).toEqual([
      { id: "18Test", game: expect.any(Object), config: {} },
    ]);
    expect(ui.progress).toHaveBeenLastCalledWith(
      "Game Exporting",
      "2/2 - b.pdf",
      100,
    );
    expect(ui.alert).toHaveBeenCalledWith(
      "Game Exported",
      `Exported 2 files to ${gameDir()}`,
      "success",
    );
    expect(show).toHaveBeenCalledWith(
      gameDir(),
      expect.stringMatching(/\.pdf$/),
    );
  });

  it.each([[undefined], [false]])(
    "does not show the folder when reveal is %s",
    async (reveal) => {
      const { service, ui, show } = setup();

      const result = await service.run(1, request({ reveal }), ui);

      expect(result.done).toBe(2);
      expect(show).not.toHaveBeenCalled();
    },
  );

  it("uses the folder it is given without asking", async () => {
    const { service, ui, dialogs } = setup();

    await service.run(1, request({ out: tmp }), ui);

    expect(dialogs.chooseFolder).not.toHaveBeenCalled();
    expect(files()).toEqual(["a.pdf", "b.pdf"]);
  });

  it("keeps a game id that is not a name inside the chosen folder", async () => {
    const { service, ui } = setup();

    const result = await service.run(1, request({ id: "../evil" }), ui);

    expect(result.out).toBe(path.join(tmp, "__evil"));
    expect(fs.readdirSync(tmp)).toEqual(["__evil"]);
  });

  it("asks where to save a single file before capturing, and names it as chosen", async () => {
    const order = [];
    const { service, ui, dialogs, openPool } = setup();
    dialogs.saveFile.mockImplementation(async (options) => {
      order.push("dialog");
      expect(options).toEqual({
        title: "Save PDF",
        name: "a.pdf",
        format: "pdf",
      });
      return { out: tmp, name: "chosen.pdf" };
    });
    openPool.mockImplementation(() => {
      order.push("capture");
      return createPool({ size: 1, open: async () => fakeSlot() });
    });

    await service.run(1, request({ single: true, jobs: [job("a.pdf")] }), ui);

    expect(order).toEqual(["dialog", "capture"]);
    expect(fs.readdirSync(tmp)).toEqual(["chosen.pdf"]);
  });

  it("asks for an svg with its own title", async () => {
    const { service, ui, dialogs } = setup();
    dialogs.saveFile.mockResolvedValue({ out: tmp, name: "chosen.svg" });

    await service.run(
      1,
      request({
        single: true,
        jobs: [
          {
            ...job("a.svg", "svg"),
            doc: {
              route: "/games/render:18Test/map",
              query: {},
              capture: { selector: ".printElement" },
            },
          },
        ],
      }),
      ui,
    );

    expect(dialogs.saveFile).toHaveBeenCalledWith({
      title: "Save SVG",
      name: "a.svg",
      format: "svg",
    });
    expect(fs.readdirSync(tmp)).toEqual(["chosen.svg"]);
    expect(fs.readFileSync(path.join(tmp, "chosen.svg"), "utf-8")).toBe(
      "<svg/>",
    );
  });

  it("captures nothing when the dialog is cancelled", async () => {
    const { service, ui, dialogs, openPool } = setup();
    dialogs.chooseFolder.mockResolvedValue(undefined);

    const result = await service.run(1, request(), ui);

    expect(result).toEqual({ done: 0, total: 0, failed: [], cancelled: true });
    expect(openPool).not.toHaveBeenCalled();
    expect(ui.alert).not.toHaveBeenCalled();
    // The export is over, the next one can start
    dialogs.chooseFolder.mockResolvedValue(tmp);
    expect((await service.run(1, request(), ui)).done).toBe(2);
  });

  it("writes the Board 18 json first and zips the box after the images", async () => {
    const order = [];
    const { service, ui, zip, show } = setup();
    zip.mockImplementation(async () => order.push(files().join()));
    const names = {
      folder: "board18-x-1.0",
      zip: "board18-x-1.0.zip",
      json: "board18-x-1.0/x-1.0.json",
    };

    await service.run(
      1,
      request({
        reveal: true,
        jobs: [job("board18-x-1.0/x-1.0/Map.png", "b18")],
        b18: { names, json: { bname: "x" } },
      }),
      ui,
    );

    expect(
      JSON.parse(fs.readFileSync(path.join(gameDir(), names.json), "utf-8")),
    ).toEqual({ bname: "x" });
    expect(zip).toHaveBeenCalledWith(gameDir(), names);
    expect(order).toEqual(["board18-x-1.0"]);
    expect(show).toHaveBeenCalledWith(gameDir(), "board18-x-1.0.zip");
  });

  it("reports the files that fail and keeps the others", async () => {
    const { service, ui, show } = setup();

    const result = await service.run(
      1,
      request({
        reveal: true,
        jobs: [
          job("a.pdf"),
          // Writing outside of the folder is refused by the sink
          job("../evil.pdf"),
          job("c.pdf"),
        ],
      }),
      ui,
    );

    expect(files()).toEqual(["a.pdf", "c.pdf"]);
    expect(result.done).toBe(2);
    expect(result.failed).toEqual([
      { path: "../evil.pdf", message: expect.stringContaining("outside of") },
    ]);
    expect(ui.alert).toHaveBeenCalledWith(
      "Export Failed",
      expect.stringContaining("1 of 3 files failed, ../evil.pdf"),
      "error",
    );
    expect(show).toHaveBeenCalled();
  });

  it("fails a document whose page has nothing to show, and replaces its window", async () => {
    const { service, ui, slots } = setup({ slot: { state: "empty" } });

    const result = await service.run(1, request(), ui);

    expect(result.failed.map(({ path: name }) => name).sort()).toEqual([
      "a.pdf",
      "b.pdf",
    ]);
    expect(result.failed[0].message).toContain("nothing to show");
    expect(fs.readdirSync(tmp)).toEqual([]);
    expect(slots.every(({ close }) => close.mock.calls.length === 1)).toBe(
      true,
    );
  });

  it("closes the windows when the export is over", async () => {
    const { service, ui, slots } = setup();

    await service.run(1, request(), ui);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every(({ close }) => close.mock.calls.length === 1)).toBe(
      true,
    );
  });

  describe("cancelling", () => {
    // Windows that never finish loading
    const hung = () => setup({ slot: { hang: true } });
    const started = (slots, count) =>
      vi.waitFor(() => expect(slots.length).toBeGreaterThanOrEqual(count));

    it("stops an export in progress, closes its windows and does not zip", async () => {
      const { service, ui, slots, zip, show } = hung();
      const running = service.run(
        7,
        request({
          reveal: true,
          jobs: [job("a.png", "b18"), job("b.png", "b18"), job("c.png", "b18")],
          b18: {
            names: { folder: "f", zip: "f.zip", json: "f/f.json" },
            json: {},
          },
        }),
        ui,
      );
      await started(slots, 2);
      expect(service.isRunning(7)).toBe(true);

      service.cancel(7);
      const result = await running;

      expect(result).toMatchObject({ done: 0, cancelled: true, failed: [] });
      expect(slots.every(({ close }) => close.mock.calls.length === 1)).toBe(
        true,
      );
      expect(zip).not.toHaveBeenCalled();
      expect(show).not.toHaveBeenCalled();
      expect(ui.alert).toHaveBeenCalledWith(
        "Export Cancelled",
        expect.stringContaining("Exported 0 of 3 files"),
        "warning",
      );
      expect(service.isRunning(7)).toBe(false);
    });

    it("cancels the exports of every window when the app quits during one", async () => {
      const { service, ui, slots } = hung();
      const a = service.run(1, request(), ui);
      const b = service.run(2, request(), ui);
      await started(slots, 2);

      service.cancelAll();

      expect(await a).toMatchObject({ cancelled: true });
      expect(await b).toMatchObject({ cancelled: true });
    });

    it("does not capture when cancelled while a dialog is open", async () => {
      const { service, ui, dialogs, openPool } = setup();
      let choose;
      dialogs.chooseFolder.mockImplementation(
        () => new Promise((resolve) => (choose = resolve)),
      );

      const running = service.run(1, request(), ui);
      service.cancel(1);
      choose(tmp);

      expect(await running).toMatchObject({ cancelled: true });
      expect(openPool).not.toHaveBeenCalled();
    });

    it("does nothing for a window that does not export", () => {
      const { service } = setup();

      expect(() => service.cancel(99)).not.toThrow();
      expect(() => service.cancelAll()).not.toThrow();
    });
  });

  it("runs one export at a time for a window", async () => {
    const { service, ui, slots } = setup({ slot: { hang: true } });
    const running = service.run(1, request(), ui);
    await vi.waitFor(() => expect(slots.length).toBeGreaterThan(0));

    await expect(service.run(1, request(), ui)).rejects.toThrow(
      "already running",
    );
    service.cancel(1);
    await running;
    expect(service.isRunning(1)).toBe(false);
  });

  it("fails when the Board 18 json can not be written, and closes the windows", async () => {
    const { service, ui, slots } = setup({
      createSink: () => ({
        write: () => {
          throw new Error("disk full");
        },
      }),
    });

    await expect(
      service.run(
        1,
        request({
          b18: {
            names: { folder: "f", zip: "f.zip", json: "f.json" },
            json: {},
          },
        }),
        ui,
      ),
    ).rejects.toThrow("disk full");
    expect(slots.every(({ close }) => close.mock.calls.length === 1)).toBe(
      true,
    );
    expect(service.isRunning(1)).toBe(false);
  });
});

describe("validateRequest", () => {
  it("accepts reveal as a boolean only", () => {
    expect(() => validateRequest(request({ reveal: true }))).not.toThrow();
    expect(() => validateRequest(request({ reveal: false }))).not.toThrow();
    for (const reveal of ["yes", 1, null]) {
      expect(() => validateRequest(request({ reveal }))).toThrow(
        "reveal must be true or false",
      );
    }
  });

  const bad = (overrides, message) =>
    expect(() => validateRequest(request(overrides))).toThrow(message);

  it("accepts a planned request", () => {
    expect(() => validateRequest(request())).not.toThrow();
  });

  it("refuses what is not a request", () => {
    expect(() => validateRequest(null)).toThrow("no request");
    bad({ game: undefined }, "no game");
    bad({ id: "" }, "no game id");
    bad({ jobs: [] }, "no files");
    bad({ jobs: "x" }, "no files");
  });

  it("takes a background of transparent or white", () => {
    expect(() => validateRequest(request())).not.toThrow();
    expect(() =>
      validateRequest(request({ background: "white" })),
    ).not.toThrow();
    bad({ background: "black" }, "transparent or white");
  });

  it("refuses a resolution over the highest", () => {
    bad({ dpi: 301 }, "1 to 300 dpi");
    bad({ dpi: 0 }, "1 to 300 dpi");
    expect(() => validateRequest(request({ dpi: 1 }))).not.toThrow();
  });

  it("takes an svg", () => {
    expect(() =>
      validateRequest(request({ jobs: [job("a.svg", "svg")] })),
    ).not.toThrow();
  });

  it("refuses a file that is not valid", () => {
    expect.hasAssertions();
    bad({ jobs: [job("a.pdf", "gif")] }, "a file is not valid");
    bad({ jobs: [job("a.pdf", "pdf", "https://example.com/")] }, "not valid");
    bad({ jobs: [{ ...job("a.pdf"), path: 4 }] }, "not valid");
  });

  it("wants one file for a single export and a whole Board 18 box", () => {
    expect.hasAssertions();
    bad({ single: true }, "one file expected");
    bad({ b18: { names: {} } }, "no Board 18 box");
  });

  it("only takes plain relative names for the Board 18 box", () => {
    expect.hasAssertions();
    const names = b18Names("18Test", "1.0");
    const box = (changes, json = { bname: "x" }) => ({
      b18: { names: { ...names, ...changes }, json },
    });

    expect(() => validateRequest(request(box({})))).not.toThrow();
    bad(box({ zip: "../evil.zip" }), "no Board 18 box");
    bad(box({ zip: "/tmp/evil.zip" }), "no Board 18 box");
    bad(box({ zip: "C:\\evil.zip" }), "no Board 18 box");
    bad(box({ folder: "a/../../b" }), "no Board 18 box");
    bad(box({ folder: "..\\b" }), "no Board 18 box");
    bad(box({ json: "/etc/passwd" }), "no Board 18 box");
    bad(box({ json: "x/../../y.json" }), "no Board 18 box");
    bad(box({ json: 5 }), "no Board 18 box");
    bad(box({}, "text"), "no Board 18 box");
    bad(box({}, ["x"]), "no Board 18 box");
  });
});
