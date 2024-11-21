import { indexBy, prop } from "ramda";

import { getID, getSlug, loadFile, loadSummary } from "@/util/loading";

export const TYPE = "internal";

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
    try {
      const summary = await loadSummary(TYPE, file);
      summaries.push(summary);
    } catch {
      await deleteGame(getID(file.name));
    }
  }

  return indexBy(prop("slug"), summaries);
};

export const loadGame = (id) =>
  getGamesDirectory()
    .then((dir) => dir.getFileHandle(name(id)))
    .then((handle) => handle.getFile())
    .then(loadFile(TYPE))
    .catch(() => {
      return deleteGame(id).then(() => {
        throw new Error("File was not a valid 18xx-maker game");
      });
    });

export const saveGameFile = async (file) => {
  const dir = await getGamesDirectory();
  const handle = await dir.getFileHandle(file.name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();

  return getSlug(TYPE, getID(file.name));
};
