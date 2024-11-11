import { useMatch } from "react-router";
import { useGame } from "@/hooks/game";

export const useSideMenu = () => {
  const game = useGame();
  const gameMatch = useMatch("/games/*");
  const needsGameMenu = game && gameMatch && gameMatch.params["*"] != "";
  const needsDocsMenu = !!useMatch("/docs/*");
  const needsElementsMenu = !!useMatch("/elements/*");

  return needsGameMenu || needsDocsMenu || needsElementsMenu;
};

export default useSideMenu;
