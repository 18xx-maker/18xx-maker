import { fromMainWindow } from "#export/ipc";
import {
  assertGamePath,
  guardHandle,
  guardOn,
  guardSync,
} from "../../electron/main/guard.js";

const file = "file:///app/renderer/index.html";
const dev = "http://localhost:5173";

// What index.js builds for each channel
const makeIsMain = (win, base) => (event) => fromMainWindow(event, win, base);

describe("the guard of the app's channels", () => {
  const contents = {};
  const win = { webContents: contents, isDestroyed: () => false };
  const from = (url, sender = contents) => ({
    sender,
    senderFrame: { url },
  });

  it("passes the event first and every argument on, unchanged", () => {
    const handler = vi.fn(() => "ok");
    const guarded = guardHandle(makeIsMain(win, file), handler);
    const event = from(`${file}#/x`);

    expect(guarded(event, "a", { b: 1 })).toBe("ok");
    expect(handler).toHaveBeenCalledWith(event, "a", { b: 1 });
  });

  it("serves the dev server and a window that reloaded", () => {
    const handler = vi.fn();
    const isMain = makeIsMain(win, dev);
    guardHandle(isMain, handler)(from(`${dev}/#/games`));
    // A reload keeps the contents and the page, only the route changes
    guardHandle(isMain, handler)(from(`${dev}/#/docs`));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("refuses another window, another page and no main window", () => {
    const handler = vi.fn();
    const refused = [
      [makeIsMain(win, file), from(`${file}#/x`, {})],
      [makeIsMain(win, file), from("https://evil.test/")],
      [makeIsMain(win, dev), from(`${file}#/x`)],
      [makeIsMain(null, file), from(`${file}#/x`)],
      [
        makeIsMain({ ...win, isDestroyed: () => true }, file),
        from(`${file}#/x`),
      ],
    ];

    for (const [isMain, event] of refused) {
      expect(() => guardHandle(isMain, handler)(event)).toThrow(
        /not available/,
      );
      expect(guardOn(isMain, handler)(event)).toBeUndefined();
      const sync = { ...event };
      guardSync(isMain, handler)(sync);
      expect(sync.returnValue).toBeNull();
    }
    expect(handler).not.toHaveBeenCalled();
  });

  it("lets a sync handler set its own return value", () => {
    const guarded = guardSync(makeIsMain(win, file), (event) => {
      event.returnValue = 5;
    });
    const event = from(`${file}#/x`);
    guarded(event);
    expect(event.returnValue).toBe(5);
  });
});

describe("assertGamePath", () => {
  it("takes an absolute path, whatever the file is called", () => {
    expect(assertGamePath("/games/a.json")).toBe("/games/a.json");
    expect(assertGamePath("/games/a.JSON")).toBe("/games/a.JSON");
    expect(assertGamePath("/games/my-game")).toBe("/games/my-game");
  });

  it("refuses what is not an absolute path", () => {
    for (const bad of ["", "a.json", "../a.json", undefined, 5, {}]) {
      expect(() => assertGamePath(bad)).toThrow("Invalid game file");
    }
  });
});
