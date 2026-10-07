import { useSelector } from "react-redux";

import { prop } from "ramda";

import { useMatch } from "@/router";
import { selectGame } from "@/state/selectors";

export const useLoadedGame = () => useSelector(prop("loadedGame"));

export const useGame = () => {
  const gameMatch = useMatch("/games/*");

  // Defaults to 1889 on all parts of the site that aren't a game page
  return useSelector((state) => selectGame(state, !!gameMatch));
};
