import { createWatcher } from "../../electron/main/watcher.js";

const setup = ({ exists = true, load } = {}) => {
  const summaries = { abc: { path: "/g.json" }, def: { path: "/h.json" } };
  const watchers = [];
  const chokidar = {
    watch: vi.fn((path, options) => {
      const handlers = {};
      const w = {
        path,
        options,
        handlers,
        on: (event, fn) => (handlers[event] = fn),
        close: vi.fn(async () => {}),
      };
      watchers.push(w);
      return w;
    }),
  };
  const deps = {
    summaryOf: (id) => summaries[id],
    exists: vi.fn(() => exists),
    chokidar,
    loadGame: vi.fn(load ?? (async (id) => ({ id }))),
    onGame: vi.fn(),
    log: vi.fn(),
  };
  return { watchers, deps, ...createWatcher(deps) };
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("createWatcher", () => {
  it("ignores a game that is not known", () => {
    const { watch, stopWatching, watchers } = setup();
    expect(watch("nope")).toBeUndefined();
    expect(() => stopWatching("nope")).not.toThrow();
    expect(() => stopWatching(undefined)).not.toThrow();
    expect(watchers).toEqual([]);
  });

  it("does not close the open watcher for an unknown game", async () => {
    const { watch, watchers } = setup();
    watch("abc");
    watch("nope");
    await settle();
    expect(watchers[0].close).not.toHaveBeenCalled();
  });

  it("does not watch a file that is not there", () => {
    const { watch, watchers } = setup({ exists: false });
    expect(watch("abc")).toBeUndefined();
    expect(watchers).toEqual([]);
  });

  it("waits for a write to finish and sends the game it reads again", async () => {
    const { watch, watchers, deps } = setup();
    expect(watch("abc")).toBe("abc");
    expect(watchers[0].options.awaitWriteFinish).toBeTruthy();

    watchers[0].handlers.change();
    await settle();
    expect(deps.onGame).toHaveBeenCalledWith({ id: "abc" });
  });

  it("keeps the last good game when the file can not be read", async () => {
    const { watch, watchers, deps } = setup({
      load: async () => {
        throw new SyntaxError("half written");
      },
    });
    watch("abc");

    watchers[0].handlers.change();
    await settle();
    expect(deps.onGame).not.toHaveBeenCalled();
    expect(deps.log).toHaveBeenCalledWith(expect.any(SyntaxError));
  });

  it("logs a watcher error instead of throwing it", () => {
    const { watch, watchers, deps } = setup();
    watch("abc");
    const error = new Error("EMFILE");
    watchers[0].handlers.error(error);
    expect(deps.log).toHaveBeenCalledWith(error);
  });

  it("closes the old watcher, and does not send for it", async () => {
    let release;
    const { watch, watchers, deps } = setup({
      load: (id) => new Promise((resolve) => (release = () => resolve({ id }))),
    });
    watch("abc");
    watchers[0].handlers.change();
    watch("def");
    await settle();
    expect(watchers[0].close).toHaveBeenCalledTimes(1);

    release();
    await settle();
    expect(deps.onGame).not.toHaveBeenCalled();
  });

  it("stops watching the file of the game, only", async () => {
    const { watch, stopWatching, watchers } = setup();
    watch("abc");
    stopWatching("def");
    await settle();
    expect(watchers[0].close).not.toHaveBeenCalled();
    stopWatching("abc");
    await settle();
    expect(watchers[0].close).toHaveBeenCalledTimes(1);
  });

  it("logs a watcher that fails to close", async () => {
    const { watch, stopWatching, watchers, deps } = setup();
    watch("abc");
    watchers[0].close.mockRejectedValue(new Error("gone"));
    stopWatching("abc");
    await settle();
    expect(deps.log).toHaveBeenCalledWith(expect.any(Error));
  });
});
