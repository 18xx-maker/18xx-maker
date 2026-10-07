import { v4 as uuidv4 } from "uuid";

import { assoc, indexBy, prop } from "ramda";

import { NAME_EXISTS, NAME_INVALID, sanitizeFilename } from "@/util/filename";
import { info, loadFile } from "@/util/loading";

export const TYPE = "internal";
const slug = (id) => `${TYPE}:${id}`;
const meta = (id) => ({
  id,
  type: TYPE,
  slug: slug(id),
});
const name = (id) => `${id}.json`;

const getGamesDirectory = () =>
  navigator.storage
    .getDirectory()
    .then((root) => root.getDirectoryHandle("games", { create: true }));

export const deleteGame = (id) =>
  getGamesDirectory().then((dir) => dir.removeEntry(name(id)));

export const loadSummaries = async () => {
  const dir = await getGamesDirectory();

  const summaries = [];
  for await (const handle of dir.values()) {
    const file = await handle.getFile();
    const id = file.name.replace(/\.json$/, "");

    try {
      const game = await loadFile(file);
      const summary = {
        ...info(game),
        ...meta(id),
      };
      summaries.push(summary);
    } catch {
      await deleteGame(id);
    }
  }

  return indexBy(prop("slug"), summaries);
};

export const loadGame = async (id) => {
  try {
    const dir = await getGamesDirectory();
    const handle = await dir.getFileHandle(name(id));
    const file = await handle.getFile();
    const game = await loadFile(file);
    return assoc("meta", meta(id), game);
  } catch {
    // The file may not exist at all, that must not hide the real error
    await deleteGame(id).catch(() => {});
    throw new Error("File was not a valid 18xx-maker game");
  }
};

// Reads a game without changing anything, unlike loadGame it never deletes it
export const peekGame = async (id) => {
  const dir = await getGamesDirectory();
  const handle = await dir.getFileHandle(name(id));
  const file = await handle.getFile();
  const game = await loadFile(file);
  return assoc("meta", meta(id), game);
};

// Safari has no FileSystemFileHandle.createWritable on the main thread, only
// createSyncAccessHandle inside a worker.
const writeInWorker = (filename, buffer) =>
  new Promise((resolve, reject) => {
    const source = `
      onmessage = async ({ data: { filename, buffer } }) => {
        try {
          const root = await navigator.storage.getDirectory();
          const dir = await root.getDirectoryHandle("games", { create: true });
          const handle = await dir.getFileHandle(filename, { create: true });
          const access = await handle.createSyncAccessHandle();
          access.truncate(0);
          access.write(new Uint8Array(buffer), { at: 0 });
          access.flush();
          access.close();
          postMessage(null);
        } catch (e) {
          postMessage(String(e));
        }
      };
    `;
    const url = URL.createObjectURL(
      new Blob([source], { type: "text/javascript" }),
    );
    const worker = new Worker(url);
    const done = (fn) => (arg) => {
      worker.terminate();
      URL.revokeObjectURL(url);
      fn(arg);
    };
    worker.onmessage = done((event) =>
      event.data === null ? resolve() : reject(new Error(event.data)),
    );
    worker.onerror = done((event) => reject(new Error(event.message)));
    worker.postMessage({ filename, buffer }, [buffer]);
  });

const writeGameFile = async (filename, file) => {
  const dir = await getGamesDirectory();
  const handle = await dir.getFileHandle(filename, { create: true });
  if (typeof handle.createWritable === "function") {
    const writable = await handle.createWritable();
    await writable.write(file);
    await writable.close();
  } else {
    await writeInWorker(filename, await new Blob([file]).arrayBuffer());
  }
};

export const saveGameFile = async (file) => {
  const id = uuidv4();
  await writeGameFile(`${id}.json`, file);
  return slug(id);
};

// Writes the text over the file of an existing game. It never creates one: a
// game that was forgotten in the meantime is an error.
export const overwriteGame = async (id, text) => {
  const dir = await getGamesDirectory();
  await dir.getFileHandle(name(id));
  await writeGameFile(name(id), text);
};

const saveAsError = (code, message) =>
  Object.assign(new Error(message), { code });

// The ids of the games in the private file system
const listIds = async () => {
  const dir = await getGamesDirectory();
  const ids = [];
  for await (const handle of dir.values()) {
    ids.push(handle.name.replace(/\.json$/, ""));
  }
  return ids;
};

// Whether a name is taken, and the id it would replace. Names are compared
// without case, as a case-insensitive file system would.
export const findGame = async (typed) => {
  const wanted = sanitizeFilename(typed, { urlSafe: true }).toLowerCase();
  if (!wanted) return undefined;
  return (await listIds()).find((id) => id.toLowerCase() === wanted);
};

// Writes the text as a new game named by the user and gives its slug. The
// sanitized name is the id, so it is safe in a URL. A name that is taken is an
// error (code "exists") unless overwrite is set, which replaces that game.
export const saveGameAs = async (typed, text, { overwrite = false } = {}) => {
  const id = sanitizeFilename(typed, { urlSafe: true });
  if (!id) throw saveAsError(NAME_INVALID, "Invalid file name");

  const existing = await findGame(id);
  if (existing !== undefined && !overwrite) {
    throw saveAsError(NAME_EXISTS, `${existing} already exists`);
  }

  const target = existing ?? id;
  await writeGameFile(name(target), text);
  return slug(target);
};
