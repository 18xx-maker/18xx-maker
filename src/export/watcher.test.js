import path from "node:path";

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

  describe("the images folder", () => {
    const withAssets = (extra = {}) => {
      const loadAssets = vi.fn(async (id) => ({ icons: { [id]: "<svg/>" } }));
      const onAssets = vi.fn();
      const result = setup();
      // setup() builds the watcher from its own deps, so build another one
      const watchers = [];
      const chokidar = {
        watch: vi.fn((file, options) => {
          const handlers = {};
          const w = {
            file,
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
        ...result.deps,
        chokidar,
        loadAssets,
        onAssets,
        debounce: 5,
        ...extra,
      };
      return { ...createWatcher(deps), watchers, deps, loadAssets, onAssets };
    };
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    it("watches the folder of the game file, not following links", () => {
      const { watch, watchers } = withAssets();
      watch("abc");
      expect(watchers.map((w) => w.file)).toEqual([
        "/g.json",
        path.resolve("/"),
      ]);
      expect(watchers[1].options).toMatchObject({
        followSymlinks: false,
        ignoreInitial: true,
        depth: 3,
      });
    });

    it("only looks at the images folder in it", () => {
      const { watch, watchers } = withAssets();
      watch("abc");
      const { ignored } = watchers[1].options;
      const sep = path.sep;
      expect(ignored(path.resolve("/"))).toBe(false);
      expect(ignored(`${sep}g.assets`)).toBe(false);
      expect(ignored(`${sep}g.assets${sep}icons${sep}a.svg`)).toBe(false);
      expect(ignored(`${sep}g.json`)).toBe(true);
      expect(ignored(`${sep}other.assets`)).toBe(true);
      expect(ignored(`${sep}g.assets${sep}icons${sep}.tmp`)).toBe(true);
      expect(ignored(`${sep}g.assets-more${sep}a`)).toBe(true);
    });

    it("sends the images once after a burst of changes", async () => {
      const { watch, watchers, loadAssets, onAssets } = withAssets();
      watch("abc");
      const on = watchers[1].handlers.all;
      on("add", "/g.assets/icons/a.svg");
      on("change", "/g.assets/icons/a.svg");
      on("add", "/g.assets/icons/b.svg");
      expect(loadAssets).not.toHaveBeenCalled();
      await wait(40);
      expect(loadAssets).toHaveBeenCalledTimes(1);
      expect(onAssets).toHaveBeenCalledTimes(1);
      expect(onAssets).toHaveBeenCalledWith("abc", {
        icons: { abc: "<svg/>" },
      });
    });

    it("ignores a change outside the images folder", async () => {
      const { watch, watchers, loadAssets } = withAssets();
      watch("abc");
      watchers[1].handlers.all("change", "/other.txt");
      await wait(30);
      expect(loadAssets).not.toHaveBeenCalled();
    });

    it("sends nothing for a game that is not watched any more", async () => {
      const { watch, watchers, onAssets } = withAssets();
      watch("abc");
      watchers[1].handlers.all("add", "/g.assets/icons/a.svg");
      watch("def");
      await wait(40);
      expect(onAssets).not.toHaveBeenCalled();
      expect(watchers[1].close).toHaveBeenCalled();
    });

    it("closes with the file watcher and logs what fails", async () => {
      const { watch, stopWatching, watchers, deps, loadAssets } = withAssets();
      loadAssets.mockRejectedValue(new Error("EIO"));
      watch("abc");
      watchers[1].handlers.error(new Error("watch"));
      watchers[1].handlers.all("add", "/g.assets/icons/a.svg");
      await wait(40);
      expect(deps.log).toHaveBeenCalledWith(
        expect.objectContaining({ message: "EIO" }),
      );
      stopWatching("abc");
      await wait(5);
      expect(watchers[0].close).toHaveBeenCalled();
      expect(watchers[1].close).toHaveBeenCalled();
    });

    it("does not watch the folder without loadAssets", () => {
      const { watch, watchers } = setup();
      watch("abc");
      expect(watchers).toHaveLength(1);
    });
  });
});
