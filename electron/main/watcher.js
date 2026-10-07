// Watches the file of the game that is open and sends the game again when the
// file changes. Everything of Electron and the file system is passed in.
//
// summaryOf(id)   the summary of a game, with its path
// exists(path)    if a file is there
// chokidar        the file watcher
// loadGame(id)    a promise of the game of the file
// onGame(game)    what to do with a game that was read again
// log(error)      where errors go
export const createWatcher = ({
  summaryOf,
  exists,
  chokidar,
  loadGame,
  onGame,
  log = console.error,
}) => {
  let watching = null;
  let watcher = null;

  const close = () => {
    watching = null;
    if (watcher) {
      const closing = watcher;
      watcher = null;
      Promise.resolve()
        .then(() => closing.close())
        .catch(log);
    }
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

    const { path } = summary;
    watching = path;
    // An editor writes a file in pieces: wait until it is done
    watcher = chokidar.watch(path, {
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    });
    const mine = watcher;

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
