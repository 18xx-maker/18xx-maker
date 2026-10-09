// The custom images of the games of the web app (util/assetNames), in the
// IndexedDB store `game_assets`, one record per image:
//   { slug, kind, name, value }   key [slug, kind, name]
// value is the SVG text or the PNG data URI. The slug is the one of the game
// (system:<id> or internal:<id>); bundled games have none.
//
// Every write checks the name, the size and the limits (files per game, bytes
// per game) inside the transaction that writes, so concurrent writes cannot
// pass them together. Errors have a `code`: "kind", "empty", "long", "invalid",
// "reserved" (the name), "size", "png" (signature, header or size of the
// picture), "exists" (a name that is taken, case aside, without replace),
// "missing" (rename or delete of nothing), "count", "total" (the limits) and
// "quota" (the browser storage is full).
//
// Reads give the raw map (see util/assetNames) with null-prototype maps; run it
// through sanitizeAssets (util/assets) before it is shown or rendered.
import {
  KINDS,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  PNG_DATA_URI,
  assetBytes,
  assetProblem,
  emptyAssets,
  isKind,
  maxBytes,
  nameProblem,
  pngBytes,
  sameName,
} from "@/util/assetNames";
import { GAME_ASSET_STORE, openDB } from "@/util/storage/db";

const assetError = (code, message = code) =>
  Object.assign(new Error(message), { code });

const request = (r) =>
  new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

// Runs fn(store) in a transaction on the store and resolves with its result
// when the transaction has completed. A full storage is the code "quota".
const transact = async (mode, fn) => {
  const db = await openDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction([GAME_ASSET_STORE], mode);
      const store = tx.objectStore(GAME_ASSET_STORE);
      let result;
      const failed = (error) =>
        reject(
          error?.name === "QuotaExceededError"
            ? assetError("quota", error.message)
            : (error ?? assetError("failed")),
        );
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => failed(tx.error);
      tx.onabort = () => failed(tx.error);
      Promise.resolve(fn(store)).then(
        (value) => {
          result = value;
        },
        (e) => {
          try {
            tx.abort();
          } catch {
            // Already finished
          }
          failed(e);
        },
      );
    });
  } finally {
    db.close();
  }
};

const ofGame = (slug) => IDBKeyRange.bound([slug], [slug, []]);

const records = (store, slug) => request(store.getAll(ofGame(slug)));

const check = (kind, name, value) => {
  if (!isKind(kind)) throw assetError("kind");
  const named = nameProblem(name);
  if (named) throw assetError(named);
  if (typeof value !== "string") throw assetError("invalid");
  if (assetBytes(kind, value) > maxBytes(kind)) throw assetError("size");
  if (kind === "trains") {
    if (!PNG_DATA_URI.test(value)) throw assetError("png");
    const problem = assetProblem(kind, name, pngBytes(value));
    if (problem) throw assetError("png", problem);
  }
};

// The raw map of a game: { icons, logos, trains } of name to value
export const listAssets = async (slug) => {
  const assets = emptyAssets();
  const found = await transact("readonly", (store) => records(store, slug));
  for (const record of found) {
    if (isKind(record.kind)) assets[record.kind][record.name] = record.value;
  }
  return assets;
};

// Stores an image. A name that is taken (case aside) is the error "exists"
// unless replace is set, which overwrites that image (and takes the new
// case of the name).
export const putAsset = async (
  slug,
  kind,
  name,
  value,
  { replace = false } = {},
) => {
  check(kind, name, value);
  return transact("readwrite", async (store) => {
    const found = await records(store, slug);
    const same = found.find((r) => r.kind === kind && sameName(r.name, name));
    if (same && !replace) throw assetError("exists");

    const others = found.filter((r) => r !== same);
    if (others.length + 1 > MAX_FILES) throw assetError("count");
    const bytes = others.reduce(
      (sum, r) => sum + assetBytes(r.kind, r.value),
      assetBytes(kind, value),
    );
    if (bytes > MAX_TOTAL_BYTES) throw assetError("total");

    if (same && same.name !== name) {
      await request(store.delete([slug, kind, same.name]));
    }
    await request(store.put({ slug, kind, name, value }));
  });
};

// Changes the name of an image: "exists" when another image has the new name
// (case aside)
export const renameAsset = async (slug, kind, from, to) => {
  if (!isKind(kind)) throw assetError("kind");
  const named = nameProblem(to);
  if (named) throw assetError(named);
  return transact("readwrite", async (store) => {
    const found = await records(store, slug);
    const current = found.find((r) => r.kind === kind && r.name === from);
    if (!current) throw assetError("missing");
    if (
      found.some(
        (r) => r !== current && r.kind === kind && sameName(r.name, to),
      )
    ) {
      throw assetError("exists");
    }
    await request(store.delete([slug, kind, from]));
    await request(store.put({ ...current, name: to }));
  });
};

export const deleteAsset = (slug, kind, name) =>
  transact("readwrite", (store) => request(store.delete([slug, kind, name])));

// Removes every image of a game, for a game that was forgotten. It never
// fails: a game must be removable even when the browser has no storage.
export const deleteAssets = async (slug) => {
  try {
    await transact("readwrite", (store) => request(store.delete(ofGame(slug))));
  } catch {
    // Nothing to remove, or no storage to remove it from
  }
};

// Copies the images of a game to another (save as). The target is not cleared.
export const copyAssets = (fromSlug, toSlug) =>
  transact("readwrite", async (store) => {
    const found = await records(store, fromSlug);
    for (const record of found) {
      await request(store.put({ ...record, slug: toSlug }));
    }
    return found.length;
  });

export { KINDS };
