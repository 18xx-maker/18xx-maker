import { indexBy, map, omit, prop } from "ramda";

import { getGameSummary, loadFile } from "@/util/loading";

export const TYPE = "system";
const GAME_DIRECTORY_STORE = "game_directory_handles";
const GAME_FILE_STORE = "game_file_handles";
const NAME = "18xx-maker";
const VERSION = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(GAME_DIRECTORY_STORE, { keyPath: "id" });
      db.createObjectStore(GAME_FILE_STORE, { keyPath: "id" });
    };
  });
};

const op = (store_name, op, write = false) => {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [store_name],
          write ? "readwrite" : "readonly",
        );
        const store = transaction.objectStore(store_name);
        const request = op(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
};

const loadGameSummary = (id) =>
  op(GAME_FILE_STORE, (store) => store.get(id)).then((summary) => {
    if (!summary) {
      throw new Error(`System game ${id} not found`);
    }

    return summary;
  });

const loadFileFromHandle = (handle) => {
  return handle.queryPermission().then((permission) => {
    if (permission === "granted") {
      return handle.getFile();
    }

    return handle.requestPermission().then((permission) => {
      if (permission === "granted") {
        return handle.getFile();
      }

      throw new Error("Permission denied");
    });
  });
};

export const loadSummaries = () =>
  op(GAME_FILE_STORE, (store) => store.getAll())
    .then(map(omit(["handle"])))
    .then(indexBy(prop("slug")));

const updateSummary = (game) =>
  loadGameSummary(game.meta.id)
    .then((summary) =>
      op(
        GAME_FILE_STORE,
        (store) =>
          store.put({
            ...summary,
            ...getGameSummary(game),
          }),
        true,
      ),
    )
    .then(() => game);

export const loadGame = (id) =>
  loadGameSummary(id)
    .then(prop("handle"))
    .then(loadFileFromHandle)
    .catch((e) => {
      if (e.name === "NotFoundError") {
        return deleteGame(id).then(() => {
          throw new Error(
            `System game ${id} not found, most likly the file has been deleted or moved`,
          );
        });
      }

      throw e;
    })
    .then(loadFile(TYPE))
    .then(updateSummary);

export const saveGameHandle = (handle) => {
  const store_name =
    handle.kind === "directory" ? GAME_DIRECTORY_STORE : GAME_FILE_STORE;

  // Load this game in order to save the data we need
  return handle
    .getFile()
    .then(loadFile(TYPE))
    .catch(() => {
      throw new Error("File was not a valid 18xx-maker game");
    })
    .then((game) => {
      return op(
        store_name,
        (store) =>
          store.put({
            ...getGameSummary(game),
            handle,
          }),
        true,
      ).then(() => game.meta.slug);
    });
};

export const deleteGame = (id) =>
  op(GAME_FILE_STORE, (store) => store.delete(id), true);

export const openFilePicker = () =>
  window
    .showOpenFilePicker({
      excludeAcceptAllOption: true,
      id: "18xx-maker-games",
      types: [
        {
          description: "18xx-maker Game",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    })
    .then((handles) => {
      if (handles.length === 1) {
        return saveGameHandle(handles[0]);
      }
    })
    .catch((e) => {
      if (e.name === "AbortError") {
        return;
      }

      throw e;
    });
