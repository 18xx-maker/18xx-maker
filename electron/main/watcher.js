import path from "node:path";

import { assetsFolder } from "#util/assetNames";

// How long after the last change in the images folder they are read again
const ASSETS_DEBOUNCE = 300;

// Watches the file of the game that is open and sends the game again when the
// file changes. When loadAssets is given it also watches the game's
// <game>.assets folder and sends the images again after a change in it, for an
// edit made outside the app (the app's own addAsset is answered directly).
// Everything of Electron and the file system is passed in.
//
// summaryOf(id)   the summary of a game, with its path
// exists(path)    if a file is there
// chokidar        the file watcher
// loadGame(id)    a promise of the game of the file
// onGame(game)    what to do with a game that was read again
// loadAssets(id)  the images of a game (an asset map), optional
// onAssets(id, assets)  what to do with images that were read again
// debounce        milliseconds to wait for changes in the images to stop
// log(error)      where errors go
export const createWatcher = ({
  summaryOf,
  exists,
  chokidar,
  loadGame,
  onGame,
  loadAssets,
  onAssets,
  debounce = ASSETS_DEBOUNCE,
  log = console.error,
}) => {
  let watching = null;
  let watcher = null;
  let assetsWatcher = null;
  let timer = null;

  const close = () => {
    watching = null;
    clearTimeout(timer);
    timer = null;
    for (const closing of [watcher, assetsWatcher]) {
      if (closing) {
        Promise.resolve()
          .then(() => closing.close())
          .catch(log);
      }
    }
    watcher = null;
    assetsWatcher = null;
  };

  // The folder may not be there yet, so the folder next to the game file is
  // watched, but nothing in it except the images folder. Links are not
  // followed, the changes are collected for a moment and the images are read
  // again by loadAssets, which looks at every file itself.
  const watchAssets = (id, gamePath) => {
    const root = assetsFolder(gamePath);
    const parent = path.resolve(path.dirname(root));
    const inside = (file) => {
      const relative = path.relative(root, file);
      return (
        relative === "" ||
        (!relative.startsWith("..") &&
          !path.isAbsolute(relative) &&
          !relative.split(path.sep).some((part) => part.startsWith(".")))
      );
    };
    const mine = chokidar.watch(parent, {
      ignored: (file) => path.resolve(file) !== parent && !inside(file),
      followSymlinks: false,
      ignoreInitial: true,
      depth: 3,
    });
    assetsWatcher = mine;

    mine.on("error", log);
    mine.on("all", (event, file) => {
      if (!inside(file)) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        Promise.resolve()
          .then(() => loadAssets(id))
          .then((assets) => {
            if (assetsWatcher === mine) onAssets(id, assets);
          })
          .catch(log);
      }, debounce);
    });
  };

  const stopWatching = (id) => {
    const summary = summaryOf(id);

    if (summary && watching === summary.path) close();
  };

  const watch = (id) => {
    const summary = summaryOf(id);
    if (!summary) return undefined;

    close();

    // Don't watch non-existent files
    if (!exists(summary.path)) return undefined;

    const gamePath = summary.path;
    watching = gamePath;
    // An editor writes a file in pieces: wait until it is done
    watcher = chokidar.watch(gamePath, {
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    });
    const mine = watcher;

    if (loadAssets) watchAssets(id, gamePath);

    watcher.on("error", log);
    watcher.on("change", () => {
      // A game that can not be read now (half written, not valid yet) is
      // ignored: the game the app has stays the last good one
      Promise.resolve()
        .then(() => loadGame(id))
        .then((game) => {
          if (watcher === mine) onGame(game);
        })
        .catch(log);
    });

    return id;
  };

  return { watch, stopWatching };
};
