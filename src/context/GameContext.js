import React, { createContext, useContext } from "react";
import { Redirect, useLocation, matchPath } from "react-router-dom";

import { useAlert } from "./AlertContext";

import useLocalState from "../util/useLocalState";

import games from "../data/games";

import assoc from "ramda/src/assoc";
import is from "ramda/src/is";
import isNil from "ramda/src/isNil";

const path = require("path");

const GameContext = createContext({ game: null });

// Given a File object returns a promise with the json data
const loadFile = (file) => {
  let basename = path.basename(file.name, ".json");

  return file
    .text()
    .then(JSON.parse)
    .then(assoc("id", basename))
    .then(assoc("slug", encodeURIComponent(basename)))
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
