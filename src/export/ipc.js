// The IPC handlers of the app's export, with everything of Electron passed in
// so they can be tested. Only the main window may export: a capture window
// (or a page that navigated somewhere else) must not be able to write files.
//
// isMain(event) says if an IPC event comes from the app's main window
// service   see createExportService
// chooseFolder(title) -> folder | undefined, the folder dialog
// channel(sender) -> ui, see createExportService

// If url is a page of the app at baseUrl: the same file, or the same origin of
// a dev server. The hash is the route and may be anything.
export const isAppUrl = (url, baseUrl) => {
  try {
    const page = new URL(url);
    const base = new URL(baseUrl);
    if (page.protocol !== base.protocol) return false;
    return base.protocol === "file:"
      ? page.pathname === base.pathname
      : page.origin === base.origin;
  } catch {
    return false;
  }
};

// If an IPC event is from the main window's own page
export const fromMainWindow = (event, mainWindow, baseUrl) =>
  !!mainWindow &&
  !mainWindow.isDestroyed() &&
  event.sender === mainWindow.webContents &&
  isAppUrl(event.senderFrame?.url ?? "", baseUrl);

export const createExportIpc = ({ isMain, service, chooseFolder, channel }) => {
  // The folder each window chose in the folder dialog: the only out that is
  // honored, a page can not name a folder of its own
  const chosen = new WeakMap();

  const allow = (event) => {
    if (!isMain(event)) throw new Error("Export is not available here");
  };

  return {
    export: (event, request) => {
      allow(event);
      const { out, ...rest } = request ?? {};
      const folder = chosen.get(event.sender);
      return service.run(
        event.sender.id,
        out !== undefined && out === folder ? { ...rest, out } : rest,
        channel(event.sender),
      );
    },
    cancel: (event) => {
      allow(event);
      return service.cancel(event.sender.id);
    },
    folder: async (event) => {
      allow(event);
      const folder = await chooseFolder();
      if (folder) chosen.set(event.sender, folder);
      return folder;
    },
  };
};

// The addRecent handler of the main process. The capture windows of an export
// show games too, but they are not games the user opened.
export const createAddRecent =
  ({ isCapture, addRecent, afterAdd }) =>
  (event, title, slug) => {
    if (isCapture(event.sender)) return;
    addRecent(title, slug);
    afterAdd();
  };

const isWebUrl = (url) => {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

// What a window of the app does with a link that opens a new window: never
// opens one, a web page opens in the browser
export const windowOpenHandler =
  (openExternal) =>
  ({ url }) => {
    if (isWebUrl(url)) openExternal(url);
    return { action: "deny" };
  };

// The will-navigate listener of the main window: it only shows the app, a web
// page opens in the browser instead
export const navigationGuard = (baseUrl, openExternal) => (event, url) => {
  if (isAppUrl(url, baseUrl)) return;
  event.preventDefault();
  if (isWebUrl(url)) openExternal(url);
};
