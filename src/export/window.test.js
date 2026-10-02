import { capture } from "#export/capture";
import { createWindowSlot } from "#export/window";

// A window of Electron, as far as the slot uses it
const fakeWindow = () => {
  const handlers = {};
  const cdp = {
    attach: vi.fn(),
    on: vi.fn((name, handler) => (handlers[name] = handler)),
    sendCommand: vi.fn(async () => ({})),
  };
  const webContents = {
    debugger: cdp,
    on: vi.fn((name, handler) => (handlers[name] = handler)),
    setWindowOpenHandler: vi.fn((handler) => (handlers.open = handler)),
    loadURL: vi.fn(async () => {}),
    executeJavaScript: vi.fn(async () => "result"),
  };
  const window = {
    webContents,
    destroyed: false,
    isDestroyed: () => window.destroyed,
    destroy: vi.fn(() => (window.destroyed = true)),
  };
  return { window, handlers, cdp, webContents };
};

describe("createWindowSlot", () => {
  it("attaches the debugger and sends commands through it", async () => {
    const { window, cdp } = fakeWindow();
    const slot = createWindowSlot(window, "file:///app/index.html");

    expect(cdp.attach).toHaveBeenCalledWith("1.3");
    await slot.send("Emulation.setEmulatedMedia", { media: "print" });
    expect(cdp.sendCommand).toHaveBeenCalledWith("Emulation.setEmulatedMedia", {
      media: "print",
    });
    expect(await slot.evaluate("1 + 1")).toBe("result");
  });

  it("prints a pdf with the window, as a stream, for the shared capture", async () => {
    const { window, cdp, webContents } = fakeWindow();
    webContents.printToPDF = vi.fn(async () => Buffer.from("%PDF-1"));
    const slot = createWindowSlot(window, "file:///app/index.html");

    const bytes = await capture(slot, { format: "pdf", doc: {} });

    expect(new TextDecoder().decode(bytes)).toBe("%PDF-1");
    expect(webContents.printToPDF).toHaveBeenCalledWith({
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      scale: 1,
    });
    // The media is set with the debugger, the pdf is not
    expect(cdp.sendCommand.mock.calls.map(([method]) => method)).toEqual([
      "Emulation.setEmulatedMedia",
    ]);
  });

  it("only prints pdfs as a stream", async () => {
    const { window } = fakeWindow();
    const slot = createWindowSlot(window, "file:///app/index.html");

    await expect(
      slot.send("Page.printToPDF", { transferMode: "ReturnAsBase64" }),
    ).rejects.toThrow("as a stream");
  });

  it("works with the shared capture of a png", async () => {
    const { window, cdp } = fakeWindow();
    const png = Uint8Array.from(
      atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAwS2OUAAAAABJRU5ErkJggg==",
      ),
      (c) => c.charCodeAt(0),
    );
    cdp.sendCommand.mockImplementation(async (method) =>
      method === "Page.captureScreenshot"
        ? { data: btoa(String.fromCharCode(...png)) }
        : {},
    );
    const slot = createWindowSlot(window, "file:///app/index.html");
    slot.evaluate = async () => ({ x: 0, y: 0, width: 1, height: 1 });

    const bytes = await capture(
      slot,
      { format: "png", doc: { capture: { selector: ".printElement" } } },
      { dpi: 96 },
    );

    expect(bytes.length).toBeGreaterThan(png.length);
  });

  it("loads a blank page first so that the state of the last document is gone", async () => {
    const { window, webContents } = fakeWindow();
    const slot = createWindowSlot(window, "file:///app/index.html");

    await slot.load("/games/render:18Test/map");

    expect(webContents.loadURL.mock.calls).toEqual([
      ["about:blank"],
      ["file:///app/index.html#/games/render:18Test/map"],
    ]);
  });

  it("does not leave the app: navigation and new windows are refused", () => {
    const { window, handlers } = fakeWindow();
    createWindowSlot(window, "file:///app/index.html");

    for (const name of ["will-navigate", "will-redirect"]) {
      const event = { preventDefault: vi.fn() };
      handlers[name](event);
      expect(event.preventDefault).toHaveBeenCalled();
    }
    expect(handlers.open({ url: "https://example.com" })).toEqual({
      action: "deny",
    });
  });

  it("fails fast when the debugger detached", async () => {
    const { window, handlers } = fakeWindow();
    const slot = createWindowSlot(window, "file:///app/index.html");

    handlers.detach({}, "target closed");

    await expect(slot.send("Page.enable")).rejects.toThrow(
      "The capture window is gone (target closed)",
    );
    await expect(slot.evaluate("1")).rejects.toThrow("is gone");
    await expect(slot.load("/")).rejects.toThrow("is gone");
  });

  it("fails fast when the window is closed, and closes it once", async () => {
    const { window } = fakeWindow();
    const slot = createWindowSlot(window, "file:///app/index.html");

    slot.close();
    slot.close();

    expect(window.destroy).toHaveBeenCalledTimes(1);
    await expect(slot.send("Page.enable")).rejects.toThrow("(closed)");
  });

  it("fails when the window closes between the two pages of a load", async () => {
    const { window, webContents } = fakeWindow();
    const slot = createWindowSlot(window, "file:///app/index.html");
    webContents.loadURL.mockImplementationOnce(async () => {
      window.destroyed = true;
    });

    await expect(slot.load("/")).rejects.toThrow("is gone");
    expect(webContents.loadURL).toHaveBeenCalledTimes(1);
  });
});
