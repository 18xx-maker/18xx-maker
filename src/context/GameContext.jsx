import React, { createContext, useContext, useEffect } from "react";
import { Redirect, useLocation, matchPath } from "react-router-dom";

import { useAlert } from "./AlertContext";

// import useSessionState from "../util/useSessionState";
import useLocalState from "../util/useLocalState";

import games from "../data/games";

import assoc from "ramda/src/assoc";
import equals from "ramda/src/equals";
import is from "ramda/src/is";
import isNil from "ramda/src/isNil";

import { isElectron } from "../util";

const path = require("path");

const GameContext = createContext({ game: null });

// Given a File object returns a promise with the json data
const loadFile = (file) => {
  let id = path.basename(file.name, ".json");
  let slug = encodeURIComponent(id);

  return file
    .text()
    .then(JSON.parse)
    .then(assoc("id", id))
    .then(assoc("slug", slug))
    .then((game) => {
      if (isElectron) {
        let ipcRenderer = window.require("electron").ipcRenderer;
        ipcRenderer.send("watch", file.path, id, slug);
      }
      return game;
    })
    .catch((err) => {
      console.error(err);
      return Promise.reject(`Error loading file: ${file.name}`);
    });
};

// Given a game id, attempts to find it locally
const loadBundledGame = (id) => {
  let gameInfo = games[id];

  if (!gameInfo) {
    return Promise.reject(`Game not found: ${id}`);
  }

  return import(
    /* webpackChunkName: "game.[request]" */ "../data/games/" + games[id].file
  )
    .then((game) => {
      if (game.default) {
        return game.default;
      }

      return game;
    })
    .then(assoc("id", gameInfo.id))
    .then(assoc("slug", gameInfo.slug))
    .then((game) => {
      if (isElectron) {
        let ipcRenderer = window.require("electron").ipcRenderer;
        ipcRenderer.send("watch"); // Not sending a file path to stop watching this file
      }
      return game;
    })
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

export const GameProvider = ({ children }) => {
  const sendAlert = useAlert();
  const [game, setGame] = useLocalState("game", null);
  const location = useLocation();

  const loadGame = (fileOrId) => {
    return loadFileOrId(fileOrId)
      .then((game) => {
        setGame(game);
        sendAlert("success", `${game.info.title} loaded`);
        return game;
      })
      .catch((err) => {
        sendAlert("error", err);
      });
  };

  const checkForChanges = (id) => {
    return loadBundledGame(id)
      .then((loadedGame) => {
        if (!equals(game, loadedGame)) {
          setGame(loadedGame);
          sendAlert("success", `${loadedGame.info.title} reloaded`);
          return loadedGame;
        }
      })
      .catch((err) => {
        sendAlert("error", err);
      });
  };

  // If we're running in electron, listen for game updates and load them
  useEffect(() => {
    if (isElectron) {
      let updateGame = (event, game) => {
        setGame(game);
        sendAlert("info", `${game.info.title} updated`);
      };

      let ipcRenderer = window.require("electron").ipcRenderer;
      ipcRenderer.on("watch", updateGame);

      return () => ipcRenderer.removeListener("watch", updateGame);
    }
  });

  // Now we test to see if the game we have loaded matches any url we are trying to hit and if not, fix it.
  const match = matchPath(location.pathname, {
    path: "/games/:slug/:component?",
  });
  if (match) {
    if (isNil(game) || match.params.slug !== game.id) {
      // Try loading the other game if it's a bundled one
      if (games[match.params.slug]) {
        loadGame(match.params.slug);
      } else {
        sendAlert(
          "error",
          `Unable to load ${match.params.slug}, please load the json file directly if you wish to work on it.`
        );
        return <Redirect to="/games/" />;
      }
    } else if (
      !isNil(game) &&
      games[match.params.slug] &&
      match.params.slug === game.id
    ) {
      checkForChanges(match.params.slug);
    }
  }

  const context = { game, loadGame };

  return (
    <GameContext.Provider value={context}>{children}</GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};

export default GameContext;
