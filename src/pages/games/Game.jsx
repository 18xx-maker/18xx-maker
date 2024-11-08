import { Outlet, useMatch, useNavigate } from "react-router";

import { useGame } from "../../context/GameContext";

const Game = () => {
  const { game } = useGame();
  const navigate = useNavigate();
  const match = useMatch("/games/:slug/*");

  if (!game) {
    return null;
  }

  if (match && game.meta.slug !== match.params.slug) {
    navigate(match.url);
  }

  return <Outlet />;
};

export default Game;
