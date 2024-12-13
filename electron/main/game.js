import fs from "node:fs";

import Promise from "bluebird";
import { dialog } from "electron";
import { v4 as uuidv4 } from "uuid";

import { assoc, assocPath } from "ramda";

import { getConfig, info, updateConfig, updateSummaries } from "./config.js";
import { getMainWindow } from "./window.js";

export const TYPE = "electron";
const slug = (id) => `${TYPE}:${id}`;
const meta = (id) => ({
  id,
  type: TYPE,
  slug: slug(id),
});

export const loadGame = (id) => {
  const config = getConfig();
  const summary = config.summaries[id];

  return new Promise((resolve) => {
    const json = fs.readFileSync(summary.path);
    const game = assoc("meta", meta(id), JSON.parse(json));
    updateSummaries(game);
    resolve(game);
  });
};

export const saveGamePath = (path) => {
  return new Promise((resolve) => {
    const id = uuidv4();
    const json = fs.readFileSync(path);
    const game = assoc("meta", meta(id), JSON.parse(json));
    const summary = {
      ...info(game),
      ...game.meta,
      path,
    };

    updateConfig(assocPath(["summaries", summary.id], summary));

    resolve(summary.slug);
  });
};

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
