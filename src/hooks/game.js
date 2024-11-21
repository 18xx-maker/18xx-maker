import { useSelector } from "react-redux";
import { useMatch } from "react-router";
import { prop } from "ramda";

import { games } from "@/data";

export const useLoadedGame = () => useSelector(prop("loadedGame"));

export const useGame = () => {
  const gameMatch = useMatch("/games/*");
  const game = useSelector(prop("game"));

  if (gameMatch) {
    return game;
  }

  // Defaults to 1889 on all parts of the site that aren't a game page
  return games["1889"];
};
