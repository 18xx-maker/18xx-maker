// A capture slot (see createPool) over a hidden window of Electron, or
// anything shaped like one: the commands of the Chrome DevTools Protocol go
// through the debugger of the window's web contents, which accepts any of them.
// Plain JS: no Electron import, the window is passed in.
//
// The slot is
//   load(path)      shows the page of the app at path (the hash of the built
//                   renderer), a promise
//   send(method, params), evaluate(expression)  the adapter of the capture
//   close()         destroys the window
//
// Electron's debugger does not have Page.printToPDF (printing is done by the
// app, not by the page), so the slot answers it with webContents.printToPDF,
// and the same stream commands the capture reads a pdf with.
//
// It fails with "The capture window is gone" when the window was closed or the
// debugger detached (a crashed page, devtools), instead of waiting for an
// answer that does not come.
export const createWindowSlot = (window, baseUrl) => {
  const { webContents } = window;
  const cdp = webContents.debugger;
  let detached = null;
  // The pdfs that were printed and are not read yet, by stream handle
  const streams = new Map();
  let printed = 0;

  // Nobody can steer the window to another page: it only goes where load()
  // sends it
  const leave = (event) => event.preventDefault();
  webContents.on("will-navigate", leave);
  webContents.on("will-redirect", leave);
  webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  cdp.on("detach", (_event, reason) => {
    detached = reason;
  });
  cdp.attach("1.3");

  const live = () => {
    if (detached || window.isDestroyed()) {
      throw new Error(`The capture window is gone (${detached || "closed"})`);
    }
  };

  return {
    // A new page each time: a page that only changes its hash would keep the
    // render state of the last document
    load: async (path) => {
      live();
      await webContents.loadURL("about:blank");
      live();
      await webContents.loadURL(`${baseUrl}#${path}`);
    },
    send: async (method, params) => {
      live();
      if (method === "Page.printToPDF") {
        const { transferMode, ...options } = params;
        if (transferMode !== "ReturnAsStream") {
          throw new Error("Only a pdf as a stream can be printed");
        }
        const pdf = await webContents.printToPDF(options);
        const stream = `pdf-${printed++}`;
        streams.set(stream, pdf.toString("base64"));
        return { stream };
      }
      if (method === "IO.read" && streams.has(params.handle)) {
        return {
          data: streams.get(params.handle),
          base64Encoded: true,
          eof: true,
        };
      }
      if (method === "IO.close" && streams.has(params.handle)) {
        streams.delete(params.handle);
        return {};
      }
      return cdp.sendCommand(method, params);
    },
    evaluate: async (expression) => {
      live();
      return webContents.executeJavaScript(expression);
    },
    close: () => {
      if (!window.isDestroyed()) window.destroy();
    },
  };
};
