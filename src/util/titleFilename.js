// A plain ES module with no imports: the app and the Electron main process
// (through #util/newGame) both use it.
export const titleToFilename = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
