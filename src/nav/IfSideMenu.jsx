import { useContext } from "react";
import { useMatch } from "react-router";

import GameContext from "../context/GameContext";

export const needSideMenu = (game) => {
  let needGameMenu = !!(useMatch("/games/:slug/*") && game);
  let needDocsMenu = !!useMatch("/docs/*");
  let needElementsMenu = !!useMatch("/elements/*");
  return needGameMenu || needDocsMenu || needElementsMenu;
}

const IfSideMenu = ({children}) => {
  const { game } = useContext(GameContext);
  const needMenu = needSideMenu(game);
  return needMenu ? children : null;
};

export default IfSideMenu;
