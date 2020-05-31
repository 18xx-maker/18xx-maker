import { useContext } from "react";
import { matchPath, useLocation } from "react-router";

import GameContext from "../context/GameContext";

export const needSideMenu = (location, game) => {
  let needGameMenu = !!(matchPath(location.pathname, { path: "/games" }) && game);
  let needDocsMenu = !!matchPath(location.pathname, { path: "/docs" });
  let needElementsMenu = !!matchPath(location.pathname, { path: "/elements" });
  return needGameMenu || needDocsMenu || needElementsMenu;
}

const IfSideMenu = ({children}) => {
  const location = useLocation();
  const { game } = useContext(GameContext);
  const needMenu = needSideMenu(location, game);

  return needMenu ? children : null;
};

export default IfSideMenu;
