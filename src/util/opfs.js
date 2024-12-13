import { v4 as uuidv4 } from "uuid";

import { assoc, indexBy, prop } from "ramda";

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
    await deleteGame(id);
    throw new Error("File was not a valid 18xx-maker game");
  }
};

export const saveGameFile = async (file) => {
  const id = uuidv4();
  const filename = `${id}.json`;
  const dir = await getGamesDirectory();
  const handle = await dir.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();

  return slug(id);
};
