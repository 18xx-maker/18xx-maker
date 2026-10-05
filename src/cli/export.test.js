import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { chromium } from "playwright";

import {
  createCapture,
  createFileSink,
  exportGame,
  loadExportData,
  loadGameConfig,
  reportFailures,
  withBrowser,
} from "#cli/export";
import * as util from "#cli/util";
import { createFakeBrowser } from "./__fixtures__/browser.js";

let tmp;
let fake;

beforeEach(() => {
  fake = createFakeBrowser();
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "18xx-cli-export-"));
});

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("loadExportData", () => {
  it("loads what the app gets from the bundler", () => {
    const data = loadExportData();

    expect(Object.keys(data.tiles)).toContain("1");
    expect(Object.keys(data.companyOverrides)).toContain("1830");
    expect(data.companyOverrides["1830"].companies.length).toBeGreaterThan(0);
    expect(data.layouts.cards).toContain("miniEuroDie");
    expect(data.layouts.tiles).toContain("die");
    expect(data.layouts.tokens.length).toBeGreaterThan(1);
  });
});

describe("loadGameConfig", () => {
  it("has the config of the user in between", () => {
    const config = loadGameConfig(
      { config: { paper: { width: 3 } } },
      { paper: { width: 2, height: 4 }, cards: { layout: "dtgDie" } },
    );

    expect(config.paper).toMatchObject({ width: 3, height: 4 });
    expect(config.cards.layout).toBe("dtgDie");
  });

  it("has the defaults and the config of the game", () => {
    expect(loadGameConfig({}).paper).toBeDefined();
    expect(
      loadGameConfig({ config: { cards: { layout: "dtgDie" } } }).cards.layout,
    ).toBe("dtgDie");
  });
});

describe("createFileSink", () => {
  it("writes files and the folders they are in", () => {
    const sink = createFileSink(tmp);

    sink.write("a/b/c.txt", "hello");
    sink.write("d.txt", Buffer.from("bytes"));

    expect(fs.readFileSync(path.join(tmp, "a/b/c.txt"), "utf-8")).toBe("hello");
    expect(fs.readFileSync(path.join(tmp, "d.txt"), "utf-8")).toBe("bytes");
  });

  it("does not write outside of the folder", () => {
    const sink = createFileSink(path.join(tmp, "out"));

    expect(() => sink.write("../evil.txt", "x")).toThrow("is outside of");
    expect(() => sink.write("a/../../evil.txt", "x")).toThrow("is outside of");
    expect(() => sink.write(path.join(tmp, "evil.txt"), "x")).toThrow(
      "is outside of",
    );
    expect(fs.existsSync(path.join(tmp, "evil.txt"))).toBe(false);
  });
});

describe("withBrowser", () => {
  it("serves the site on a free port and always closes", async () => {
    vi.spyOn(chromium, "launch").mockResolvedValue(fake.browser);
    vi.spyOn(util, "startServer").mockReturnValue(fake.server);

    const result = await withBrowser(async ({ browser, baseUrl }) => {
      expect(browser).toBe(fake.browser);
      return baseUrl;
    });

    expect(result).toBe("http://localhost:1234");
    expect(util.startServer).toHaveBeenCalledWith(0);
    expect(chromium.launch).toHaveBeenCalledWith({
      args: ["--force-color-profile=srgb"],
    });
    expect(fake.browser.close).toHaveBeenCalledOnce();
    expect(fake.server.close).toHaveBeenCalledOnce();
  });

  it("closes when the callback throws", async () => {
    vi.spyOn(chromium, "launch").mockResolvedValue(fake.browser);
    vi.spyOn(util, "startServer").mockReturnValue(fake.server);

    await expect(
      withBrowser(async () => {
        throw new Error("nope");
      }),
    ).rejects.toThrow("nope");
    expect(fake.browser.close).toHaveBeenCalledOnce();
    expect(fake.server.close).toHaveBeenCalledOnce();
  });
});

describe("createCapture", () => {
  const input = { id: "x", game: { info: {} }, config: {} };
  const job = (format, doc = {}) => ({
    format,
    path: `x.${format}`,
    doc: {
      route: "/games/render:x/map",
      query: { paginated: "true" },
      capture: { selector: ".printElement", viewport: { w: 5, h: 6 } },
      ...doc,
    },
  });
  const make = (options) =>
    createCapture({
      browser: fake.browser,
      baseUrl: "http://localhost:1234",
      input,
      ...options,
    });

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("gives the page the game and prints when it is ready", async () => {
    const bytes = await make()(job("pdf"));

    expect(new TextDecoder().decode(bytes)).toBe("pdf");
    expect(fake.page.addInitScript).toHaveBeenCalledWith(
      expect.any(Function),
      input,
    );
    expect(fake.page.goto).toHaveBeenCalledWith(
      "http://localhost:1234/games/render:x/map?paginated=true",
      { waitUntil: "networkidle" },
    );
    expect(fake.page.waitForFunction).toHaveBeenCalledOnce();
  });

  it("sets window.__RENDER_INPUT__ in the page", async () => {
    await make()(job("pdf"));

    const [script, given] = fake.page.addInitScript.mock.calls[0];
    const window = {};
    vi.stubGlobal("window", window);
    script(given);
    vi.unstubAllGlobals();
    expect(window.__RENDER_INPUT__).toBe(input);
  });

  it("captures a png at the dpi", async () => {
    await make({ dpi: 150 })(job("png"));

    expect(fake.session.send).toHaveBeenCalledWith(
      "Emulation.setDeviceMetricsOverride",
      expect.objectContaining({ deviceScaleFactor: 150 / 96 }),
    );
  });

  it("fails when the page has nothing to show", async () => {
    fake.page.evaluate.mockResolvedValueOnce("empty");

    await expect(make()(job("pdf"))).rejects.toThrow(
      "/games/render:x/map?paginated=true has nothing to show",
    );
    expect(fake.page.close).toHaveBeenCalledOnce();
  });

  it("reuses a page that did not fail", async () => {
    const capture = make();

    await capture(job("pdf"));
    await capture(job("pdf"));

    expect(fake.browser.newPage).toHaveBeenCalledOnce();
    expect(fake.page.close).not.toHaveBeenCalled();
  });

  it("closes a page that failed, the next job gets a new one", async () => {
    const capture = make();
    fake.session.failOnce("Page.printToPDF", new Error("crashed"));

    await expect(capture(job("pdf"))).rejects.toThrow("crashed");
    await capture(job("pdf"));

    expect(fake.page.close).toHaveBeenCalledOnce();
    expect(fake.browser.newPage).toHaveBeenCalledTimes(2);
  });

  it("fails a document that takes too long", async () => {
    fake.page.goto.mockImplementationOnce(() => new Promise(() => {}));

    await expect(make({ timeout: 20 })(job("pdf"))).rejects.toThrow(
      "Timed out after 0.02 seconds",
    );
    expect(fake.page.close).toHaveBeenCalledOnce();
  });

  it("fails an image over the pixel limit", async () => {
    await expect(make({ maxPixels: 10 })(job("b18"))).rejects.toThrow(
      "5 x 6 pixels is 0 megapixels",
    );
  });

  it("opens a page for each job that runs at the same time", async () => {
    const capture = make();
    const pages = [];
    fake.browser.newPage.mockImplementation(async () => {
      const page = { ...fake.page };
      pages.push(page);
      return page;
    });

    await Promise.all([capture(job("pdf")), capture(job("pdf"))]);

    expect(pages).toHaveLength(2);
  });
});

describe("exportGame", () => {
  it("writes the files and returns the paths that failed", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const capture = vi
      .fn()
      .mockResolvedValueOnce("one")
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce("three");
    const jobs = ["a.pdf", "b.pdf", "c.pdf"].map((p) => ({ path: p }));

    const failed = await exportGame({ capture, jobs, out: tmp });

    expect(failed).toEqual(["b.pdf"]);
    expect(fs.readdirSync(tmp).sort()).toEqual(["a.pdf", "c.pdf"]);
    expect(error).toHaveBeenCalledWith("Failed b.pdf: timeout");
  });

  it("captures as many files at the same time as asked for", async () => {
    let running = 0;
    let most = 0;
    const capture = async () => {
      most = Math.max(most, ++running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;
      return "x";
    };
    const jobs = ["a", "b", "c", "d"].map((p) => ({ path: `${p}.pdf` }));

    await exportGame({ capture, jobs, out: tmp, concurrency: 2 });

    expect(most).toBe(2);
    expect(fs.readdirSync(tmp)).toHaveLength(4);
  });
});

describe("reportFailures", () => {
  it("does nothing when nothing failed", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    reportFailures([]);

    expect(error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("lists the failures and exits 1", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    reportFailures(["a.pdf", "b.pdf"]);

    expect(error).toHaveBeenCalledWith("\n2 documents failed:\na.pdf\nb.pdf");
    expect(process.exitCode).toBe(1);
  });
});
