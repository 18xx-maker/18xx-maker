import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useMatch } from "react-router";
import { useNavigate } from "react-router-dom";

import { useGame } from "@/hooks";
import { loadGame } from "@/state";
import capability from "@/util/capability";

const addRecent = (game) => {
  if (game && capability.electron) {
    window.api.addRecent(game.info.title, game.meta.slug);
  }
  return game;
};

const Game = () => {
  const game = useGame();
  const match = useMatch("/games/:slug/*");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!game || match.params.slug !== game.meta.slug) {
      dispatch(loadGame(match.params.slug))
        .then(addRecent)
        .catch(() => navigate("/games/"));
    }
  }, [match]);

  if (!game) {
    return null;
  }

  return <Outlet />;
};

export default Game;
