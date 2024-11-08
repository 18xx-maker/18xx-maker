import { useMatch } from "react-router";

export const useSideMenu = () => {
  const needsGameMenu = !!useMatch("/games/*");
  const needsDocsMenu = !!useMatch("/docs/*");
  const needsElementsMenu = !!useMatch("/elements/*");

  return needsGameMenu || needsDocsMenu || needsElementsMenu;
};

export default useSideMenu;
