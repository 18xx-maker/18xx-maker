import { useMatch } from "react-router";

import { useGame } from "@/hooks/game";

export const useEditor = () => {
  const game = useGame();
  const gameMatch = useMatch("/games/:slug/*");

  if (!game || !gameMatch) {
    return false;
  }

  // The problems page is a plain page, like the info page
  return !["", "problems"].includes(gameMatch.params["*"]);
};

export default useEditor;
