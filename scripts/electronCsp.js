// The Electron renderer is built from the website's index.html but never
// connects to a play server: its policy keeps the connect-src of before play
const CONNECT_SRC = /connect-src [^;"]*/;
const ELECTRON_CONNECT_SRC =
  "connect-src 'self' https://analytics.18xx-maker.com";

export const electronCsp = (html) => {
  if (!CONNECT_SRC.test(html))
    throw new Error("index.html has no connect-src to rewrite for Electron");
  return html.replace(CONNECT_SRC, ELECTRON_CONNECT_SRC);
};

export const electronCspPlugin = () => ({
  name: "electron-csp",
  transformIndexHtml: electronCsp,
});
