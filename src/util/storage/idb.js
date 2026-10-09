import { assoc, indexBy, map, omit, prop } from "ramda";

import { getGameSummary, loadFile } from "@/util/loading";
import { deleteAssets } from "@/util/storage/assets";
import {
  GAME_DIRECTORY_STORE,
  GAME_FILE_STORE,
  migrateSummary,
  openDB,
} from "@/util/storage/db";

export { migrateSummary };

export const TYPE = "system";
const slug = (id) => `${TYPE}:${id}`;
const meta = (id) => ({
  id,
  type: TYPE,
  slug: slug(id),
});
const op = (store_name, op, write = false) => {
  return openDB().then((db) =>
    new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [store_name],
        write ? "readwrite" : "readonly",
      );
      const store = transaction.objectStore(store_name);
      const request = op(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).finally(() => db.close()),
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

// Reads a game without changing anything: it never deletes the game, updates
// the summary or asks for permission, a file that needs it is an error.
export const peekGame = (id) =>
  loadGameSummary(id)
    .then(prop("handle"))
    .then((handle) =>
      handle.queryPermission().then((permission) => {
        if (permission !== "granted") {
          throw new Error("Permission needed");
        }

        return handle.getFile();
      }),
    )
    .then(loadFile)
    .then(assoc("meta", meta(id)));

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

// The id of the registered game that is the same file as the handle
const registeredId = async (handle) => {
  if (typeof handle.isSameEntry !== "function") return undefined;

  const summaries = await op(GAME_FILE_STORE, (store) => store.getAll());
  for (const summary of summaries) {
    if (
      summary.handle &&
      (await handle.isSameEntry(summary.handle).catch(() => false))
    ) {
      return summary.id;
    }
  }
  return undefined;
};

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
    .then(async (game) =>
      assoc(
        "meta",
        meta(
          handle.kind === "directory"
            ? crypto.randomUUID()
            : ((await registeredId(handle)) ?? crypto.randomUUID()),
        ),
        game,
      ),
    )
    .then((game) => {
      return op(
        store_name,
        (store) => store.put(getGameSummary(game, { handle })),
        true,
      ).then(() => game.meta.slug);
    });
};

export const deleteGame = (id) =>
  op(GAME_FILE_STORE, (store) => store.delete(id), true).then(() =>
    deleteAssets(slug(id)),
  );

const gameHandle = (id) => loadGameSummary(id).then(prop("handle"));

// Asks for permission to write the file of a game. It needs a user gesture, so
// call it straight from the click that saves.
export const requestWrite = (id) =>
  gameHandle(id).then(async (handle) => {
    const mode = { mode: "readwrite" };
    if ((await handle.queryPermission(mode)) === "granted") return;
    if ((await handle.requestPermission(mode)) !== "granted") {
      throw new Error("Permission denied");
    }
  });

// Writes the text over the file of a game, once requestWrite was granted
export const writeGame = (id, text) =>
  gameHandle(id).then(async (handle) => {
    const writable = await handle.createWritable();
    try {
      await writable.write(text);
      await writable.close();
    } catch (e) {
      await writable.abort().catch(() => {});
      throw e;
    }
  });

const PICKER = {
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
};

// Asks where to save a new game, writes the text there and remembers the file
// like an opened one. It needs a user gesture, so call it straight from the
// click. Gives the slug, or undefined when the picker is cancelled.
export const createGameFile = (text, suggestedName) =>
  window
    .showSaveFilePicker({ ...PICKER, suggestedName })
    .then(async (handle) => {
      const writable = await handle.createWritable();
      try {
        await writable.write(text);
        await writable.close();
      } catch (e) {
        await writable.abort().catch(() => {});
        throw e;
      }

      return saveGameHandle(handle);
    })
    .catch((e) => {
      if (e.name === "AbortError") {
        return;
      }

      throw e;
    });

export const openFilePicker = () =>
  window
    .showOpenFilePicker(PICKER)
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
