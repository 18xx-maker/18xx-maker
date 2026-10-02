import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  capturePage,
  createFileSink,
  exportGame,
  loadExportData,
  loadGameConfig,
  reportFailures,
} from "#cli/export";

let tmp;

beforeEach(() => {
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

describe("capturePage", () => {
  const page = () => ({
    goto: vi.fn(),
    pdf: vi.fn(async () => "pdf bytes"),
    emulateMedia: vi.fn(),
    setViewportSize: vi.fn(),
    screenshot: vi.fn(async () => "png bytes"),
  });

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("prints a pdf", async () => {
    const p = page();
    const job = {
      format: "pdf",
      path: "x.pdf",
      doc: { route: "/games/18Test/map", query: { paginated: "true" } },
    };

    expect(await capturePage(p)(job)).toBe("pdf bytes");
    expect(p.goto).toHaveBeenCalledWith(
      "http://localhost:9000/games/18Test/map?paginated=true",
      { waitUntil: "networkidle" },
    );
    expect(p.pdf).toHaveBeenCalledWith({ scale: 1.0, preferCSSPageSize: true });
  });

  it("screenshots a b18 image in a viewport of its size", async () => {
    const p = page();
    const job = {
      format: "b18",
      path: "Tokens.png",
      doc: {
        route: "/games/18Test/b18/tokens",
        query: { print: "true" },
        capture: { viewport: { w: 60, h: 90 }, transparent: true },
      },
    };

    expect(await capturePage(p)(job)).toBe("png bytes");
    expect(p.emulateMedia).toHaveBeenCalledWith({ media: "print" });
    expect(p.setViewportSize).toHaveBeenCalledWith({ width: 60, height: 90 });
    expect(p.screenshot).toHaveBeenCalledWith({ omitBackground: true });
  });
});

describe("exportGame", () => {
  it("writes the files and returns the paths that failed", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const page = {
      goto: vi.fn(),
      pdf: vi
        .fn()
        .mockResolvedValueOnce("one")
        .mockRejectedValueOnce(new Error("timeout"))
        .mockResolvedValueOnce("three"),
    };
    const doc = { route: "/games/x/map", query: {} };
    const jobs = ["a.pdf", "b.pdf", "c.pdf"].map((p) => ({
      format: "pdf",
      path: p,
      doc,
    }));

    const failed = await exportGame({ page, jobs, out: tmp });

    expect(failed).toEqual(["b.pdf"]);
    expect(fs.readdirSync(tmp).sort()).toEqual(["a.pdf", "c.pdf"]);
    expect(error).toHaveBeenCalledWith("Failed b.pdf: timeout");
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
