import { v4 as uuidv4 } from "uuid";

import { assoc, compose, indexBy, map, omit, prop } from "ramda";

import { getGameSummary, loadFile } from "@/util/loading";

export const TYPE = "system";
const slug = (id) => `${TYPE}:${id}`;
const meta = (id) => ({
  id,
  type: TYPE,
  slug: slug(id),
});
const GAME_DIRECTORY_STORE = "game_directory_handles";
const GAME_FILE_STORE = "game_file_handles";
const NAME = "18xx-maker";
const VERSION = 2;

export const migrateSummary = (summary) => {
  if (!summary.version) {
    // Unversioned summary, this means prior to our first migration. We need to
    // generate a UUID as the id and then remove the slug and add a version
    const id = uuidv4();
    return compose(
      (summary) => assoc("id", id, summary),
      assoc("version", 1),
      assoc("slug", slug(id)),
    )(summary);
  }

  return summary;
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (event.oldVersion === 0) {
        // New DB
        db.createObjectStore(GAME_DIRECTORY_STORE, { keyPath: "id" });
        db.createObjectStore(GAME_FILE_STORE, { keyPath: "id" });
      }

      if (event.oldVersion === 1) {
        // Upgrading from 1
        const store = request.transaction.objectStore(GAME_FILE_STORE);
        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const migrated = migrateSummary(cursor.value);
            cursor.update(migrated);
            cursor.continue();
          } else {
            // Upgraded from version 1
          }
        };
      }
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

const loadFileFromHandle = (handle) =>
  handle.queryPermission().then((permission) => {
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
    .then(loadFile)
    .then(assoc("meta", meta(id)))
    .then(updateSummary);

export const saveGameHandle = (handle) => {
  const store_name =
    handle.kind === "directory" ? GAME_DIRECTORY_STORE : GAME_FILE_STORE;

  // Load this game in order to save the data we need
  return handle
    .getFile()
    .then(loadFile)
    .catch(() => {
      throw new Error("File was not a valid 18xx-maker game");
    })
    .then(assoc("meta", meta(uuidv4())))
    .then((game) => {
      return op(
        store_name,
        (store) => store.put(getGameSummary(game, { handle })),
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
