import fs from "node:fs";

import { dialog } from "electron";
import { v4 as uuidv4 } from "uuid";

import { assoc, assocPath } from "ramda";

import {
  getConfig,
  info,
  summaryOfPath,
  updateConfig,
  updateSummaries,
} from "./config.js";
import { getMainWindow } from "./window.js";

export const TYPE = "electron";
const slug = (id) => `${TYPE}:${id}`;
const meta = (id) => ({
  id,
  type: TYPE,
  slug: slug(id),
});

export const loadGame = (id) =>
  new Promise((resolve) => {
    const summary = getConfig().summaries[id];
    if (!summary) throw new Error(`Electron game ${id} not found`);

    const json = fs.readFileSync(summary.path);
    const game = assoc("meta", meta(id), JSON.parse(json));
    updateSummaries(game);
    resolve(game);
  });

// A file is one game: a path that is already a game keeps its id and slug, and
// only has its summary refreshed
export const saveGamePath = (path) =>
  new Promise((resolve) => {
    const existing = summaryOfPath(path);
    const id = existing?.id ?? uuidv4();
    const json = fs.readFileSync(path);
    const game = assoc("meta", meta(id), JSON.parse(json));
    const summary = {
      ...info(game),
      ...game.meta,
      path: existing?.path ?? path,
    };

    updateConfig(assocPath(["summaries", summary.id], summary));

    resolve(summary.slug);
  });

export const openGame = () => {
  return dialog
    .showOpenDialog(getMainWindow(), {
      title: "Select game file",
      filters: [
        {
          name: "18xx-maker Game",
          extensions: ["json"],
        },
      ],
      properties: ["openFile"],
    })
    .then(({ canceled, filePaths }) => {
      if (canceled) {
        return undefined;
      } else {
        return saveGamePath(filePaths[0]);
      }
    });
};
