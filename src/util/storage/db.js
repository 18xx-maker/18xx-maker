import { assoc, compose } from "ramda";

export const GAME_DIRECTORY_STORE = "game_directory_handles";
export const GAME_FILE_STORE = "game_file_handles";
// The custom images of a game (util/assetNames), one record per image keyed
// by [slug, kind, name]
export const GAME_ASSET_STORE = "game_assets";
export const NAME = "18xx-maker";
export const VERSION = 3;

export const migrateSummary = (summary) => {
  if (!summary.version) {
    // Unversioned summary, this means prior to our first migration. We need to
    // generate a UUID as the id and then remove the slug and add a version
    const id = crypto.randomUUID();
    return compose(
      (summary) => assoc("id", id, summary),
      assoc("version", 1),
      assoc("slug", `system:${id}`),
    )(summary);
  }

  return summary;
};

// Brings a database of an older version up to date. Each step only looks at
// the version it comes from, so any old version ends at the current one.
export const upgrade = (db, transaction, oldVersion) => {
  if (oldVersion < 1) {
    // New DB
    db.createObjectStore(GAME_DIRECTORY_STORE, { keyPath: "id" });
    db.createObjectStore(GAME_FILE_STORE, { keyPath: "id" });
  }

  if (oldVersion < 2) {
    // Upgrading from 1 (a new DB has nothing to migrate)
    const store = transaction.objectStore(GAME_FILE_STORE);
    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.update(migrateSummary(cursor.value));
        cursor.continue();
      }
    };
  }

  if (oldVersion < 3) {
    // Only adds the store, nothing stored changes
    db.createObjectStore(GAME_ASSET_STORE, {
      keyPath: ["slug", "kind", "name"],
    });
  }
};

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      upgrade(request.result, request.transaction, event.oldVersion);
    };
  });
};
