import {
  createAddRecent,
  createExportIpc,
  fromMainWindow,
  isAppUrl,
  navigationGuard,
  windowOpenHandler,
} from "#export/ipc";

const base = "file:///app/renderer/index.html";

describe("isAppUrl", () => {
  it("is the app's file with any hash", () => {
    expect(isAppUrl(`${base}#/games/18Test/map`, base)).toBe(true);
    expect(isAppUrl("file:///elsewhere/index.html", base)).toBe(false);
    expect(isAppUrl("https://example.com/", base)).toBe(false);
    expect(isAppUrl("", base)).toBe(false);
  });

  it("is the origin of a dev server", () => {
    const dev = "http://localhost:5173";
    expect(isAppUrl("http://localhost:5173/games/x", dev)).toBe(true);
    expect(isAppUrl("http://localhost:51730/", dev)).toBe(false);
    expect(isAppUrl("https://localhost:5173/", dev)).toBe(false);
  });
});

describe("fromMainWindow", () => {
  const contents = {};
  const win = { webContents: contents, isDestroyed: () => false };

  it("needs the main window's contents showing the app", () => {
    const frame = { url: `${base}#/x` };
    expect(
      fromMainWindow({ sender: contents, senderFrame: frame }, win, base),
    ).toBe(true);
    expect(fromMainWindow({ sender: {}, senderFrame: frame }, win, base)).toBe(
      false,
    );
    expect(
      fromMainWindow(
        { sender: contents, senderFrame: { url: "https://evil.test/" } },
        win,
        base,
      ),
    ).toBe(false);
    expect(fromMainWindow({ sender: contents }, win, base)).toBe(false);
    expect(
      fromMainWindow({ sender: contents, senderFrame: frame }, null, base),
    ).toBe(false);
  });
});

describe("createExportIpc", () => {
  const sender = { id: 7 };
  const setup = (isMain = () => true) => {
    const service = {
      run: vi.fn(async () => ({ done: 1 })),
      cancel: vi.fn(),
    };
    const chooseFolder = vi.fn(async () => "/chosen");
    const channel = vi.fn(() => "ui");
    const ipc = createExportIpc({ isMain, service, chooseFolder, channel });
    return { ipc, service, chooseFolder };
  };

  it("refuses every call from a window that is not the main window", async () => {
    const { ipc, service, chooseFolder } = setup(() => false);
    const event = { sender };

    expect(() => ipc.export(event, { out: "/x" })).toThrow(/not available/);
    expect(() => ipc.cancel(event)).toThrow(/not available/);
    await expect(ipc.folder(event)).rejects.toThrow(/not available/);
    expect(service.run).not.toHaveBeenCalled();
    expect(service.cancel).not.toHaveBeenCalled();
    expect(chooseFolder).not.toHaveBeenCalled();
  });

  it("drops an out that was not chosen in the folder dialog", async () => {
    const { ipc, service } = setup();

    await ipc.export({ sender }, { id: "x", out: "/etc" });

    expect(service.run).toHaveBeenCalledWith(7, { id: "x" }, "ui");
  });

  it("honors the folder the window chose, and not another window's", async () => {
    const { ipc, service } = setup();
    expect(await ipc.folder({ sender })).toBe("/chosen");

    await ipc.export({ sender }, { id: "x", out: "/chosen" });
    await ipc.export({ sender }, { id: "x", out: "/other" });
    await ipc.export({ sender: { id: 8 } }, { id: "x", out: "/chosen" });

    expect(service.run.mock.calls.map(([, request]) => request.out)).toEqual([
      "/chosen",
      undefined,
      undefined,
    ]);
  });

  it("does not remember a cancelled folder dialog", async () => {
    const { ipc, service, chooseFolder } = setup();
    chooseFolder.mockResolvedValueOnce(undefined);

    await ipc.folder({ sender });
    await ipc.export({ sender }, { id: "x", out: undefined });

    expect(service.run.mock.calls[0][1]).toEqual({ id: "x" });
  });

  it("cancels the export of the main window", () => {
    const { ipc, service } = setup();
    ipc.cancel({ sender });
    expect(service.cancel).toHaveBeenCalledWith(7);
  });

  it("passes on a missing request for the service to refuse", async () => {
    const { ipc, service } = setup();
    await ipc.export({ sender }, undefined);
    expect(service.run).toHaveBeenCalledWith(7, {}, "ui");
  });
});

describe("createAddRecent", () => {
  it("does not add the games of capture windows", () => {
    const addRecent = vi.fn();
    const afterAdd = vi.fn();
    const handler = createAddRecent({
      isCapture: (sender) => sender.capture,
      addRecent,
      afterAdd,
    });

    handler({ sender: { capture: true } }, "18Test", "render:18Test");
    expect(addRecent).not.toHaveBeenCalled();
    expect(afterAdd).not.toHaveBeenCalled();

    handler({ sender: {} }, "1889", "1889");
    expect(addRecent).toHaveBeenCalledWith("1889", "1889");
    expect(afterAdd).toHaveBeenCalledOnce();
  });
});

describe("windowOpenHandler", () => {
  it("denies every window and opens only web pages in the browser", () => {
    const open = vi.fn();
    const handler = windowOpenHandler(open);

    expect(handler({ url: "https://example.com/a" })).toEqual({
      action: "deny",
    });
    expect(handler({ url: "http://example.com/" })).toEqual({
      action: "deny",
    });
    expect(handler({ url: "file:///etc/passwd" })).toEqual({ action: "deny" });
    expect(handler({ url: "httpfoo://x" })).toEqual({ action: "deny" });
    expect(handler({ url: "nonsense" })).toEqual({ action: "deny" });
    expect(handler({ url: "about:blank" })).toEqual({ action: "deny" });

    expect(open.mock.calls).toEqual([
      ["https://example.com/a"],
      ["http://example.com/"],
    ]);
  });
});

describe("navigationGuard", () => {
  it("only lets the window stay in the app", () => {
    const open = vi.fn();
    const guard = navigationGuard(base, open);
    const go = (url) => {
      const event = { preventDefault: vi.fn() };
      guard(event, url);
      return event.preventDefault.mock.calls.length > 0;
    };

    expect(go(`${base}#/games`)).toBe(false);
    expect(go("https://example.com/")).toBe(true);
    expect(go("file:///etc/passwd")).toBe(true);
    expect(open.mock.calls).toEqual([["https://example.com/"]]);
  });
});
