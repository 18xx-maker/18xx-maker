import React, { createContext, useContext, useEffect } from "react";
import { Redirect, useLocation, matchPath } from "react-router-dom";

import { useAlert } from "./AlertContext";

// import useSessionState from "../util/useSessionState";
import useLocalState from "../util/useLocalState";

import { games } from "../data";

import { assoc, equals, is, isNil, replace } from "ramda";

import { isElectron } from "../util";

const GameContext = createContext({ game: null });

// Given a File object returns a promise with the json data
const loadFile = (file) => {
  let id = replace(/\.json$/, "", file.name.split("/").pop());
  let slug = encodeURIComponent(id);

  return file
    .text()
    .then(JSON.parse)
    .then(assoc("meta", { id, slug }))
    .then((game) => {
      game.meta.minPlayers = game.players ? game.players[0].number : 0;
      game.meta.maxPlayers = game.players
        ? game.players[game.players.length - 1].number
        : 0;
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
  let game = games[id];

  if (!game) {
    return Promise.reject(`Game not found: ${id}`);
  }

  if (game && isElectron) {
    let ipcRenderer = window.require("electron").ipcRenderer;
    ipcRenderer.send("watch"); // Not sending a file path to stop watching this file
  }

  return Promise.resolve(game);
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

  // Update game format
  if (!game.meta && game.id) {
    game.meta = {
      id: game.id,
      slug: encodeURIComponent(game.id),
      minPlayers: game.players ? game.players[0].number : 0,
      maxPlayers: game.players
        ? game.players[game.players.length - 1].number
        : 0,
    };
    delete game.id;
    delete game.slug;
    setGame(game);
  }

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
    if (isNil(game) || match.params.slug !== game.meta.id) {
      // Try loading the other game if it's a bundled one
      if (games[match.params.slug]) {
        loadGame(match.params.slug);
      } else {
        sendAlert(
          "error",
          `Unable to load ${match.params.slug}, please load the json file directly if you wish to work on it.`,
        );
        return <Redirect to="/games/" />;
      }
    } else if (
      !isNil(game) &&
      games[match.params.slug] &&
      match.params.slug === game.meta.id
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
