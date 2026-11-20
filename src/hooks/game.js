import { useContext } from "react";
import { useSelector } from "react-redux";

import { prop } from "ramda";

import GameContext from "@/context/GameContext";
import { useMatch } from "@/router";
import { selectGame } from "@/state/selectors";

export const useLoadedGame = () => useSelector(prop("loadedGame"));

export const useGame = () => {
  const override = useContext(GameContext);
  const gameMatch = useMatch("/games/*");

  // Defaults to 1889 on all parts of the site that aren't a game page
  const game = useSelector((state) => selectGame(state, !!gameMatch));

  return override ? override.game : game;
};
