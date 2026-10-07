import { useGame } from "@/hooks/game";
import { useMatch } from "@/router";

export const useEditor = () => {
  const game = useGame();
  const gameMatch = useMatch("/games/:slug/*");

  if (!game || !gameMatch) {
    return false;
  }

  // The problems, changes and history pages are plain pages, like the info page
  return !["", "problems", "changes", "history"].includes(
    gameMatch.params["*"],
  );
};

export default useEditor;
