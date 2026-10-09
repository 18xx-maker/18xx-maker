import {
  MAX_FILES,
  MAX_PNG_BYTES,
  MAX_TOTAL_BYTES,
  pngDataUri,
} from "@/util/assetNames";
import {
  deleteAsset,
  deleteAssets,
  listAssets,
  putAsset,
  renameAsset,
} from "@/util/storage/assets";
import {
  GAME_ASSET_STORE,
  GAME_DIRECTORY_STORE,
  GAME_FILE_STORE,
  upgrade,
} from "@/util/storage/db";
import * as idb from "@/util/storage/idb";
import * as opfs from "@/util/storage/opfs";

import { makePng } from "@tests/support/png.js";

const SVG = '<svg viewBox="0 0 10 10"><path d="M0 0h5v5z"/></svg>';
const PNG = pngDataUri(makePng());
const slugs = new Set();
const newSlug = () => {
  const slug = `system:${crypto.randomUUID()}`;
  slugs.add(slug);
  return slug;
};

afterAll(async () => {
  for (const slug of slugs) await deleteAssets(slug);
});

const fails = async (promise, code) => {
  const error = await promise.then(
    () => null,
    (e) => e,
  );
  expect(error?.code).toBe(code);
};

// A database of the given version as an older app made it
const openAt = (name, version, onUpgrade) =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) =>
      onUpgrade(request.result, request.transaction, event.oldVersion);
  });

const done = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const names = (db) => Array.from(db.objectStoreNames).sort();

describe("the game_assets store upgrade", () => {
  const dbName = () => `test-${crypto.randomUUID()}`;
  const v1 = (db) => {
    db.createObjectStore(GAME_DIRECTORY_STORE, { keyPath: "id" });
    db.createObjectStore(GAME_FILE_STORE, { keyPath: "id" });
  };
  const put = (db, store, value) =>
    done(db.transaction([store], "readwrite").objectStore(store).put(value));
  const get = (db, store, key) =>
    done(db.transaction([store]).objectStore(store).get(key));

  it("creates every store in a new database (0 to 3)", async () => {
    const db = await openAt(dbName(), 3, upgrade);
    expect(names(db)).toEqual([
      GAME_ASSET_STORE,
      GAME_DIRECTORY_STORE,
      GAME_FILE_STORE,
    ]);
    db.close();
  });

  it("keeps the games and adds the store (1 to 3)", async () => {
    const name = dbName();
    const first = await openAt(name, 1, (db) => v1(db));
    const summary = { id: "a", version: 1, slug: "system:a", title: "A" };
    await put(first, GAME_FILE_STORE, summary);
    await put(first, GAME_DIRECTORY_STORE, { id: "dir" });
    first.close();

    const db = await openAt(name, 3, upgrade);
    expect(names(db)).toContain(GAME_ASSET_STORE);
    expect(await get(db, GAME_FILE_STORE, "a")).toEqual(summary);
    expect(await get(db, GAME_DIRECTORY_STORE, "dir")).toEqual({ id: "dir" });
    db.close();
  });

  it("only adds the store (2 to 3) and keeps what is stored", async () => {
    const name = dbName();
    const first = await openAt(name, 2, (db) => v1(db));
    const summary = { id: "a", version: 1, slug: "system:a", title: "A" };
    await put(first, GAME_FILE_STORE, summary);
    first.close();

    const db = await openAt(name, 3, upgrade);
    expect(names(db)).toContain(GAME_ASSET_STORE);
    expect(await get(db, GAME_FILE_STORE, "a")).toEqual(summary);
    db.close();
  });
});

describe("the images of a game in IndexedDB", () => {
  it("stores and lists images by kind", async () => {
    const slug = newSlug();
    await putAsset(slug, "icons", "star", SVG);
    await putAsset(slug, "logos", "crest", SVG);
    await putAsset(slug, "trains", "loco", PNG);
    const assets = await listAssets(slug);
    expect(assets.icons).toEqual({ star: SVG });
    expect(assets.logos).toEqual({ crest: SVG });
    expect(assets.trains).toEqual({ loco: PNG });
    expect(Object.getPrototypeOf(assets.icons)).toBeNull();
  });

  it("keeps the images of each game apart", async () => {
    const [a, b] = [newSlug(), newSlug()];
    await putAsset(a, "icons", "star", SVG);
    expect((await listAssets(b)).icons).toEqual({});
  });

  it("refuses a name that is taken, case aside, unless it replaces", async () => {
    const slug = newSlug();
    await putAsset(slug, "icons", "Star", SVG);
    await fails(putAsset(slug, "icons", "Star", SVG), "exists");
    await fails(putAsset(slug, "icons", "star", SVG), "exists");
    // Another kind has its own names
    await putAsset(slug, "logos", "star", SVG);

    const other = '<svg viewBox="0 0 1 1"><path d="M1 1"/></svg>';
    await putAsset(slug, "icons", "star", other, { replace: true });
    const assets = await listAssets(slug);
    // One image, with the case of the new name
    expect(assets.icons).toEqual({ star: other });
  });

  it("checks the kind, the name and the size", async () => {
    const slug = newSlug();
    await fails(putAsset(slug, "sounds", "a", SVG), "kind");
    await fails(putAsset(slug, "icons", "", SVG), "empty");
    await fails(putAsset(slug, "icons", "x".repeat(65), SVG), "long");
    await fails(putAsset(slug, "icons", "../a", SVG), "invalid");
    await fails(putAsset(slug, "icons", "con", SVG), "reserved");
    await fails(putAsset(slug, "icons", "a", 5), "invalid");
    await fails(
      putAsset(slug, "icons", "a", "x".repeat(512 * 1024 + 1)),
      "size",
    );
    expect((await listAssets(slug)).icons).toEqual({});
  });

  it("checks a PNG: the data uri, the signature and the header", async () => {
    const slug = newSlug();
    await fails(putAsset(slug, "trains", "a", "data:text/html,x"), "png");
    await fails(
      putAsset(slug, "trains", "a", pngDataUri(makePng({ signature: false }))),
      "png",
    );
    await fails(
      putAsset(slug, "trains", "a", pngDataUri(makePng({ width: 4097 }))),
      "png",
    );
    await putAsset(slug, "trains", "a", PNG);
    expect(Object.keys((await listAssets(slug)).trains)).toEqual(["a"]);
  });

  it("stops at the number of files, inside the transaction", async () => {
    const slug = newSlug();
    await Promise.all(
      Array.from({ length: MAX_FILES }, (_, i) =>
        putAsset(slug, "icons", `n${i}`, SVG),
      ),
    );
    expect(Object.keys((await listAssets(slug)).icons)).toHaveLength(MAX_FILES);
    await fails(putAsset(slug, "icons", "one-more", SVG), "count");
    // A replace does not add one
    await putAsset(slug, "icons", "n0", SVG, { replace: true });
  });

  it("stops at the total size of the images", async () => {
    const slug = newSlug();
    const padded = (size) => {
      const png = makePng();
      const out = new Uint8Array(size);
      out.set(png);
      return pngDataUri(out);
    };
    const count = Math.floor(MAX_TOTAL_BYTES / MAX_PNG_BYTES);
    for (let i = 0; i < count - 1; i++) {
      await putAsset(slug, "trains", `t${i}`, padded(MAX_PNG_BYTES));
    }
    // Just under the total
    await putAsset(slug, "trains", "last", padded(MAX_PNG_BYTES - 1000));
    await fails(
      putAsset(slug, "trains", "over", padded(MAX_PNG_BYTES)),
      "total",
    );
    await putAsset(slug, "trains", "small", PNG);
    expect(Object.keys((await listAssets(slug)).trains)).toContain("small");
  });

  it("lets only one of two writes of a name win", async () => {
    const slug = newSlug();
    const results = await Promise.allSettled([
      putAsset(slug, "icons", "same", SVG),
      putAsset(slug, "icons", "Same", SVG),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([
      "fulfilled",
      "rejected",
    ]);
  });

  it("renames and deletes", async () => {
    const slug = newSlug();
    await putAsset(slug, "icons", "a", SVG);
    await putAsset(slug, "icons", "b", SVG);
    await fails(renameAsset(slug, "icons", "a", "B"), "exists");
    await fails(renameAsset(slug, "icons", "zzz", "c"), "missing");
    await fails(renameAsset(slug, "icons", "a", "../c"), "invalid");
    await renameAsset(slug, "icons", "a", "c");
    expect(Object.keys((await listAssets(slug)).icons).sort()).toEqual([
      "b",
      "c",
    ]);
    await deleteAsset(slug, "icons", "b");
    expect(Object.keys((await listAssets(slug)).icons)).toEqual(["c"]);
  });
});

describe("forgetting a game", () => {
  it("removes the images of a system game", async () => {
    const id = crypto.randomUUID();
    const slug = `system:${id}`;
    const other = newSlug();
    await putAsset(slug, "icons", "star", SVG);
    await putAsset(other, "icons", "star", SVG);
    await idb.deleteGame(id);
    expect((await listAssets(slug)).icons).toEqual({});
    expect((await listAssets(other)).icons).toEqual({ star: SVG });
  });

  it("removes the images of an internal game", async () => {
    const game = JSON.stringify({ info: { title: "T" } });
    const slug = await opfs.saveGameFile(game);
    const id = slug.replace("internal:", "");
    slugs.add(slug);
    await putAsset(slug, "icons", "star", SVG);
    await opfs.deleteGame(id);
    expect((await listAssets(slug)).icons).toEqual({});
  });
});
