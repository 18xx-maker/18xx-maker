import fs from "node:fs";
import { basename } from "node:path";

import Promise from "bluebird";
import { dialog } from "electron";

import { assocPath } from "ramda";

import { addMeta, getGameSummary } from "../../src/util/loading.js";
import { updateConfig, updateSummaries } from "./config.js";
import { getMainWindow } from "./window.js";

export const TYPE = "electron";

// Need to redefine this using basename to work on windows machines
export const getID = (filename) => basename(filename, ".json");

export const loadGame = (path) => {
  return new Promise((resolve) => {
    let json = fs.readFileSync(path);
    let game = addMeta(TYPE, getID(path), JSON.parse(json));
    updateSummaries(game);
    resolve(game);
  });
};

export const saveGamePath = (path) => {
  return new Promise((resolve) => {
    let id = getID(path);
    let json = fs.readFileSync(path);
    let game = addMeta(TYPE, id, JSON.parse(json));
    let summary = {
      ...getGameSummary(game),
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
