import { createContext, useContext, useState } from "react";
import { useAlert } from "./AlertContext";

import useLocalState from "../util/useLocalState";

import games from "../data/games";

import assoc from "ramda/src/assoc";
import is from "ramda/src/is";

const GameContext = createContext({ game: null });

// Given a File object returns a promise with the json data
const loadFile = (file) => {
  return file
    .text()
    .then(JSON.parse)
    .then(assoc("id", "local"))
    .then(assoc("slug", "local"))
    .catch((err) => {
      console.error(err);
      return Promise.reject(`Error loading file: ${file.name}`);
    });
};

// Give a game id attempts to find it locally or in @18xx-maker/games
const loadBundledGame = (id) => {
  let gameInfo = games[id];

  if (!gameInfo) {
    return Promise.reject(`Game not found: ${id}`);
  }

  let importPromise;
  if (gameInfo.local) {
    importPromise = import(
      /* webpackChunkName: "game.[request]" */ "../data/games/" + games[id].file
    );
  } else {
    importPromise = import(
      /* webpackChunkName: "game.[request]" */ "@18xx-maker/games/games/" +
        games[id].file
    );
  }

  return importPromise
    .then(assoc("id", gameInfo.id))
    .then(assoc("slug", gameInfo.slug))
    .catch((err) => {
      console.error(err);
      return Promise.reject(`Error loading game: ${id}`);
    });
};

const loadFileOrId = (fileOrId) => {
  // If we have a file, we need to parse it
  if (is(File, fileOrId)) {
    return loadFile(fileOrId);
  }

  return loadBundledGame(fileOrId);
};

export const useGameProvider = (sendAlert) => {
  // Current local file that has been loaded
  const [localGame, setLocalGame] = useLocalState("game", null);

  // Current game that we're editing
  const [game, setGame] = useState(null);

  const loadGame = (fileOrId) => {
    return loadFileOrId(fileOrId)
      .then((game) => {
        if (game.id === "local") {
          // This is a local file, so save it
          setGame(null);
          setLocalGame(game);
        } else {
          setGame(game);
          setLocalGame(null);
        }
        sendAlert("success", `${game.info.title} loaded`);
      })
      .catch((err) => {
        sendAlert("error", err);
      });
  };

  const closeGame = () => {
    if (!game && !localGame) {
      sendAlert("error", "No game loaded");
      return;
    }

    let name = (game || localGame).info.title;

    setLocalGame(null);
    setGame(null);
    sendAlert("success", `${name} closed`);
  };

  return {
    game: game || localGame,
    loadGame,
    closeGame,
  };
};

export const useGame = () => {
  return useContext(GameContext);
};

export default GameContext;
