import { useMatch } from "react-router";

export const useSideMenu = () => {
  const gameMatch = useMatch("/games/*");
  const needsGameMenu = gameMatch && gameMatch.params["*"] != "";
  const needsDocsMenu = !!useMatch("/docs/*");
  const needsElementsMenu = !!useMatch("/elements/*");

  return needsGameMenu || needsDocsMenu || needsElementsMenu;
};

export default useSideMenu;
