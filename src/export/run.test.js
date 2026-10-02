import { runExport } from "#export/run";

const jobs = (...paths) => paths.map((path) => ({ path }));

const setup = () => {
  const written = {};
  return {
    written,
    sink: { write: vi.fn((path, bytes) => (written[path] = bytes)) },
    capture: vi.fn(async (job) => `bytes of ${job.path}`),
    events: [],
  };
};

describe("runExport", () => {
  it("captures every job and writes it to the sink", async () => {
    const { sink, capture, written } = setup();

    const result = await runExport({ jobs: jobs("a", "b"), capture, sink });

    expect(written).toEqual({ a: "bytes of a", b: "bytes of b" });
    expect(result).toEqual({ done: 2, total: 2, failed: [], cancelled: false });
  });

  it("reports progress", async () => {
    const { sink, capture } = setup();
    const onProgress = vi.fn();

    await runExport({ jobs: jobs("a", "b"), capture, sink, onProgress });

    expect(onProgress.mock.calls.map(([event]) => event)).toEqual([
      { type: "start", done: 0, total: 2, name: "" },
      { type: "doc", done: 1, total: 2, name: "a" },
      { type: "doc", done: 2, total: 2, name: "b" },
      { type: "done", done: 2, total: 2, name: "" },
    ]);
  });

  it("keeps going when a capture or a write fails", async () => {
    const { sink, capture, written } = setup();
    const captureError = new Error("timeout");
    capture.mockRejectedValueOnce(captureError);
    const writeError = new Error("disk full");
    sink.write.mockImplementationOnce(() => {});
    sink.write.mockImplementationOnce(() => {
      throw writeError;
    });
    const onProgress = vi.fn();

    const result = await runExport({
      jobs: jobs("a", "b", "c", "d"),
      capture,
      sink,
      onProgress,
    });

    expect(Object.keys(written)).toEqual(["d"]);
    expect(result.done).toBe(2);
    expect(result.failed).toEqual([
      { job: { path: "a" }, error: captureError },
      { job: { path: "c" }, error: writeError },
    ]);
    expect(onProgress).toHaveBeenCalledWith({
      type: "fail",
      done: 0,
      total: 4,
      name: "a",
      error: captureError,
    });
  });

  it("stops starting files once aborted", async () => {
    const { sink, capture } = setup();
    const controller = new AbortController();
    capture.mockImplementation(async (job) => {
      if (job.path === "b") controller.abort();
      return "bytes";
    });

    const result = await runExport({
      jobs: jobs("a", "b", "c", "d"),
      capture,
      sink,
      signal: controller.signal,
    });

    expect(capture).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ done: 2, total: 4, cancelled: true });
  });

  it("does not start when already aborted", async () => {
    const { sink, capture } = setup();

    const result = await runExport({
      jobs: jobs("a"),
      capture,
      sink,
      signal: AbortSignal.abort(),
    });

    expect(capture).not.toHaveBeenCalled();
    expect(result.cancelled).toBe(true);
  });

  it("runs files at the same time up to the concurrency", async () => {
    const { sink } = setup();
    let running = 0;
    let most = 0;
    const capture = async () => {
      most = Math.max(most, ++running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running--;
      return "bytes";
    };

    const result = await runExport({
      jobs: jobs("a", "b", "c", "d", "e"),
      capture,
      sink,
      concurrency: 2,
    });

    expect(most).toBe(2);
    expect(result.done).toBe(5);
  });

  it("runs one file at a time by default", async () => {
    const { sink } = setup();
    let running = 0;
    let most = 0;
    const capture = async () => {
      most = Math.max(most, ++running);
      await new Promise((resolve) => setTimeout(resolve, 2));
      running--;
      return "bytes";
    };

    await runExport({ jobs: jobs("a", "b", "c"), capture, sink });

    expect(most).toBe(1);
  });
});
